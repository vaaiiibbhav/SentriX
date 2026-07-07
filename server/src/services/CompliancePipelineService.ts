import { v4 as uuidv4 } from 'uuid';
import {
  buildDocumentAgentPrompt,
  buildEvidenceValidationPrompt,
  buildGapAnalysisPrompt,
  buildPolicyGeneratorPrompt,
  buildRemediationPrompt,
  runAgent,
} from '../agents/agentRunner';
import { industryBenchmarks } from '../data/complianceKnowledgeBase';
import { isoStandardsEnhanced } from '../data/isoStandards';
import { getQuestionsForStandard } from '../data/isoQuestionnaires';
import { scoreAllStandards } from './HybridScoringService';
import { GenWAIClient, getGenWAIModuleForAgent } from './GenWAIBridge';
import type {
  AssessmentOrgProfile,
  AssessmentResult,
  ClauseMappingCandidate,
  ClauseMappingResult,
  EvidenceValidationResult,
  Gap,
  PipelineAgentExecution,
  PipelineAgentName,
  PolicyDocument,
  RemediationAction,
  StandardAssessment,
} from '../types/assessment';

export interface CompliancePipelineCallbacks {
  onAgentStart: (agentName: PipelineAgentName) => void;
  onAgentComplete: (agentName: PipelineAgentName, result: string) => void;
  onAgentError: (agentName: PipelineAgentName, error: string) => void;
  onLog: (message: string) => void;
  onComplete: (result: AssessmentResult) => void;
}

interface PipelineContext {
  documentText: string;
  standards: string[];
  orgProfile: AssessmentOrgProfile;
  parsedDocument?: Record<string, unknown>;
  clauseMappings?: ClauseMappingResult[];
  standardAssessments?: StandardAssessment[];
  evidenceValidation?: EvidenceValidationResult;
  gaps?: Gap[];
  remediationActions?: RemediationAction[];
}

function safeParseJSON<T>(text: string): T | null {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

function getMaturityLevel(score: number): number {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

function summarizeExecution(result: unknown): string {
  if (typeof result === 'string') {
    return result.slice(0, 240);
  }

  if (result && typeof result === 'object') {
    const candidate = result as Record<string, unknown>;
    if (typeof candidate.summary === 'string') {
      return candidate.summary;
    }
    if (Array.isArray(candidate.clauseScores)) {
      return `Processed ${candidate.clauseScores.length} clause-level results.`;
    }
    if (Array.isArray(candidate.gaps)) {
      return `Detected ${candidate.gaps.length} compliance gaps.`;
    }
    if (Array.isArray(candidate.actions)) {
      return `Generated ${candidate.actions.length} remediation actions.`;
    }
    if (Array.isArray(candidate.policyDocuments)) {
      return `Generated ${candidate.policyDocuments.length} policy documents.`;
    }
  }

  return 'Execution complete.';
}

function uniqueSignals(values: string[]) {
  return [...new Set(values.filter((value) => value && value.trim().length > 2).map((value) => value.trim()))];
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function buildClauseMappings(documentText: string, standards: string[]): ClauseMappingResult[] {
  const paragraphs = documentText
    .split(/\n+/)
    .map((paragraph) => normalizeWhitespace(paragraph))
    .filter((paragraph) => paragraph.length > 40)
    .slice(0, 250);

  const loweredDocument = documentText.toLowerCase();

  return standards.map((standardCode) => {
    const standard = isoStandardsEnhanced[standardCode];
    const questions = getQuestionsForStandard(standardCode);

    if (!standard) {
      return {
        standardCode,
        standardName: standardCode,
        mappedClauses: [],
        summary: `No clause library was found for ${standardCode}.`,
      };
    }

    const mappedClauses: ClauseMappingCandidate[] = standard.clauses
      .map((clause) => {
        const questionSignals = questions
          .filter((question) => question.clauseRef === clause.id)
          .flatMap((question) => [question.category, question.question, question.legalBasis, ...question.evidenceRequired])
          .flatMap((item) => item.toLowerCase().split(/[^a-z0-9]+/))
          .filter((item) => item.length > 4);

        const signals = uniqueSignals([...clause.keywords, ...questionSignals]).slice(0, 18);
        const matchedSignals = signals.filter((signal) => loweredDocument.includes(signal.toLowerCase()));

        let bestExcerpt = '';
        let bestExcerptScore = 0;
        paragraphs.forEach((paragraph) => {
          const paragraphLower = paragraph.toLowerCase();
          const hitCount = matchedSignals.filter((signal) => paragraphLower.includes(signal.toLowerCase())).length;
          if (hitCount > bestExcerptScore) {
            bestExcerptScore = hitCount;
            bestExcerpt = paragraph.slice(0, 260);
          }
        });

        const keywordScore = clause.keywords.filter((keyword) => loweredDocument.includes(keyword.toLowerCase())).length * 6;
        const questionScore = matchedSignals.length * 4;
        const excerptBonus = bestExcerptScore > 0 ? Math.min(bestExcerptScore * 3, 15) : 0;
        const relevanceScore = Math.min(100, keywordScore + questionScore + excerptBonus);

        return {
          clauseId: clause.id,
          clauseTitle: clause.title,
          category: clause.category,
          relevanceScore,
          matchedSignals: matchedSignals.slice(0, 6),
          excerpt: bestExcerpt,
        };
      })
      .filter((candidate) => candidate.relevanceScore > 0)
      .sort((left, right) => right.relevanceScore - left.relevanceScore)
      .slice(0, 12);

    return {
      standardCode,
      standardName: standard.fullName,
      mappedClauses,
      summary: mappedClauses.length > 0
        ? `Mapped ${mappedClauses.length} high-relevance clauses for ${standard.fullName}.`
        : `No high-confidence clause mappings were found for ${standard.fullName}; downstream scoring will rely on full-document analysis.`,
    };
  });
}

function buildClauseMappingPrompt(context: PipelineContext) {
  const standardDescriptions = context.standards.map((standardCode) => {
    const standard = isoStandardsEnhanced[standardCode];
    return standard
      ? `${standardCode} (${standard.fullName}) clauses: ${standard.clauses.slice(0, 12).map((clause) => `${clause.id} ${clause.title}`).join('; ')}`
      : standardCode;
  }).join('\n');

  return `Map the uploaded governance and policy content to the most relevant ISO clauses for the assessment scope.\n\nOrganization: ${context.orgProfile.company}, ${context.orgProfile.industry}, ${context.orgProfile.employees} employees\nScope: ${context.orgProfile.scope}\nStandards:\n${standardDescriptions}\n\nDocument excerpt:\n${context.documentText.slice(0, 7000)}\n\nReturn JSON: {"mappings": [{"standardCode": "ISO37001", "mappedClauses": [{"clauseId": "4.5", "clauseTitle": "Bribery risk assessment", "category": "Context", "relevanceScore": 81, "matchedSignals": ["risk assessment", "bribery risk"], "excerpt": "..."}], "summary": "..."}]}`;
}

function buildComplianceScoringPrompt(context: PipelineContext) {
  const mappingSummary = (context.clauseMappings || [])
    .map((mapping) => `${mapping.standardCode}: ${mapping.mappedClauses.length} mapped clauses`) 
    .join('; ');

  return `Perform compliance scoring for the requested ISO standards based on document evidence and clause mappings.\n\nOrganization: ${context.orgProfile.company}, ${context.orgProfile.industry}, ${context.orgProfile.employees} employees\nScope: ${context.orgProfile.scope}\nStandards: ${context.standards.join(', ')}\nClause mapping summary: ${mappingSummary || 'No clause mapping summary available'}\n\nDocument excerpt:\n${context.documentText.slice(0, 7000)}`;
}

export class CompliancePipelineService {
  private readonly genwClient = new GenWAIClient();
  private readonly executions: PipelineAgentExecution[] = [];

  constructor(private readonly callbacks: CompliancePipelineCallbacks) {}

  async run(
    documentText: string,
    standards: string[],
    orgProfile: AssessmentOrgProfile,
  ): Promise<AssessmentResult> {
    const context: PipelineContext = {
      documentText,
      standards,
      orgProfile,
    };

    context.parsedDocument = await this.executeDocumentParsing(context);
    context.clauseMappings = await this.executeClauseMapping(context);
    context.evidenceValidation = await this.executeEvidenceValidation(context);
    context.standardAssessments = await this.executeComplianceScoring(context);
    context.gaps = await this.executeGapDetection(context);
    context.remediationActions = await this.executeRemediationPlanning(context);
    const policyDocuments = await this.executePolicyGeneration(context);

    const overallScore = context.standardAssessments.length > 0
      ? Math.round(context.standardAssessments.reduce((sum, standard) => sum + standard.overallScore, 0) / context.standardAssessments.length)
      : 0;

    const providerMix = new Set(this.executions.map((execution) => execution.provider));
    const assessment: AssessmentResult = {
      id: uuidv4(),
      orgProfile,
      overallScore,
      maturityLevel: getMaturityLevel(overallScore),
      standardAssessments: context.standardAssessments,
      clauseMappings: context.clauseMappings,
      gaps: context.gaps,
      evidenceValidation: context.evidenceValidation,
      remediationActions: context.remediationActions,
      policyDocuments,
      orchestration: {
        provider: providerMix.size === 1 ? [...providerMix][0] : 'hybrid',
        executions: this.executions,
      },
      timestamp: new Date().toISOString(),
    };

    this.callbacks.onComplete(assessment);
    this.callbacks.onLog(`✓ Assessment Complete — Overall Score: ${overallScore}%`);
    return assessment;
  }

  private async executeWithFallback<T>(
    agentName: PipelineAgentName,
    payload: Record<string, unknown>,
    localRunner: () => Promise<T>,
  ): Promise<T> {
    const startedAt = new Date().toISOString();
    this.callbacks.onAgentStart(agentName);
    this.callbacks.onLog(`▶ ${agentName} — starting orchestration${this.genwClient.isConfigured() ? ' via GenW' : ' via local execution'}...`);

    const module = getGenWAIModuleForAgent(agentName);

    if (module && this.genwClient.isConfigured()) {
      try {
        const genwResult = await this.genwClient.executeAgent<T>(agentName, payload, (chunk) => {
          this.callbacks.onLog(`⎇ ${agentName} — ${chunk}`);
        });

        const summary = summarizeExecution(genwResult);
        const completedAt = new Date().toISOString();
        this.executions.push({
          agentName,
          provider: 'genw',
          moduleId: module.id,
          status: 'completed',
          startedAt,
          completedAt,
          summary,
        });
        this.callbacks.onAgentComplete(agentName, summary);
        return genwResult;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown GenW execution error';
        this.callbacks.onLog(`⚠ ${agentName} — GenW unavailable (${message}). Falling back to local execution.`);
      }
    }

    try {
      const result = await localRunner();
      const summary = summarizeExecution(result);
      const completedAt = new Date().toISOString();
      this.executions.push({
        agentName,
        provider: 'local',
        moduleId: module?.id,
        status: 'fallback',
        startedAt,
        completedAt,
        summary,
      });
      this.callbacks.onAgentComplete(agentName, `${summary} (local fallback)`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown pipeline error';
      const completedAt = new Date().toISOString();
      this.executions.push({
        agentName,
        provider: 'local',
        moduleId: module?.id,
        status: 'error',
        startedAt,
        completedAt,
        summary: message,
      });
      this.callbacks.onAgentError(agentName, message);
      throw error;
    }
  }

  private async executeDocumentParsing(context: PipelineContext): Promise<Record<string, unknown>> {
    const payload = {
      documentText: context.documentText,
      organization: context.orgProfile,
      standards: context.standards,
    };

    return this.executeWithFallback<Record<string, unknown>>(
      'Document Parsing Agent',
      payload,
      async () => {
        const prompt = `Analyze the following policy documents for ${context.orgProfile.company} (${context.orgProfile.industry} industry, ${context.orgProfile.employees} employees):\n\n${context.documentText}`;
        const response = await runAgent('Document Parsing Agent', buildDocumentAgentPrompt(), prompt, this.callbacks.onLog);
        return safeParseJSON<Record<string, unknown>>(response) || { summary: 'Document parsing completed with minimal structured output.' };
      },
    );
  }

  private async executeClauseMapping(context: PipelineContext): Promise<ClauseMappingResult[]> {
    const payload = {
      organization: context.orgProfile,
      standards: context.standards,
      parsedDocument: context.parsedDocument,
      prompt: buildClauseMappingPrompt(context),
    };

    return this.executeWithFallback<ClauseMappingResult[]>(
      'Clause Mapping Agent',
      payload,
      async () => buildClauseMappings(context.documentText, context.standards),
    );
  }

  private async executeEvidenceValidation(context: PipelineContext): Promise<EvidenceValidationResult> {
    const payload = {
      organization: context.orgProfile,
      clauseMappings: context.clauseMappings,
      parsedDocument: context.parsedDocument,
    };

    return this.executeWithFallback<EvidenceValidationResult>(
      'Evidence Validation Agent',
      payload,
      async () => {
        const prompt = `Validate the evidence quality for the following clause mappings and policy evidence.\n\nClause mappings:\n${JSON.stringify(context.clauseMappings, null, 2)}\n\nParsed document:\n${JSON.stringify(context.parsedDocument, null, 2)}\n\nOrganization: ${context.orgProfile.company}, ${context.orgProfile.industry}, ${context.orgProfile.employees} employees`;
        const response = await runAgent('Evidence Validation Agent', buildEvidenceValidationPrompt(), prompt, this.callbacks.onLog);
        const parsed = safeParseJSON<Partial<EvidenceValidationResult>>(response);

        return {
          evidenceItems: parsed?.evidenceItems || [],
          overallEvidenceScore: parsed?.overallEvidenceScore || 0,
          sufficientCount: parsed?.sufficientCount || 0,
          partialCount: parsed?.partialCount || 0,
          insufficientCount: parsed?.insufficientCount || 0,
          missingCount: parsed?.missingCount || 0,
          crossStandardOpportunities: parsed?.crossStandardOpportunities || 0,
          summary: parsed?.summary || 'Evidence validation completed.',
        };
      },
    );
  }

  private async executeComplianceScoring(context: PipelineContext): Promise<StandardAssessment[]> {
    const payload = {
      organization: context.orgProfile,
      standards: context.standards,
      clauseMappings: context.clauseMappings,
      evidenceValidation: context.evidenceValidation,
      prompt: buildComplianceScoringPrompt(context),
    };

    return this.executeWithFallback<StandardAssessment[]>(
      'Compliance Scoring Agent',
      payload,
      async () => {
        const results = await scoreAllStandards(context.documentText, context.standards, this.callbacks.onLog);
        return results.map((result) => ({
          standard: result.standard,
          name: result.name,
          overallScore: result.overallScore,
          maturityLevel: result.maturityLevel,
          scoringMethod: result.scoringMethod,
          confidence: result.averageConfidence,
          clauseScores: result.clauseScores.map((clauseScore) => ({
            clauseId: clauseScore.clauseId,
            score: clauseScore.score,
            finding: clauseScore.finding,
          })),
        }));
      },
    );
  }

  private async executeGapDetection(context: PipelineContext): Promise<Gap[]> {
    const benchmark = industryBenchmarks[context.orgProfile.industry] || industryBenchmarks.Other;
    const payload = {
      organization: context.orgProfile,
      standards: context.standardAssessments,
      evidenceValidation: context.evidenceValidation,
      benchmark,
    };

    return this.executeWithFallback<Gap[]>(
      'Gap Detection Agent',
      payload,
      async () => {
        const gapPrompt = `Analyze the following assessment results and identify compliance gaps:\n\n${context.standardAssessments?.map((assessment) => `${assessment.standard} (${assessment.name}): Overall ${assessment.overallScore}% (Maturity Level ${assessment.maturityLevel}, Method: ${assessment.scoringMethod || 'hybrid'}, Confidence: ${assessment.confidence || 'N/A'}%)\nClauses: ${JSON.stringify(assessment.clauseScores)}`).join('\n\n')}\n\nIndustry Benchmarks (${benchmark.industry}): ${Object.entries(benchmark.averageScores).map(([key, value]) => `${key}: ${value}%`).join(', ')}\nCommon industry gaps: ${benchmark.commonGaps.join('; ')}\nRegulatory pressure: ${benchmark.regulatoryPressure}\n\nEvidence validation summary: ${context.evidenceValidation?.summary || 'Not available'}\nClause mappings: ${JSON.stringify(context.clauseMappings, null, 2)}\n\nOrganization: ${context.orgProfile.company}, ${context.orgProfile.industry}, ${context.orgProfile.employees} employees\nScope: ${context.orgProfile.scope}`;
        const response = await runAgent('Gap Detection Agent', buildGapAnalysisPrompt(), gapPrompt, this.callbacks.onLog);
        const parsed = safeParseJSON<{ gaps?: Gap[] }>(response);
        return parsed?.gaps || [];
      },
    );
  }

  private async executeRemediationPlanning(context: PipelineContext): Promise<RemediationAction[]> {
    const payload = {
      organization: context.orgProfile,
      gaps: context.gaps,
      evidenceValidation: context.evidenceValidation,
    };

    return this.executeWithFallback<RemediationAction[]>(
      'Remediation Planning Agent',
      payload,
      async () => {
        const prompt = `Create a phased remediation roadmap for these gaps:\n\n${JSON.stringify(context.gaps, null, 2)}\n\nEvidence Validation Summary: ${context.evidenceValidation?.summary || 'Not available'}\nEvidence Quality: ${context.evidenceValidation?.overallEvidenceScore || 0}% overall (${context.evidenceValidation?.sufficientCount || 0} sufficient, ${context.evidenceValidation?.insufficientCount || 0} insufficient, ${context.evidenceValidation?.missingCount || 0} missing)\n\nOrganization context: ${context.orgProfile.company}, ${context.orgProfile.industry}, ${context.orgProfile.employees} employees`;
        const response = await runAgent('Remediation Planning Agent', buildRemediationPrompt(), prompt, this.callbacks.onLog);
        const parsed = safeParseJSON<{ actions?: RemediationAction[] }>(response);
        return parsed?.actions || [];
      },
    );
  }

  private async executePolicyGeneration(context: PipelineContext): Promise<PolicyDocument[]> {
    const payload = {
      organization: context.orgProfile,
      standards: context.standardAssessments,
      gaps: context.gaps,
      remediationActions: context.remediationActions,
      evidenceValidation: context.evidenceValidation,
    };

    return this.executeWithFallback<PolicyDocument[]>(
      'Policy Generation Agent',
      payload,
      async () => {
        const prompt = `Generate complete, 100% compliant policy documents for each standard based on the assessment results, gaps, evidence validation, and remediation actions:\n\nAssessment Results:\n${context.standardAssessments?.map((assessment) => `${assessment.standard} (${assessment.name}): Overall ${assessment.overallScore}%, ${assessment.clauseScores.length} clauses assessed`).join('\n')}\n\nGaps Identified (${context.gaps?.length || 0} total):\n${JSON.stringify(context.gaps, null, 2)}\n\nRemediation Actions (${context.remediationActions?.length || 0} total):\n${JSON.stringify(context.remediationActions, null, 2)}\n\nEvidence Validation Summary: ${context.evidenceValidation?.summary || 'Not available'}\n\nOrganization: ${context.orgProfile.company}, ${context.orgProfile.industry}, ${context.orgProfile.employees} employees\nScope: ${context.orgProfile.scope}\n\nGenerate a complete, ready-to-adopt policy document for each standard that addresses ALL identified gaps and achieves 100% compliance.`;
        const response = await runAgent('Policy Generation Agent', buildPolicyGeneratorPrompt(), prompt, this.callbacks.onLog);
        const parsed = safeParseJSON<{ policyDocuments?: PolicyDocument[] }>(response);
        return parsed?.policyDocuments || [];
      },
    );
  }
}