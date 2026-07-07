import { CompliancePipelineService, type CompliancePipelineCallbacks } from '../services/CompliancePipelineService';
import type {
  AssessmentOrgProfile,
  AssessmentResult,
  EvidenceValidationItem,
  EvidenceValidationResult,
  Gap,
  PipelineAgentName,
  PolicyDocument,
  PolicyGeneratorResult,
  PolicySection,
  RemediationAction,
} from '../types/assessment';

export type {
  AssessmentOrgProfile,
  AssessmentResult,
  EvidenceValidationItem,
  EvidenceValidationResult,
  Gap,
  PipelineAgentName,
  PolicyDocument,
  PolicyGeneratorResult,
  PolicySection,
  RemediationAction,
} from '../types/assessment';

export interface OrchestratorCallbacks {
  onAgentStart: (agentName: PipelineAgentName) => void;
  onAgentComplete: (agentName: PipelineAgentName, result: string) => void;
  onAgentError: (agentName: PipelineAgentName, error: string) => void;
  onLog: (message: string) => void;
  onComplete: (result: AssessmentResult) => void;
}

export async function runOrchestrator(
  documentText: string,
  standards: string[],
  orgProfile: AssessmentOrgProfile,
  callbacks: OrchestratorCallbacks,
): Promise<AssessmentResult> {
  const pipeline = new CompliancePipelineService(callbacks as CompliancePipelineCallbacks);
  return pipeline.run(documentText, standards, orgProfile);
}
