import {
  agentModuleMappings,
  GenWAIClient,
  genWAIModules,
  pipelineAgentOrder,
} from './GenWAIBridge';
import type { PipelineAgentName } from '../types/assessment';

export interface GenWPipelineStage {
  order: number;
  agentName: PipelineAgentName;
  moduleId: string;
  moduleName: string;
  endpoint: string;
  capability: string;
  description: string;
  fallbackMode: 'local-scoring';
}

export class GenWOrchestrationService {
  private readonly client = new GenWAIClient();

  getModuleCatalog() {
    return Object.values(genWAIModules);
  }

  getPipelineDefinition(): GenWPipelineStage[] {
    return pipelineAgentOrder.map((agentName, index) => {
      const mapping = agentModuleMappings.find((item) => item.agentName === agentName);
      if (!mapping) {
        throw new Error(`Missing GenW mapping for ${agentName}.`);
      }

      const module = genWAIModules[mapping.genWAIModule];
      return {
        order: index + 1,
        agentName,
        moduleId: module.id,
        moduleName: module.name,
        endpoint: module.endpoint,
        capability: module.capability,
        description: mapping.description,
        fallbackMode: 'local-scoring',
      };
    });
  }

  async getRuntimeStatus() {
    const health = await this.client.getHealthStatus();
    return {
      provider: 'genw',
      status: health.reachable ? 'available' : health.configured ? 'degraded' : 'fallback-only',
      health,
      configuration: this.client.getConfigurationSummary(),
      pipelineStages: this.getPipelineDefinition(),
      localFallback: {
        enabled: true,
        strategy: 'Clause mapping, evidence validation, compliance scoring, gap detection, remediation planning, and policy generation fall back to local scoring and local agent execution when GenW is unavailable.',
      },
    };
  }
}