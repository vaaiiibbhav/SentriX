import { Pool } from 'pg';

let pool: Pool | null = null;
let initializationPromise: Promise<boolean> | null = null;

const schemaSql = `
CREATE TABLE IF NOT EXISTS assessment_sessions (
  session_id UUID PRIMARY KEY,
  result_id UUID UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('processing', 'complete', 'error')),
  standards JSONB NOT NULL DEFAULT '[]'::jsonb,
  org_profile JSONB,
  uploaded_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  document_text TEXT,
  result JSONB,
  logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_created_at
  ON assessment_sessions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_result_id
  ON assessment_sessions (result_id);
`;

function hasConnectionConfig() {
  return Boolean(
    process.env.DATABASE_URL
      || (process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE),
  );
}

function buildPool() {
  if (!hasConnectionConfig()) {
    return null;
  }

  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : undefined,
    });
  }

  return new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : undefined,
  });
}

export function isPostgresEnabled() {
  return hasConnectionConfig();
}

export function getPostgresPool() {
  if (!pool) {
    pool = buildPool();
  }

  return pool;
}

export async function initializePostgres() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const clientPool = getPostgresPool();
    if (!clientPool) {
      return false;
    }

    await clientPool.query(schemaSql);
    await clientPool.query('SELECT 1');
    return true;
  })();

  try {
    return await initializationPromise;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
}

export async function getPostgresHealth() {
  const clientPool = getPostgresPool();
  if (!clientPool) {
    return 'disabled' as const;
  }

  try {
    await clientPool.query('SELECT 1');
    return 'connected' as const;
  } catch {
    return 'error' as const;
  }
}

export async function closePostgresPool() {
  if (!pool) {
    return;
  }

  const currentPool = pool;
  pool = null;
  initializationPromise = null;
  await currentPool.end();
}