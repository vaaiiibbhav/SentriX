export interface OrgProfile {
  companyName: string;
  industrySector: string;
  employeeCount: string;
  assessmentScope: 'full' | 'quick' | 'targeted';
  jurisdiction?: string;
  currentMaturity?: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
}

export interface ClauseData {
  id: string;
  title: string;
  description: string;
  category: string;
  weight: number;
}

export interface StandardData {
  code: string;
  name: string;
  edition: string;
  clauses: ClauseData[];
}

export interface StandardsLibrary {
  ISO37001: StandardData;
  ISO37301: StandardData;
  ISO27001: StandardData;
  ISO9001: StandardData;
}

export interface ClauseScore {
  clauseId: string;
  clauseTitle: string;
  score: number; // 0, 33, 66, 100
  status: 'not-started' | 'planned' | 'partial' | 'implemented';
  evidence: string;
  gap: string;
  remediation: string;
  finding?: string;
  confidence?: number;
}

export interface StandardAssessment {
  standardCode: string;
  standardName: string;
  overallScore: number;
  maturityLevel: number; // 1-5
  maturityLabel: string;
  clauseScores: ClauseScore[];
  summary: string;
  scoringMethod?: string;
  confidence?: number;
}

export interface Gap {
  id: string;
  clauseId: string;
  standardCode: string;
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  effort: number; // days
  impactScore: number; // 1-10
  effortScore: number; // 1-10
  crossStandardOverlap: string[];
  category: 'policy' | 'process' | 'training' | 'technology' | 'documentation';
  legalSeverity?: string;
}

export interface RemediationAction {
  id: string;
  title: string;
  phase: 1 | 2 | 3;
  phaseLabel: string;
  clauseIds: string[];
  standards: string[];
  responsibleFunction: string;
  effortDays: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  successMetric: string;
  description: string;
  gapIds?: string[];
}

export interface EvidenceValidationItem {
  id: string;
  clauseId: string;
  standardCode: string;
  evidenceText: string;
  validationResult: 'sufficient' | 'partial' | 'insufficient' | 'missing';
  qualityScore: number;
  qualityLevel: 'direct' | 'indirect' | 'anecdotal' | 'none';
  issues: string[];
  recommendation: string;
  crossStandardReuse: string[];
}

export interface EvidenceValidation {
  evidenceItems: EvidenceValidationItem[];
  overallEvidenceScore: number;
  sufficientCount: number;
  partialCount: number;
  insufficientCount: number;
  missingCount: number;
  crossStandardOpportunities: number;
  summary: string;
}

export interface PolicySection {
  sectionNumber: string;
  title: string;
  clauseRef: string;
  content: string;
  status: 'new' | 'revised' | 'retained';
}

export interface PolicyDocument {
  id: string;
  standardCode: string;
  standardName: string;
  title: string;
  version: string;
  effectiveDate: string;
  sections: PolicySection[];
  complianceScore: number;
  gapsAddressed: number;
  summary: string;
}

export interface PolicyGeneratorResult {
  policyDocuments: PolicyDocument[];
  totalPoliciesGenerated: number;
  overallComplianceTarget: number;
  summary: string;
}

export interface UploadedDocumentInfo {
  originalName: string;
  savedPath?: string;
  size?: number;
  mimetype?: string;
}

export interface AssessmentResult {
  id: string;
  orgProfile: OrgProfile;
  timestamp: string;
  overallScore: number;
  overallMaturity: number;
  overallMaturityLabel: string;
  standards: StandardAssessment[];
  gaps: Gap[];
  evidenceValidation: EvidenceValidation;
  remediation: RemediationAction[];
  policyDocuments?: PolicyDocument[];
  executiveSummary: string;
  sessionId?: string;
  uploadedDocuments?: UploadedDocumentInfo[];
  orchestration?: {
    provider: 'genw' | 'local' | 'hybrid';
    executions: Array<{
      agentName: string;
      provider: 'genw' | 'local';
      status: 'completed' | 'fallback' | 'error';
      startedAt: string;
      completedAt: string;
      summary: string;
    }>;
  };
}

export interface BackendClauseScore {
  clauseId: string;
  score: number;
  finding: string;
}

export interface BackendStandardAssessment {
  standard: string;
  name: string;
  overallScore: number;
  maturityLevel: number;
  clauseScores: BackendClauseScore[];
  scoringMethod?: string;
  confidence?: number;
}

export interface BackendGap {
  id: string;
  title: string;
  severity: string;
  standard: string;
  clauseRef: string;
  impactScore: number;
  effortScore: number;
  description: string;
}

export interface BackendRemediationAction {
  id: string;
  title: string;
  description: string;
  priority: string;
  phase: number;
  effortDays: number;
  standard: string;
  responsible: string;
}

export interface BackendAssessmentResult {
  id: string;
  orgProfile: { company: string; industry: string; employees: string; scope: string };
  overallScore: number;
  maturityLevel: number;
  standardAssessments: BackendStandardAssessment[];
  gaps: BackendGap[];
  evidenceValidation: EvidenceValidation;
  remediationActions: BackendRemediationAction[];
  policyDocuments: PolicyDocument[];
  orchestration?: {
    provider: 'genw' | 'local' | 'hybrid';
    executions: Array<{
      agentName: string;
      provider: 'genw' | 'local';
      status: 'completed' | 'fallback' | 'error';
      startedAt: string;
      completedAt: string;
      summary: string;
    }>;
  };
  timestamp: string;
}

export interface CopilotContextSnapshot {
  orgProfile?: { company: string; industry: string; employees: string; scope: string };
  uploadedDocuments?: UploadedDocumentInfo[];
  overallScore?: number;
  maturityLevel?: number;
  executiveSummary?: string;
  evidenceSummary?: string;
  evidenceStats?: {
    sufficientCount: number;
    partialCount: number;
    insufficientCount: number;
    missingCount: number;
    crossStandardOpportunities: number;
    overallEvidenceScore: number;
  };
  standards?: Array<{
    code: string;
    name: string;
    overallScore: number;
    maturityLevel: number;
    summary?: string;
  }>;
  clauseScores?: Array<{
    standard: string;
    clauseId: string;
    clauseTitle?: string;
    score: number;
    finding: string;
  }>;
  gaps?: Array<{
    id: string;
    standard: string;
    clauseRef: string;
    title: string;
    severity: string;
    description: string;
  }>;
  remediationActions?: Array<{
    id: string;
    title: string;
    priority: string;
    phase: number;
    description: string;
    standard?: string;
    responsible?: string;
  }>;
  orchestration?: {
    provider?: string;
    executionCount?: number;
  };
  workspaceMetrics?: {
    highRiskGapCount: number;
    remediationCount: number;
    activeStandardCount: number;
    weakestStandard?: string;
    weakestClause?: string;
    targetScore?: number;
    scoreGapToTarget?: number;
  };
  commandHints?: string[];
}

export interface ComplianceCopilotResponse {
  headline: string;
  directAnswer: string;
  explanation: string;
  evidence: Array<{
    source: string;
    label: string;
    detail: string;
  }>;
  recommendedActions: Array<{
    title: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    rationale: string;
    owner?: string;
    standard?: string;
    clause?: string;
  }>;
  isoGuidance: Array<{
    standard: string;
    clause?: string;
    requirement: string;
    guidance: string;
  }>;
  reportSummary: string[];
  followUpQuestions: string[];
  auditTrail: {
    responseMode: 'genw' | 'groq' | 'local';
    structuredFormat: 'compliance-copilot-v1';
    assessmentReference?: string;
    contextSources: string[];
    pipelineProvider: 'genw' | 'local' | 'hybrid' | 'unknown';
    generatedAt: string;
    caveats: string[];
  };
}

export interface StandardLibraryItem {
  code: string;
  name: string;
  fullName: string;
  version: string;
  clauseCount: number;
  questionnaireAvailable: boolean;
  totalQuestions: number;
  mandatoryQuestions: number;
  categories: string[];
  clauseCategories: string[];
}

export interface GovernanceLibraryItem {
  code: string;
  name: string;
  scope: string;
  year: number;
  totalQuestions: number;
  categories: string[];
  keyPrinciples: string[];
}

export interface AuditQuestion {
  id: string;
  clauseRef: string;
  category: string;
  question: string;
  legalBasis: string;
  severity: 'mandatory' | 'recommended';
  evidenceRequired: string[];
  failureConsequence: string;
  scoringCriteria: {
    full: string;
    partial: string;
    nonCompliant: string;
  };
}

export interface QuestionnaireResponse {
  type: 'questionnaire' | 'governance';
  standardCode?: string;
  standardName?: string;
  code?: string;
  name?: string;
  version?: string;
  effectiveDate?: string;
  year?: number;
  scope?: string;
  totalMandatoryRequirements?: number;
  totalQuestions: number;
  mandatoryQuestions?: number;
  categories: string[];
  keyPrinciples?: string[];
  questions: AuditQuestion[];
}

export interface IndustryBenchmark {
  industry: string;
  averageScores: Record<string, number>;
  commonGaps: string[];
  regulatoryPressure: 'low' | 'medium' | 'high' | 'very-high';
}

export interface KnowledgeBaseOverview {
  industryBenchmark: IndustryBenchmark;
  maturityModel: Array<{
    level: number;
    name: string;
    description: string;
    characteristics: string[];
    scoreRange: [number, number];
  }>;
  legalFrameworkReferences: Record<string, Array<Record<string, string | number>>>;
  legalSeverityMatrix: Record<string, {
    description: string;
    examples: string[];
    recommendedAction: string;
    timeframe: string;
  }>;
  commonAuditFindings: Array<{
    clauseCategory: string;
    standardCode: string;
    commonFindings: string[];
    remediationGuidance: string[];
    typicalScore: number;
    criticality: string;
  }>;
  crossStandardMappings: Array<{
    sourceStandard: string;
    sourceClause: string;
    targetStandard: string;
    targetClause: string;
    relationship: string;
    rationale: string;
  }>;
}

export interface AgentStatus {
  name: string;
  status: 'idle' | 'processing' | 'complete' | 'error';
  progress: number;
  currentAction: string;
  startTime?: string;
  endTime?: string;
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  agentName: string;
  message: string;
  type: 'info' | 'progress' | 'success' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structuredResponse?: ComplianceCopilotResponse;
}

export type StandardCode = 'ISO37001' | 'ISO37301' | 'ISO27001' | 'ISO9001';

export interface Report {
  id: string;
  assessmentId: string;
  orgName: string;
  date: string;
  standardsCovered: string[];
  overallScore: number;
  status: 'ready' | 'generating' | 'error';
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
