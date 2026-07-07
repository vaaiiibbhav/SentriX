import type {
  AssessmentResult,
  BackendAssessmentResult,
  ClauseScore,
  Gap,
  RemediationAction,
  UploadedDocumentInfo,
} from '../types';
import { getMaturityLabel } from './helpers';

const STANDARD_NAMES: Record<string, string> = {
  ISO37001: 'Anti-Bribery Management Systems',
  ISO37301: 'Compliance Management Systems',
  ISO27001: 'Information Security Management Systems',
  ISO9001: 'Quality Management Systems',
};

function toFrontendScope(scope: string): 'full' | 'quick' | 'targeted' {
  if (scope === 'quick' || scope === 'targeted') {
    return scope;
  }
  return 'full';
}

function toClauseStatus(score: number): ClauseScore['status'] {
  if (score >= 80) return 'implemented';
  if (score >= 60) return 'partial';
  if (score >= 40) return 'planned';
  return 'not-started';
}

function toImpact(severity: string): Gap['impact'] {
  const normalized = severity.toLowerCase();
  if (normalized === 'critical' || normalized === 'high' || normalized === 'medium' || normalized === 'low') {
    return normalized;
  }
  return 'medium';
}

function toCategory(description: string): Gap['category'] {
  const value = description.toLowerCase();
  if (value.includes('train')) return 'training';
  if (value.includes('system') || value.includes('control') || value.includes('security')) return 'technology';
  if (value.includes('policy')) return 'policy';
  if (value.includes('document') || value.includes('record')) return 'documentation';
  return 'process';
}

function summarizeStandard(score: number, name: string, gapCount: number): string {
  const maturity = getMaturityLabel(score >= 90 ? 5 : score >= 75 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : 1);
  if (gapCount === 0) {
    return `${name} is operating at ${maturity} maturity with no material gaps detected in the submitted evidence.`;
  }
  return `${name} is currently assessed at ${score}% with ${gapCount} priority gaps requiring remediation to reach a defensible control posture.`;
}

function buildClauseScores(result: BackendAssessmentResult, standardCode: string): ClauseScore[] {
  const standardGaps = result.gaps.filter((gap) => gap.standard === standardCode);

  return result.standardAssessments
    .find((assessment) => assessment.standard === standardCode)
    ?.clauseScores.map((clause) => {
      const relatedGap = standardGaps.find((gap) => gap.clauseRef === clause.clauseId);
      return {
        clauseId: clause.clauseId,
        clauseTitle: `Clause ${clause.clauseId}`,
        score: clause.score,
        status: toClauseStatus(clause.score),
        evidence: clause.finding,
        gap: relatedGap?.description || (clause.score < 60 ? clause.finding : ''),
        remediation: relatedGap ? `Close ${relatedGap.title.toLowerCase()} and implement evidencable control ownership.` : '',
        finding: clause.finding,
        confidence: result.standardAssessments.find((assessment) => assessment.standard === standardCode)?.confidence,
      };
    }) || [];
}

function buildGaps(result: BackendAssessmentResult): Gap[] {
  return result.gaps.map((gap) => ({
    id: gap.id,
    clauseId: gap.clauseRef,
    standardCode: gap.standard,
    title: gap.title,
    description: gap.description,
    impact: toImpact(gap.severity),
    effort: Math.max(5, gap.effortScore * 5),
    impactScore: gap.impactScore,
    effortScore: gap.effortScore,
    crossStandardOverlap: result.gaps
      .filter((candidate) => candidate.id !== gap.id && candidate.clauseRef === gap.clauseRef)
      .map((candidate) => candidate.standard),
    category: toCategory(gap.description),
    legalSeverity: gap.severity,
  }));
}

function buildRemediationActions(result: BackendAssessmentResult, gaps: Gap[]): RemediationAction[] {
  return result.remediationActions.map((action) => {
    const phase = action.phase === 1 || action.phase === 2 || action.phase === 3 ? action.phase : 3;
    const priority = action.priority.toLowerCase();
    const standardGaps = gaps.filter((gap) => gap.standardCode === action.standard);
    const linkedGapIds = standardGaps
      .filter((gap) => {
        if (phase === 1) return gap.impact === 'critical' || gap.impact === 'high';
        if (phase === 2) return gap.impact === 'medium' || gap.impact === 'high';
        return true;
      })
      .map((gap) => gap.id);

    return {
      id: action.id,
      title: action.title,
      phase,
      phaseLabel: phase === 1 ? 'Immediate Controls' : phase === 2 ? 'Stabilization' : 'Sustainable Compliance',
      clauseIds: standardGaps.slice(0, 3).map((gap) => gap.clauseId),
      standards: [action.standard],
      responsibleFunction: action.responsible,
      effortDays: action.effortDays,
      priority: priority === 'critical' || priority === 'high' || priority === 'medium' || priority === 'low' ? priority : 'medium',
      successMetric: `Closure of ${Math.max(1, linkedGapIds.length)} linked finding${linkedGapIds.length === 1 ? '' : 's'}`,
      description: action.description,
      gapIds: linkedGapIds,
    };
  });
}

function buildExecutiveSummary(result: BackendAssessmentResult, gaps: Gap[]): string {
  const criticalGaps = gaps.filter((gap) => gap.impact === 'critical').length;
  const highGaps = gaps.filter((gap) => gap.impact === 'high').length;
  const strongest = [...result.standardAssessments].sort((left, right) => right.overallScore - left.overallScore)[0];
  const weakest = [...result.standardAssessments].sort((left, right) => left.overallScore - right.overallScore)[0];

  return `${result.orgProfile.company} has been assessed at ${result.overallScore}% overall maturity level ${result.maturityLevel}. The strongest domain is ${strongest?.standard || 'the current control environment'} at ${strongest?.overallScore || result.overallScore}%, while ${weakest?.standard || 'the weakest assessed area'} remains the primary legal and operational exposure. ${criticalGaps} critical and ${highGaps} high-severity gaps require priority remediation to sustain audit defensibility and support certification readiness.`;
}

export function adaptAssessmentResult(
  result: BackendAssessmentResult,
  options?: { sessionId?: string | null; uploadedDocuments?: UploadedDocumentInfo[] }
): AssessmentResult {
  const gaps = buildGaps(result);
  const remediation = buildRemediationActions(result, gaps);
  const standards = result.standardAssessments.map((assessment) => {
    const clauseScores = buildClauseScores(result, assessment.standard);
    const gapCount = gaps.filter((gap) => gap.standardCode === assessment.standard).length;

    return {
      standardCode: assessment.standard,
      standardName: assessment.name || STANDARD_NAMES[assessment.standard] || assessment.standard,
      overallScore: assessment.overallScore,
      maturityLevel: assessment.maturityLevel,
      maturityLabel: getMaturityLabel(assessment.maturityLevel),
      clauseScores,
      summary: summarizeStandard(assessment.overallScore, assessment.name || STANDARD_NAMES[assessment.standard] || assessment.standard, gapCount),
      scoringMethod: assessment.scoringMethod,
      confidence: assessment.confidence,
    };
  });

  return {
    id: result.id,
    orgProfile: {
      companyName: result.orgProfile.company,
      industrySector: result.orgProfile.industry,
      employeeCount: result.orgProfile.employees,
      assessmentScope: toFrontendScope(result.orgProfile.scope),
    },
    timestamp: result.timestamp,
    overallScore: result.overallScore,
    overallMaturity: result.maturityLevel,
    overallMaturityLabel: getMaturityLabel(result.maturityLevel),
    standards,
    gaps,
    evidenceValidation: result.evidenceValidation,
    remediation,
    policyDocuments: result.policyDocuments,
    executiveSummary: buildExecutiveSummary(result, gaps),
    sessionId: options?.sessionId || undefined,
    uploadedDocuments: options?.uploadedDocuments,
    orchestration: result.orchestration,
  };
}
