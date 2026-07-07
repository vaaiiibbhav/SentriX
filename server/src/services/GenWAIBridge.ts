/**
 * OmniAgent Bridge — Integration layer for Enterprise Core's OmniAgent platform
 * Maps SentriX agents to OmniAgent module capabilities
 */

import type { GenWAgentName, PipelineAgentName } from '../types/assessment';

export interface GenWAIModule {
  id: string;
  name: string;
  capability: string;
  endpoint: string;
}

export const genWAIModules: Record<string, GenWAIModule> = {
  documentIntelligence: {
    id: 'genw-doc-intel',
    name: 'Document Intelligence',
    capability: 'Multi-format document parsing with structural understanding',
    endpoint: '/api/genw/document-intelligence',
  },
  riskAnalytics: {
    id: 'genw-risk',
    name: 'Risk Analytics Engine',
    capability: 'Probabilistic risk scoring and heat mapping',
    endpoint: '/api/genw/risk-analytics',
  },
  complianceKnowledge: {
    id: 'genw-knowledge',
    name: 'Compliance Knowledge Graph',
    capability: 'Standards cross-referencing and clause mapping',
    endpoint: '/api/genw/knowledge-graph',
  },
  remediationEngine: {
    id: 'genw-remediation',
    name: 'Remediation Planning Engine',
    capability: 'Phased remediation roadmap generation with cost estimation',
    endpoint: '/api/genw/remediation',
  },
  auditTrail: {
    id: 'genw-audit',
    name: 'Audit Trail',
    capability: 'Immutable audit logging and evidence management',
    endpoint: '/api/genw/audit-trail',
  },
  evidenceValidator: {
    id: 'genw-evidence',
    name: 'Evidence Validation Engine',
    capability: 'AI-powered evidence sufficiency analysis and chain-of-custody verification',
    endpoint: '/api/genw/evidence-validation',
  },
  policyGenerator: {
    id: 'genw-policy',
    name: 'Policy Generation Engine',
    capability: 'AI-powered compliant policy document generation with clause-level coverage and download capability',
    endpoint: '/api/genw/policy-generation',
  },
  complianceCopilot: {
    id: 'genw-copilot',
    name: 'Compliance Copilot Advisor',
    capability: 'Context-aware compliance Q&A, report summarization, and remediation guidance',
    endpoint: '/api/genw/compliance-copilot',
  },
};

export interface GenWAIAgentMapping {
  agentName: GenWAgentName;
  genWAIModule: string;
  description: string;
}

export const agentModuleMappings: GenWAIAgentMapping[] = [
  { agentName: 'Document Parsing Agent', genWAIModule: 'documentIntelligence', description: 'Leverages OmniAgent Document Intelligence for multi-format parsing and structural understanding' },
  { agentName: 'Clause Mapping Agent', genWAIModule: 'complianceKnowledge', description: 'Uses OmniAgent Compliance Knowledge Graph for semantic clause alignment' },
  { agentName: 'Evidence Validation Agent', genWAIModule: 'evidenceValidator', description: 'Validates evidence sufficiency and quality via OmniAgent Evidence Validation Engine' },
  { agentName: 'Compliance Scoring Agent', genWAIModule: 'riskAnalytics', description: 'Applies OmniAgent scoring and confidence logic to clause readiness' },
  { agentName: 'Gap Detection Agent', genWAIModule: 'complianceKnowledge', description: 'Cross-references standards and control gaps via OmniAgent Knowledge Graph' },
  { agentName: 'Remediation Planning Agent', genWAIModule: 'remediationEngine', description: 'Generates phased roadmaps via OmniAgent Remediation Planning Engine' },
  { agentName: 'Policy Generation Agent', genWAIModule: 'policyGenerator', description: 'Generates compliant policy sections via OmniAgent Policy Generation Engine' },
  { agentName: 'Compliance Copilot Agent', genWAIModule: 'complianceCopilot', description: 'Answers contextual compliance questions using pipeline outputs, uploaded documents, and assessment evidence' },
];

export interface GenWStreamChunk {
  message: string;
}

export interface GenWHealthStatus {
  configured: boolean;
  reachable: boolean;
  baseUrl: string | null;
  timeoutMs: number;
  healthEndpoint: string;
  checkedAt: string;
  error?: string;
}

export const pipelineAgentOrder: PipelineAgentName[] = [
  'Document Parsing Agent',
  'Clause Mapping Agent',
  'Evidence Validation Agent',
  'Compliance Scoring Agent',
  'Gap Detection Agent',
  'Remediation Planning Agent',
  'Policy Generation Agent',
];

function parseJsonPayload<T>(raw: string): T {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse((jsonMatch ? jsonMatch[1] : trimmed).trim()) as T;
}

async function streamResponse<T>(response: Response, onStream?: (message: string) => void): Promise<T> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('GenW stream was empty.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let finalPayload = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split(/\n\n|\r\n\r\n/);
    buffer = chunks.pop() || '';

    chunks.forEach((chunk) => {
      const lines = chunk.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const dataLine = lines.find((line) => line.startsWith('data:'));
      if (!dataLine) {
        return;
      }

      const data = dataLine.replace(/^data:\s*/, '');
      if (data === '[DONE]') {
        return;
      }

      try {
        const parsed = JSON.parse(data) as { type?: string; chunk?: string; message?: string; result?: unknown; data?: unknown };
        if (typeof parsed.chunk === 'string') {
          onStream?.(parsed.chunk);
          finalPayload += parsed.chunk;
        } else if (typeof parsed.message === 'string' && parsed.type !== 'complete') {
          onStream?.(parsed.message);
        }

        if (parsed.result !== undefined) {
          finalPayload = JSON.stringify(parsed.result);
        } else if (parsed.data !== undefined) {
          finalPayload = JSON.stringify(parsed.data);
        }
      } catch {
        onStream?.(data);
        finalPayload += data;
      }
    });
  }

  if (!finalPayload.trim()) {
    throw new Error('GenW stream completed without a final payload.');
  }

  return parseJsonPayload<T>(finalPayload);
}

export function getGenWAIModuleForAgent(agentName: GenWAgentName): GenWAIModule | undefined {
  const mapping = agentModuleMappings.find((m) => m.agentName === agentName);
  if (!mapping) return undefined;
  return genWAIModules[mapping.genWAIModule];
}

export class GenWAIClient {
  private readonly baseUrl = process.env.GENW_API_BASE_URL?.replace(/\/$/, '') || '';
  private readonly apiKey = process.env.GENW_API_KEY || '';
  private readonly timeoutMs = Number(process.env.GENW_TIMEOUT_MS || 45000);
  private readonly healthEndpoint = process.env.GENW_HEALTH_ENDPOINT || '/health';

  isConfigured() {
    return Boolean(this.baseUrl && this.apiKey);
  }

  getConfigurationSummary() {
    return {
      configured: this.isConfigured(),
      baseUrl: this.baseUrl || null,
      timeoutMs: this.timeoutMs,
      healthEndpoint: this.healthEndpoint,
    };
  }

  async getHealthStatus(): Promise<GenWHealthStatus> {
    const checkedAt = new Date().toISOString();

    if (!this.isConfigured()) {
      return {
        configured: false,
        reachable: false,
        baseUrl: this.baseUrl || null,
        timeoutMs: this.timeoutMs,
        healthEndpoint: this.healthEndpoint,
        checkedAt,
        error: 'GenW is not configured. Set GENW_API_BASE_URL and GENW_API_KEY.',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}${this.healthEndpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(Math.min(this.timeoutMs, 8000)),
      });

      if (!response.ok) {
        return {
          configured: true,
          reachable: false,
          baseUrl: this.baseUrl,
          timeoutMs: this.timeoutMs,
          healthEndpoint: this.healthEndpoint,
          checkedAt,
          error: `Health check failed with ${response.status} ${response.statusText}`,
        };
      }

      return {
        configured: true,
        reachable: true,
        baseUrl: this.baseUrl,
        timeoutMs: this.timeoutMs,
        healthEndpoint: this.healthEndpoint,
        checkedAt,
      };
    } catch (error) {
      return {
        configured: true,
        reachable: false,
        baseUrl: this.baseUrl,
        timeoutMs: this.timeoutMs,
        healthEndpoint: this.healthEndpoint,
        checkedAt,
        error: error instanceof Error ? error.message : 'Unknown GenW connectivity error',
      };
    }
  }

  async executeAgent<T>(agentName: GenWAgentName, payload: Record<string, unknown>, onStream?: (message: string) => void): Promise<T> {
    const module = getGenWAIModuleForAgent(agentName);
    if (!module) {
      throw new Error(`No GenW module mapping exists for ${agentName}.`);
    }

    if (!this.isConfigured()) {
      throw new Error('GenW is not configured. Set GENW_API_BASE_URL and GENW_API_KEY.');
    }

    const response = await fetch(`${this.baseUrl}${module.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'X-GenW-Agent': agentName,
      },
      body: JSON.stringify({
        agentName,
        moduleId: module.id,
        stream: true,
        payload,
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GenW request failed with ${response.status}: ${errorText || response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson')) {
      return streamResponse<T>(response, onStream);
    }

    const text = await response.text();
    return parseJsonPayload<T>(text);
  }
}
