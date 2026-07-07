import type { AssessmentOrgProfile, AssessmentResult } from '../types/assessment';
import type { UploadedDocumentReference } from '../types/copilot';

export interface AssessmentRuntimeSession {
  status: 'processing' | 'complete' | 'error';
  standards: string[];
  orgProfile?: AssessmentOrgProfile;
  uploadedDocuments: UploadedDocumentReference[];
  documentText?: string;
  result?: AssessmentResult;
  logs: string[];
  createdAt: string;
}

const runtimeSessions = new Map<string, AssessmentRuntimeSession>();
const resultSessionAliases = new Map<string, string>();

export function createAssessmentRuntimeSession(
  sessionId: string,
  data: Pick<AssessmentRuntimeSession, 'standards' | 'orgProfile' | 'uploadedDocuments'>,
) {
  runtimeSessions.set(sessionId, {
    status: 'processing',
    standards: data.standards,
    orgProfile: data.orgProfile,
    uploadedDocuments: data.uploadedDocuments,
    logs: [],
    createdAt: new Date().toISOString(),
  });
}

export function updateAssessmentRuntimeSession(sessionId: string, patch: Partial<AssessmentRuntimeSession>) {
  const current = runtimeSessions.get(sessionId);
  if (!current) {
    return;
  }

  runtimeSessions.set(sessionId, {
    ...current,
    ...patch,
  });
}

export function appendAssessmentRuntimeLog(sessionId: string, message: string) {
  const current = runtimeSessions.get(sessionId);
  if (!current) {
    return;
  }

  current.logs.push(message);
}

export function registerAssessmentRuntimeResult(sessionId: string, result: AssessmentResult) {
  const current = runtimeSessions.get(sessionId);
  if (!current) {
    return;
  }

  current.status = 'complete';
  current.result = result;
  resultSessionAliases.set(result.id, sessionId);
}

export function markAssessmentRuntimeError(sessionId: string) {
  const current = runtimeSessions.get(sessionId);
  if (!current) {
    return;
  }

  current.status = 'error';
}

export function getAssessmentRuntimeSession(sessionOrResultId: string) {
  const direct = runtimeSessions.get(sessionOrResultId);
  if (direct) {
    return { sessionId: sessionOrResultId, session: direct };
  }

  const aliasedSessionId = resultSessionAliases.get(sessionOrResultId);
  if (!aliasedSessionId) {
    return null;
  }

  const aliased = runtimeSessions.get(aliasedSessionId);
  if (!aliased) {
    return null;
  }

  return { sessionId: aliasedSessionId, session: aliased };
}