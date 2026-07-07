export interface AssessmentOrgProfile {
  company: string;
  industry: string;
  employees: string;
  scope: string;
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

export interface EvidenceValidationResult {
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

export interface ClauseMappingCandidate {
  clauseId: string;
  clauseTitle: string;
  category: string;
  relevanceScore: number;
  matchedSignals: string[];
  excerpt: string;
}

export interface ClauseMappingResult {
  standardCode: string;
  standardName: string;
  mappedClauses: ClauseMappingCandidate[];
  summary: string;
}

export interface StandardAssessment {
  standard: string;
  name: string;
  overallScore: number;
  maturityLevel: number;
  clauseScores: { clauseId: string; score: number; finding: string }[];
  scoringMethod?: string;
  confidence?: number;
}

export interface Gap {
  id: string;
  title: string;
  severity: string;
  standard: string;
  clauseRef: string;
  impactScore: number;
  effortScore: number;
  description: string;
}

export interface RemediationAction {
  id: string;
  title: string;
  description: string;
  priority: string;
  phase: number;
  effortDays: number;
  standard: string;
  responsible: string;
}

export type PipelineAgentName =
  | 'Document Parsing Agent'
  | 'Clause Mapping Agent'
  | 'Evidence Validation Agent'
  | 'Compliance Scoring Agent'
  | 'Gap Detection Agent'
  | 'Remediation Planning Agent'
  | 'Policy Generation Agent';

export type GenWAgentName = PipelineAgentName | 'Compliance Copilot Agent';

export interface PipelineAgentExecution {
  agentName: PipelineAgentName;
  provider: 'genw' | 'local';
  moduleId?: string;
  status: 'completed' | 'fallback' | 'error';
  startedAt: string;
  completedAt: string;
  summary: string;
}

export interface AssessmentResult {
  id: string;
  orgProfile: AssessmentOrgProfile;
  overallScore: number;
  maturityLevel: number;
  standardAssessments: StandardAssessment[];
  clauseMappings?: ClauseMappingResult[];
  gaps: Gap[];
  evidenceValidation: EvidenceValidationResult;
  remediationActions: RemediationAction[];
  policyDocuments: PolicyDocument[];
  orchestration?: {
    provider: 'genw' | 'local' | 'hybrid';
    executions: PipelineAgentExecution[];
  };
  timestamp: string;
}