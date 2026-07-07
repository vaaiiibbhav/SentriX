import { Router, Request, Response } from 'express';
import { GenWOrchestrationService } from '../services/GenWOrchestrationService';

export const genwRouter = Router();

const orchestrationService = new GenWOrchestrationService();

genwRouter.get('/modules', (_req: Request, res: Response) => {
  res.json({ modules: orchestrationService.getModuleCatalog() });
});

genwRouter.get('/pipeline', (_req: Request, res: Response) => {
  res.json({ stages: orchestrationService.getPipelineDefinition() });
});

genwRouter.get('/status', async (_req: Request, res: Response) => {
  const status = await orchestrationService.getRuntimeStatus();
  res.json(status);
});