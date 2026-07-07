import Groq from 'groq-sdk';
import { GenWAIClient } from './GenWAIBridge';
import { getAssessmentRuntimeSession } from './AssessmentRuntimeStore';
import { getQuestionsForStandard } from '../data/isoQuestionnaires';
import { isoStandardsEnhanced } from '../data/isoStandards';
import type { AssessmentResult, AssessmentOrgProfile, GenWAgentName, Gap, RemediationAction, StandardAssessment } from '../types/assessment';
import type {
  ComplianceCopilotEvidence,
  ComplianceCopilotRequest,
  ComplianceCopilotResponse,
  CopilotContextClauseScore,
  CopilotContextGapSummary,
  CopilotContextRemediationSummary,
  CopilotContextSnapshot,
  CopilotContextStandardSummary,
  UploadedDocumentReference,
} from '../types/copilot';

const GROQ_MODEL = 'openai/gpt-oss-120b';
const MAX_HISTORY_MESSAGES = 6;
const MAX_DOCUMENT_SNIPPETS = 3;

interface CopilotResolvedContext {
  assessmentReference?: string;
  orgProfile?: AssessmentOrgProfile;
  uploadedDocuments: UploadedDocumentReference[];
  overallScore?: number;
  maturityLevel?: number;
  executiveSummary?: string;
  evidenceSummary?: string;
  standards: CopilotContextStandardSummary[];
  clauseScores: CopilotContextClauseScore[];
  gaps: CopilotContextGapSummary[];
  remediationActions: CopilotContextRemediationSummary[];
  orchestrationProvider: 'genw' | 'local' | 'hybrid' | 'unknown';
  documentSnippets: string[];
}

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function parseJsonResponse<T>(value: string): T {
  const trimmed = value.trim();
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse((jsonMatch ? jsonMatch[1] : trimmed).trim()) as T;
}

function buildClauseCatalog(result?: AssessmentResult) {
  if (!result) {
    return [] as CopilotContextClauseScore[];
  }

  return result.standardAssessments.flatMap((assessment) =>
    assessment.clauseScores.map((clause) => ({
      standard: assessment.standard,
      clauseId: clause.clauseId,
      clauseTitle: findClauseTitle(assessment.standard, clause.clauseId),
      score: clause.score,
      finding: clause.finding,
    }))
  );
}

function buildStandardsSummary(result?: AssessmentResult) {
  if (!result) {
    return [] as CopilotContextStandardSummary[];
  }

  return result.standardAssessments.map((assessment) => ({
    code: assessment.standard,
    name: assessment.name,
    overallScore: assessment.overallScore,
    maturityLevel: assessment.maturityLevel,
    summary: `${assessment.name} is assessed at ${assessment.overallScore}% with maturity level ${assessment.maturityLevel}.`,
  }));
}

function buildGapSummary(gaps?: Gap[]) {
  return (gaps || []).map((gap) => ({
    id: gap.id,
    standard: gap.standard,
    clauseRef: gap.clauseRef,
    title: gap.title,
    severity: gap.severity,
    description: gap.description,
  }));
}

function buildRemediationSummary(actions?: RemediationAction[]) {
  return (actions || []).map((action) => ({
    id: action.id,
    title: action.title,
    priority: action.priority,
    phase: action.phase,
    description: action.description,
    standard: action.standard,
    responsible: action.responsible,
  }));
}

function normalizePipelineProvider(provider?: string): 'genw' | 'local' | 'hybrid' | 'unknown' {
  if (provider === 'genw' || provider === 'local' || provider === 'hybrid') {
    return provider;
  }

  return 'unknown';
}

function findClauseTitle(standardCode: string, clauseId: string) {
  return isoStandardsEnhanced[standardCode]?.clauses.find((clause) => clause.id === clauseId)?.title || `Clause ${clauseId}`;
}

function mergeUniqueDocuments(primary: UploadedDocumentReference[], secondary: UploadedDocumentReference[]) {
  const seen = new Set<string>();
  return [...primary, ...secondary].filter((doc) => {
    const key = `${doc.savedPath || ''}|${doc.originalName}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function extractDocumentSnippets(documentText: string | undefined, question: string) {
  if (!documentText) {
    return [];
  }

  const tokens = [...new Set(question.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3))];
  const paragraphs = documentText
    .split(/\n{2,}|--- DOCUMENT SEPARATOR ---/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter((paragraph) => paragraph.length > 60)
    .slice(0, 200);

  const ranked = paragraphs
    .map((paragraph) => ({
      paragraph,
      score: tokens.reduce((sum, token) => sum + (paragraph.toLowerCase().includes(token) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_DOCUMENT_SNIPPETS)
    .map((item) => item.paragraph.slice(0, 280));

  return ranked;
}

function toResolvedContext(request: ComplianceCopilotRequest): CopilotResolvedContext {
  const runtimeMatch = request.assessmentId ? getAssessmentRuntimeSession(request.assessmentId) : null;
  const runtimeSession = runtimeMatch?.session;
  const runtimeResult = runtimeSession?.result;
  const requestContext = request.context || {};

  const standards = runtimeResult ? buildStandardsSummary(runtimeResult) : requestContext.standards || [];
  const clauseScores = runtimeResult ? buildClauseCatalog(runtimeResult) : requestContext.clauseScores || [];
  const gaps = runtimeResult ? buildGapSummary(runtimeResult.gaps) : requestContext.gaps || [];
  const remediationActions = runtimeResult ? buildRemediationSummary(runtimeResult.remediationActions) : requestContext.remediationActions || [];
  const uploadedDocuments = mergeUniqueDocuments(runtimeSession?.uploadedDocuments || [], requestContext.uploadedDocuments || []);
  const orchestrationProvider = normalizePipelineProvider(runtimeResult?.orchestration?.provider || requestContext.orchestration?.provider);

  return {
    assessmentReference: runtimeMatch?.sessionId || request.assessmentId,
    orgProfile: runtimeResult?.orgProfile || runtimeSession?.orgProfile || requestContext.orgProfile,
    uploadedDocuments,
    overallScore: runtimeResult?.overallScore || requestContext.overallScore,
    maturityLevel: runtimeResult?.maturityLevel || requestContext.maturityLevel,
    executiveSummary: requestContext.executiveSummary,
    evidenceSummary: runtimeResult?.evidenceValidation.summary || requestContext.evidenceSummary,
    standards,
    clauseScores,
    gaps,
    remediationActions,
    orchestrationProvider,
    documentSnippets: extractDocumentSnippets(runtimeSession?.documentText, request.message),
  };
}

function deriveRelevantGuidance(context: CopilotResolvedContext, question: string) {
  const standardMention = context.standards.find((standard) => question.toLowerCase().includes(standard.code.toLowerCase()));
  const topWeakClause = [...context.clauseScores].sort((left, right) => left.score - right.score)[0];
  const standardCode = standardMention?.code || topWeakClause?.standard;

  if (!standardCode) {
    return [];
  }

  const questions = getQuestionsForStandard(standardCode).slice(0, 3);
  if (topWeakClause) {
    const clauseQuestions = getQuestionsForStandard(standardCode).filter((item) => item.clauseRef === topWeakClause.clauseId).slice(0, 2);
    if (clauseQuestions.length > 0) {
      return clauseQuestions.map((item) => ({
        standard: standardCode,
        clause: item.clauseRef,
        requirement: item.question,
        guidance: item.legalBasis,
      }));
    }
  }

  return questions.map((item) => ({
    standard: standardCode,
    clause: item.clauseRef,
    requirement: item.question,
    guidance: item.legalBasis,
  }));
}

function buildAuditFriendlyFallback(question: string, context: CopilotResolvedContext): ComplianceCopilotResponse {
  const weakestStandard = [...context.standards].sort((left, right) => left.overallScore - right.overallScore)[0];
  const weakestClauses = [...context.clauseScores].sort((left, right) => left.score - right.score).slice(0, 3);
  const priorityGaps = [...context.gaps].sort((left, right) => severityWeight(right.severity) - severityWeight(left.severity)).slice(0, 3);
  const actions = context.remediationActions.slice(0, 3).map((action) => ({
    title: action.title,
    priority: toPriority(action.priority),
    rationale: action.description,
    owner: action.responsible,
    standard: action.standard,
  }));
  const isoGuidance = deriveRelevantGuidance(context, question);
  const contextSources = buildContextSourceList(context);
  const questionLower = question.toLowerCase();
  const evidence: ComplianceCopilotEvidence[] = [];

  if (context.orgProfile) {
    evidence.push({
      source: 'organization-profile',
      label: 'Organization profile',
      detail: `${context.orgProfile.company} in ${context.orgProfile.industry} with scope ${context.orgProfile.scope}.`,
    });
  }

  evidence.push(
    ...context.uploadedDocuments.slice(0, 2).map((doc) => ({
      source: 'uploaded-document' as const,
      label: doc.originalName,
      detail: `Uploaded source document${doc.mimetype ? ` (${doc.mimetype})` : ''}${doc.size ? `, ${Math.round(doc.size / 1024)} KB` : ''}.`,
    }))
  );

  evidence.push(
    ...weakestClauses.map((clause) => ({
      source: 'clause-score' as const,
      label: `${clause.standard} clause ${clause.clauseId}`,
      detail: `${clause.score}% score. ${clause.finding}`,
    }))
  );

  evidence.push(
    ...priorityGaps.map((gap) => ({
      source: 'gap-register' as const,
      label: `${gap.standard} clause ${gap.clauseRef}`,
      detail: `${gap.severity} severity gap: ${gap.title}. ${gap.description}`,
    }))
  );

  if (context.documentSnippets[0]) {
    evidence.push({
      source: 'uploaded-document',
      label: 'Relevant document excerpt',
      detail: context.documentSnippets[0],
    });
  }

  let directAnswer = 'The current assessment indicates the organization should focus on the weakest clauses and highest-severity gaps first.';
  if (questionLower.includes('low') || questionLower.includes('score')) {
    directAnswer = weakestStandard
      ? `${weakestStandard.name} is the lowest-scoring assessed domain at ${weakestStandard.overallScore}%, driven by weak clause-level evidence and open control gaps.`
      : directAnswer;
  } else if (questionLower.includes('remediation') || questionLower.includes('recommend')) {
    directAnswer = actions.length > 0
      ? `The most defensible remediation path is to execute the highest-priority actions already identified in the roadmap, starting with ${actions[0].title.toLowerCase()}.`
      : directAnswer;
  } else if (questionLower.includes('report') || questionLower.includes('summary')) {
    directAnswer = context.executiveSummary || `${context.orgProfile?.company || 'The organization'} is currently assessed at ${context.overallScore || 0}% overall maturity with ${context.gaps.length} open gaps.`;
  } else if (questionLower.includes('iso') || questionLower.includes('clause') || questionLower.includes('requirement')) {
    directAnswer = isoGuidance[0]
      ? `${isoGuidance[0].standard} clause ${isoGuidance[0].clause || 'guidance'} requires ${isoGuidance[0].requirement.toLowerCase()}.`
      : directAnswer;
  }

  return {
    headline: 'SentriX Copilot Response',
    directAnswer,
    explanation: [
      weakestStandard ? `${weakestStandard.name} is the main exposure domain in the current assessment.` : null,
      weakestClauses.length > 0 ? `Lowest clause scores: ${weakestClauses.map((clause) => `${clause.standard} ${clause.clauseId} (${clause.score}%)`).join(', ')}.` : null,
      priorityGaps.length > 0 ? `Priority gaps on record: ${priorityGaps.map((gap) => `${gap.standard} ${gap.clauseRef} ${gap.title}`).join('; ')}.` : null,
      context.evidenceSummary ? `Evidence validation summary: ${context.evidenceSummary}` : null,
    ].filter(Boolean).join(' '),
    evidence,
    recommendedActions: actions,
    isoGuidance,
    reportSummary: [
      context.executiveSummary || `${context.orgProfile?.company || 'The organization'} currently sits at ${context.overallScore || 0}% overall compliance maturity.`,
      weakestStandard ? `${weakestStandard.name} is the weakest standard currently on record.` : 'No standard-level summary is currently available.',
      `${context.gaps.length} gaps and ${context.remediationActions.length} remediation actions are available for audit follow-up.`,
    ],
    followUpQuestions: buildFollowUps(question, weakestStandard?.code || weakestClauses[0]?.standard),
    auditTrail: {
      responseMode: 'local',
      structuredFormat: 'compliance-copilot-v1',
      assessmentReference: context.assessmentReference,
      contextSources,
      pipelineProvider: context.orchestrationProvider,
      generatedAt: new Date().toISOString(),
      caveats: [
        context.documentSnippets.length === 0 ? 'No matching document excerpt was available for this question.' : 'Document evidence was sampled using question-keyword matching.',
        'This response is a local fallback summary because no upstream GenW or Groq response was used.',
      ],
    },
  };
}

function severityWeight(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    default:
      return 1;
  }
}

function toPriority(priority: string): 'critical' | 'high' | 'medium' | 'low' {
  const normalized = priority.toLowerCase();
  if (normalized === 'critical' || normalized === 'high' || normalized === 'medium' || normalized === 'low') {
    return normalized;
  }
  return 'medium';
}

function buildContextSourceList(context: CopilotResolvedContext) {
  return [
    context.orgProfile ? 'organization-profile' : null,
    context.uploadedDocuments.length > 0 ? 'uploaded-documents' : null,
    context.standards.length > 0 ? 'assessment-results' : null,
    context.clauseScores.length > 0 ? 'clause-scores' : null,
    context.gaps.length > 0 ? 'gap-register' : null,
    context.remediationActions.length > 0 ? 'remediation-roadmap' : null,
    context.orchestrationProvider !== 'unknown' ? 'genw-pipeline-metadata' : null,
  ].filter((value): value is string => Boolean(value));
}

function buildFollowUps(question: string, standardCode?: string) {
  const standardLabel = standardCode || 'the lowest-scoring standard';
  return [
    `Show me the weakest clauses for ${standardLabel}.`,
    'Which remediation actions should be completed in the next 30 days?',
    'Summarize the report for an audit committee update.',
  ].filter((item) => item.toLowerCase() !== question.toLowerCase());
}

function buildPrompt(request: ComplianceCopilotRequest, context: CopilotResolvedContext) {
  const condensedContext = {
    assessmentReference: context.assessmentReference,
    orgProfile: context.orgProfile,
    uploadedDocuments: context.uploadedDocuments,
    overallScore: context.overallScore,
    maturityLevel: context.maturityLevel,
    executiveSummary: context.executiveSummary,
    evidenceSummary: context.evidenceSummary,
    standards: context.standards,
    weakestClauseScores: [...context.clauseScores].sort((left, right) => left.score - right.score).slice(0, 8),
    topGaps: [...context.gaps].sort((left, right) => severityWeight(right.severity) - severityWeight(left.severity)).slice(0, 8),
    remediationActions: context.remediationActions.slice(0, 8),
    documentSnippets: context.documentSnippets,
    orchestrationProvider: context.orchestrationProvider,
  };

  return `You are the SentriX Copilot for an enterprise compliance workspace.
Your job is to answer questions about compliance assessments, explain weak scores, recommend remediation actions, summarize reports, and guide users through ISO requirements.
All responses must be structured, audit-friendly, and grounded in the provided context only.
Do not claim evidence you do not have. If evidence is missing, say so explicitly in the audit trail caveats.

Return strict JSON with this exact shape:
{
  "headline": string,
  "directAnswer": string,
  "explanation": string,
  "evidence": [{"source": string, "label": string, "detail": string}],
  "recommendedActions": [{"title": string, "priority": "critical"|"high"|"medium"|"low", "rationale": string, "owner"?: string, "standard"?: string, "clause"?: string}],
  "isoGuidance": [{"standard": string, "clause"?: string, "requirement": string, "guidance": string}],
  "reportSummary": [string],
  "followUpQuestions": [string],
  "auditTrail": {
    "responseMode": "genw"|"groq"|"local",
    "structuredFormat": "compliance-copilot-v1",
    "assessmentReference"?: string,
    "contextSources": [string],
    "pipelineProvider": "genw"|"local"|"hybrid"|"unknown",
    "generatedAt": string,
    "caveats": [string]
  }
}

Conversation history:
${JSON.stringify((request.conversationHistory || []).slice(-MAX_HISTORY_MESSAGES), null, 2)}

Context:
${JSON.stringify(condensedContext, null, 2)}

User question:
${request.message}`;
}

export class ComplianceCopilotService {
  private readonly genwClient = new GenWAIClient();

  async answer(request: ComplianceCopilotRequest): Promise<ComplianceCopilotResponse> {
    const context = toResolvedContext(request);
    const prompt = buildPrompt(request, context);

    if (this.genwClient.isConfigured()) {
      try {
        const response = await this.genwClient.executeAgent<ComplianceCopilotResponse>('Compliance Copilot Agent' as GenWAgentName, {
          question: request.message,
          history: (request.conversationHistory || []).slice(-MAX_HISTORY_MESSAGES),
          context,
          prompt,
        });

        return {
          ...response,
          auditTrail: {
            ...response.auditTrail,
            responseMode: 'genw',
            structuredFormat: 'compliance-copilot-v1',
            assessmentReference: response.auditTrail.assessmentReference || context.assessmentReference,
            pipelineProvider: response.auditTrail.pipelineProvider || context.orchestrationProvider,
            contextSources: response.auditTrail.contextSources?.length ? response.auditTrail.contextSources : buildContextSourceList(context),
            generatedAt: response.auditTrail.generatedAt || new Date().toISOString(),
          },
        };
      } catch {
      }
    }

    const groqClient = getGroqClient();
    if (groqClient) {
      try {
        const completion = await groqClient.chat.completions.create({
          model: GROQ_MODEL,
          temperature: 0.2,
          max_tokens: 1800,
          messages: [
            { role: 'system', content: 'You are an audit-friendly enterprise compliance copilot. Always return strict JSON only.' },
            { role: 'user', content: prompt },
          ],
        });

        const content = completion.choices?.[0]?.message?.content || '';
        const parsed = parseJsonResponse<ComplianceCopilotResponse>(content);
        return {
          ...parsed,
          auditTrail: {
            ...parsed.auditTrail,
            responseMode: 'groq',
            structuredFormat: 'compliance-copilot-v1',
            assessmentReference: parsed.auditTrail.assessmentReference || context.assessmentReference,
            pipelineProvider: parsed.auditTrail.pipelineProvider || context.orchestrationProvider,
            contextSources: parsed.auditTrail.contextSources?.length ? parsed.auditTrail.contextSources : buildContextSourceList(context),
            generatedAt: parsed.auditTrail.generatedAt || new Date().toISOString(),
          },
        };
      } catch {
      }
    }

    return buildAuditFriendlyFallback(request.message, context);
  }
}