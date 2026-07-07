import type { AssessmentOrgProfile } from './assessment';

export interface UploadedDocumentReference {
  originalName: string;
  savedPath?: string;
  size?: number;
  mimetype?: string;
}

export interface CopilotContextStandardSummary {
  code: string;
  name: string;
  overallScore: number;
  maturityLevel: number;
  summary?: string;
}

export interface CopilotContextClauseScore {
  standard: string;
  clauseId: string;
  clauseTitle?: string;
  score: number;
  finding: string;
}

export interface CopilotContextGapSummary {
  id: string;
  standard: string;
  clauseRef: string;
  title: string;
  severity: string;
  description: string;
}

export interface CopilotContextRemediationSummary {
  id: string;
  title: string;
  priority: string;
  phase: number;
  description: string;
  standard?: string;
  responsible?: string;
}

export interface CopilotContextSnapshot {
  orgProfile?: AssessmentOrgProfile;
  uploadedDocuments?: UploadedDocumentReference[];
  overallScore?: number;
  maturityLevel?: number;
  executiveSummary?: string;
  evidenceSummary?: string;
  standards?: CopilotContextStandardSummary[];
  clauseScores?: CopilotContextClauseScore[];
  gaps?: CopilotContextGapSummary[];
  remediationActions?: CopilotContextRemediationSummary[];
  orchestration?: {
    provider?: string;
    executionCount?: number;
  };
}

export interface ComplianceCopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ComplianceCopilotRequest {
  message: string;
  assessmentId?: string;
  conversationHistory?: ComplianceCopilotMessage[];
  context?: CopilotContextSnapshot;
}

export interface ComplianceCopilotEvidence {
  source:
    | 'organization-profile'
    | 'uploaded-document'
    | 'assessment-result'
    | 'clause-score'
    | 'gap-register'
    | 'remediation-roadmap'
    | 'orchestration';
  label: string;
  detail: string;
}

export interface ComplianceCopilotAction {
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
  owner?: string;
  standard?: string;
  clause?: string;
}

export interface ComplianceCopilotGuidance {
  standard: string;
  clause?: string;
  requirement: string;
  guidance: string;
}

export interface ComplianceCopilotAuditTrail {
  responseMode: 'genw' | 'groq' | 'local';
  structuredFormat: 'compliance-copilot-v1';
  assessmentReference?: string;
  contextSources: string[];
  pipelineProvider: 'genw' | 'local' | 'hybrid' | 'unknown';
  generatedAt: string;
  caveats: string[];
}

export interface ComplianceCopilotResponse {
  headline: string;
  directAnswer: string;
  explanation: string;
  evidence: ComplianceCopilotEvidence[];
  recommendedActions: ComplianceCopilotAction[];
  isoGuidance: ComplianceCopilotGuidance[];
  reportSummary: string[];
  followUpQuestions: string[];
  auditTrail: ComplianceCopilotAuditTrail;
}