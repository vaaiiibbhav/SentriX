import type {
  AgentLogEntry,
  AgentStatus,
  AssessmentResult,
  Gap,
  RemediationAction,
  StandardAssessment,
  StandardCode,
} from '../types';

export const standardLabels: Record<string, string> = {
  ISO37001: 'ISO 37001',
  ISO37301: 'ISO 37301',
  ISO27001: 'ISO 27001',
  ISO9001: 'ISO 9001',
};

export const standardColors: Record<string, string> = {
  ISO37001: '#dd6b20',
  ISO37301: '#86bc25',
  ISO27001: '#0076a8',
  ISO9001: '#70563c',
};

export function getStandardLabel(code: string) {
  return standardLabels[code] || code.replace('ISO', 'ISO ');
}

export function getSeverityWeight(severity: string) {
  switch (severity) {
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

export function sortGapsByPriority(gaps: Gap[]) {
  return [...gaps].sort((left, right) => {
    const severityDelta = getSeverityWeight(right.impact) - getSeverityWeight(left.impact);
    if (severityDelta !== 0) return severityDelta;
    return right.impactScore - left.impactScore;
  });
}

export function getRiskDistribution(gaps: Gap[]) {
  return {
    critical: gaps.filter((gap) => gap.impact === 'critical').length,
    high: gaps.filter((gap) => gap.impact === 'high').length,
    medium: gaps.filter((gap) => gap.impact === 'medium').length,
    low: gaps.filter((gap) => gap.impact === 'low').length,
  };
}

export function getStandardStatus(score: number) {
  if (score >= 85) return 'compliant';
  if (score >= 60) return 'partial';
  return 'non-compliant';
}

export function getControlCoverage(standard: StandardAssessment) {
  const total = standard.clauseScores.length || 1;
  const implemented = standard.clauseScores.filter((clause) => clause.score >= 85).length;
  const partial = standard.clauseScores.filter((clause) => clause.score >= 50 && clause.score < 85).length;
  const missing = total - implemented - partial;

  return {
    implemented,
    partial,
    missing,
    implementedPct: Math.round((implemented / total) * 100),
  };
}

export function getRemediationSummary(actions: RemediationAction[]) {
  const totalEffortDays = actions.reduce((sum, action) => sum + action.effortDays, 0);
  const byPhase = [1, 2, 3].map((phase) => ({
    phase,
    count: actions.filter((action) => action.phase === phase).length,
  }));

  return { totalEffortDays, byPhase };
}

export interface ComplianceReadinessScenario {
  id: 'current-state' | 'top-3-gaps' | 'critical-first' | 'phase-1-quick-wins' | 'full-roadmap';
  label: string;
  description: string;
  gapIds: string[];
}

export interface ComplianceReadinessMilestone {
  phase: 1 | 2 | 3;
  phaseLabel: string;
  timeWindow: string;
  projectedScore: number;
  delta: number;
  effortDays: number;
  addressedGapCount: number;
  uncoveredGapCount: number;
  actions: RemediationAction[];
  fallbackSummary?: string;
  riskMix: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface ComplianceReadinessForecast {
  currentScore: number;
  selectedGapIds: string[];
  selectedGaps: Gap[];
  projectedScore: number;
  projectedImprovement: number;
  totalEffortDays: number;
  milestones: ComplianceReadinessMilestone[];
  standardProgress: Array<{
    standardCode: string;
    label: string;
    current: number;
    projected: number;
    delta: number;
  }>;
}

function normalizeStandardCode(code: string) {
  return code.replace(/\s+/g, '').toUpperCase();
}

function dedupe<T>(items: T[]) {
  return [...new Set(items)];
}

function getGapUplift(gap: Gap) {
  const base = gap.impact === 'critical' ? 8 : gap.impact === 'high' ? 5 : gap.impact === 'medium' ? 3 : 1;
  const overlapBonus = gap.crossStandardOverlap.length > 0 ? 1 : 0;
  return base + overlapBonus;
}

export function getResolvedGapIdsForAction(action: RemediationAction, gaps: Gap[]) {
  if (action.gapIds && action.gapIds.length > 0) {
    return dedupe(action.gapIds.filter((id) => gaps.some((gap) => gap.id === id)));
  }

  const actionStandards = new Set(action.standards.map(normalizeStandardCode));
  const actionClauses = new Set(action.clauseIds);

  return gaps
    .filter((gap) => {
      const standardMatch = actionStandards.size === 0 || actionStandards.has(normalizeStandardCode(gap.standardCode));
      const clauseMatch = actionClauses.size === 0 || actionClauses.has(gap.clauseId);
      return standardMatch && clauseMatch;
    })
    .map((gap) => gap.id);
}

export function getComplianceReadinessScenarios(assessment: AssessmentResult): ComplianceReadinessScenario[] {
  const sortedGaps = sortGapsByPriority(assessment.gaps);
  const phaseOneGapIds = assessment.remediation
    .filter((action) => action.phase === 1)
    .flatMap((action) => getResolvedGapIdsForAction(action, assessment.gaps));

  return [
    {
      id: 'current-state',
      label: 'Current state',
      description: 'No remediation actions applied yet.',
      gapIds: [],
    },
    {
      id: 'top-3-gaps',
      label: 'Top 3 gaps',
      description: 'What happens if the three highest-priority gaps are closed first?',
      gapIds: sortedGaps.slice(0, 3).map((gap) => gap.id),
    },
    {
      id: 'critical-first',
      label: 'Critical first',
      description: 'Focus on critical and high-severity exposures before broader uplift work.',
      gapIds: sortedGaps.filter((gap) => gap.impact === 'critical' || gap.impact === 'high').map((gap) => gap.id),
    },
    {
      id: 'phase-1-quick-wins',
      label: 'Phase 1 quick wins',
      description: 'Simulate only the first tranche of remediation actions.',
      gapIds: dedupe(phaseOneGapIds),
    },
    {
      id: 'full-roadmap',
      label: 'Full roadmap',
      description: 'Apply the complete remediation roadmap across all phases.',
      gapIds: assessment.gaps.map((gap) => gap.id),
    },
  ];
}

export function buildComplianceReadinessForecast(
  assessment: AssessmentResult,
  selectedGapIdsInput: Iterable<string>
): ComplianceReadinessForecast {
  const selectedGapIds = dedupe([...selectedGapIdsInput].filter((id) => assessment.gaps.some((gap) => gap.id === id)));
  const selectedGapSet = new Set(selectedGapIds);
  const selectedGaps = assessment.gaps.filter((gap) => selectedGapSet.has(gap.id));
  const actionsWithLinks = assessment.remediation.map((action) => ({
    action,
    linkedGapIds: getResolvedGapIdsForAction(action, assessment.gaps),
  }));

  const assignedPhaseByGap = new Map<string, 1 | 2 | 3>();
  actionsWithLinks.forEach(({ action, linkedGapIds }) => {
    linkedGapIds.forEach((gapId) => {
      if (!selectedGapSet.has(gapId)) return;
      const current = assignedPhaseByGap.get(gapId);
      if (!current || action.phase < current) {
        assignedPhaseByGap.set(gapId, action.phase);
      }
    });
  });

  selectedGapIds.forEach((gapId) => {
    if (!assignedPhaseByGap.has(gapId)) {
      assignedPhaseByGap.set(gapId, 3);
    }
  });

  const timeWindowByPhase: Record<1 | 2 | 3, string> = {
    1: '0-30 days',
    2: '30-60 days',
    3: '60-120 days',
  };

  const phaseLabelByPhase: Record<1 | 2 | 3, string> = {
    1: 'Phase 1',
    2: 'Phase 2',
    3: 'Phase 3',
  };

  let previousProjectedScore = assessment.overallScore;
  const milestones = ([1, 2, 3] as const).map((phase) => {
    const cumulativeGapIds = selectedGapIds.filter((gapId) => (assignedPhaseByGap.get(gapId) || 3) <= phase);
    const cumulativeGapSet = new Set(cumulativeGapIds);
    const cumulativeGaps = assessment.gaps.filter((gap) => cumulativeGapSet.has(gap.id));
    const phaseActions = actionsWithLinks
      .filter(({ action, linkedGapIds }) => action.phase === phase && linkedGapIds.some((gapId) => selectedGapSet.has(gapId)))
      .map(({ action }) => action);

    const improvementByStandard = cumulativeGaps.reduce<Record<string, number>>((accumulator, gap) => {
      accumulator[gap.standardCode] = (accumulator[gap.standardCode] || 0) + getGapUplift(gap);
      return accumulator;
    }, {});

    const standardProgress = assessment.standards.map((standard) => ({
      current: standard.overallScore,
      projected: Math.min(100, standard.overallScore + (improvementByStandard[standard.standardCode] || 0)),
    }));

    const projectedScore = Math.round(
      standardProgress.reduce((sum, standard) => sum + standard.projected, 0) / Math.max(1, standardProgress.length)
    );
    const linkedGapCount = phaseActions.reduce((sum, action) => {
      const matching = actionsWithLinks.find((entry) => entry.action.id === action.id);
      return sum + (matching ? matching.linkedGapIds.filter((gapId) => selectedGapSet.has(gapId)).length : 0);
    }, 0);
    const uncoveredGapCount = cumulativeGapIds.filter((gapId) => {
      return !actionsWithLinks.some(({ linkedGapIds }) => linkedGapIds.includes(gapId));
    }).length;

    const milestone = {
      phase,
      phaseLabel: phaseActions[0]?.phaseLabel || phaseLabelByPhase[phase],
      timeWindow: timeWindowByPhase[phase],
      projectedScore,
      delta: projectedScore - previousProjectedScore,
      effortDays: phaseActions.reduce((sum, action) => sum + action.effortDays, 0),
      addressedGapCount: cumulativeGapIds.length,
      uncoveredGapCount,
      actions: phaseActions,
      fallbackSummary: uncoveredGapCount > 0 ? `${uncoveredGapCount} selected gap${uncoveredGapCount === 1 ? '' : 's'} still require manual control closure planning.` : undefined,
      riskMix: getRiskDistribution(cumulativeGaps),
    } satisfies ComplianceReadinessMilestone;

    previousProjectedScore = projectedScore;
    return milestone;
  });

  const improvementByStandard = selectedGaps.reduce<Record<string, number>>((accumulator, gap) => {
    accumulator[gap.standardCode] = (accumulator[gap.standardCode] || 0) + getGapUplift(gap);
    return accumulator;
  }, {});

  const standardProgress = assessment.standards.map((standard) => {
    const projected = Math.min(100, standard.overallScore + (improvementByStandard[standard.standardCode] || 0));
    return {
      standardCode: standard.standardCode,
      label: getStandardLabel(standard.standardCode),
      current: standard.overallScore,
      projected,
      delta: projected - standard.overallScore,
    };
  });

  const projectedScore = milestones[milestones.length - 1]?.projectedScore || assessment.overallScore;

  return {
    currentScore: assessment.overallScore,
    selectedGapIds,
    selectedGaps,
    projectedScore,
    projectedImprovement: projectedScore - assessment.overallScore,
    totalEffortDays: actionsWithLinks
      .filter(({ linkedGapIds }) => linkedGapIds.some((gapId) => selectedGapSet.has(gapId)))
      .reduce((sum, { action }) => sum + action.effortDays, 0),
    milestones,
    standardProgress,
  };
}

export function getAssessmentNarrative(assessment: AssessmentResult | null) {
  if (!assessment) {
    return 'No live assessment has been loaded. Run an assessment to unlock portfolio, controls, and remediation intelligence.';
  }

  const topGap = sortGapsByPriority(assessment.gaps)[0];
  const weakest = [...assessment.standards].sort((left, right) => left.overallScore - right.overallScore)[0];

  return [
    `${assessment.orgProfile.companyName || 'This organization'} is operating at ${assessment.overallScore}% overall compliance maturity across ${assessment.standards.length} assessed standards.`,
    weakest ? `The largest standards exposure is ${getStandardLabel(weakest.standardCode)} at ${weakest.overallScore}%.` : null,
    topGap ? `Highest priority gap: ${topGap.title} (${getStandardLabel(topGap.standardCode)} clause ${topGap.clauseId}).` : null,
  ].filter(Boolean).join(' ');
}

export function getAgentHealth(agentStatuses: AgentStatus[], agentLog: AgentLogEntry[]) {
  const processing = agentStatuses.filter((agent) => agent.status === 'processing').length;
  const errors = agentStatuses.filter((agent) => agent.status === 'error').length;
  const completed = agentStatuses.filter((agent) => agent.status === 'complete').length;
  const latestEntries = [...agentLog].slice(-6).reverse();

  return {
    processing,
    errors,
    completed,
    latestEntries,
  };
}

export function getAssessedStandardCodes(assessment: AssessmentResult | null): StandardCode[] {
  if (!assessment) {
    return ['ISO37001', 'ISO37301', 'ISO27001', 'ISO9001'];
  }

  return assessment.standards.map((standard) => standard.standardCode as StandardCode);
}