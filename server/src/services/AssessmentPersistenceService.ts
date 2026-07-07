import type { QueryResultRow } from 'pg';
import { getPostgresPool, isPostgresEnabled } from './PostgresService';
import type { AssessmentOrgProfile, AssessmentResult } from '../types/assessment';
import type { UploadedDocumentReference } from '../types/copilot';
import type { AssessmentRuntimeSession } from './AssessmentRuntimeStore';

interface AssessmentSessionRow {
  session_id: string;
  result_id: string | null;
  status: AssessmentRuntimeSession['status'];
  standards: string[];
  org_profile: AssessmentOrgProfile | null;
  uploaded_documents: UploadedDocumentReference[];
  document_text: string | null;
  result: AssessmentResult | null;
  logs: string[];
  created_at: Date | string;
}

function getPoolOrNull() {
  if (!isPostgresEnabled()) {
    return null;
  }

  return getPostgresPool();
}

function mapRowToRuntimeSession(row: AssessmentSessionRow): AssessmentRuntimeSession {
  return {
    status: row.status,
    standards: row.standards || [],
    orgProfile: row.org_profile || undefined,
    uploadedDocuments: row.uploaded_documents || [],
    documentText: row.document_text || undefined,
    result: row.result || undefined,
    logs: row.logs || [],
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function queryRows<T extends QueryResultRow>(text: string, values: unknown[]) {
  const pool = getPoolOrNull();
  if (!pool) {
    return null;
  }

  return pool.query<T>(text, values);
}

export async function persistAssessmentSessionStart(
  sessionId: string,
  data: {
    standards: string[];
    orgProfile?: AssessmentOrgProfile;
    uploadedDocuments: UploadedDocumentReference[];
  },
) {
  const result = await queryRows(
    `
      INSERT INTO assessment_sessions (
        session_id,
        status,
        standards,
        org_profile,
        uploaded_documents,
        logs
      ) VALUES ($1, 'processing', $2::jsonb, $3::jsonb, $4::jsonb, '[]'::jsonb)
      ON CONFLICT (session_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        standards = EXCLUDED.standards,
        org_profile = EXCLUDED.org_profile,
        uploaded_documents = EXCLUDED.uploaded_documents,
        updated_at = NOW()
    `,
    [
      sessionId,
      JSON.stringify(data.standards),
      JSON.stringify(data.orgProfile || null),
      JSON.stringify(data.uploadedDocuments || []),
    ],
  );

  return result !== null;
}

export async function persistAssessmentDocumentText(sessionId: string, documentText: string) {
  const result = await queryRows(
    `
      UPDATE assessment_sessions
      SET document_text = $2,
          updated_at = NOW()
      WHERE session_id = $1
    `,
    [sessionId, documentText],
  );

  return result !== null;
}

export async function persistAssessmentLog(sessionId: string, message: string) {
  const result = await queryRows(
    `
      UPDATE assessment_sessions
      SET logs = COALESCE(logs, '[]'::jsonb) || to_jsonb($2::text),
          updated_at = NOW()
      WHERE session_id = $1
    `,
    [sessionId, message],
  );

  return result !== null;
}

export async function persistAssessmentResult(sessionId: string, resultPayload: AssessmentResult) {
  const result = await queryRows(
    `
      UPDATE assessment_sessions
      SET status = 'complete',
          result_id = $2,
          result = $3::jsonb,
          updated_at = NOW()
      WHERE session_id = $1
    `,
    [sessionId, resultPayload.id, JSON.stringify(resultPayload)],
  );

  return result !== null;
}

export async function persistAssessmentError(sessionId: string) {
  const result = await queryRows(
    `
      UPDATE assessment_sessions
      SET status = 'error',
          updated_at = NOW()
      WHERE session_id = $1
    `,
    [sessionId],
  );

  return result !== null;
}

export async function findPersistedAssessmentSession(sessionOrResultId: string) {
  const result = await queryRows<AssessmentSessionRow>(
    `
      SELECT
        session_id,
        result_id,
        status,
        standards,
        org_profile,
        uploaded_documents,
        document_text,
        result,
        logs,
        created_at
      FROM assessment_sessions
      WHERE session_id = $1 OR result_id = $1
      LIMIT 1
    `,
    [sessionOrResultId],
  );

  if (!result || result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    sessionId: row.session_id,
    session: mapRowToRuntimeSession(row),
  };
}