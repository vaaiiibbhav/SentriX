import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { parseDocument, combineDocumentTexts } from '../services/documentParser';
import { runOrchestrator } from '../agents/orchestrator';
import {
  appendAssessmentRuntimeLog,
  createAssessmentRuntimeSession,
  getAssessmentRuntimeSession,
  markAssessmentRuntimeError,
  registerAssessmentRuntimeResult,
  updateAssessmentRuntimeSession,
} from '../services/AssessmentRuntimeStore';
import {
  findPersistedAssessmentSession,
  persistAssessmentDocumentText,
  persistAssessmentError,
  persistAssessmentLog,
  persistAssessmentResult,
  persistAssessmentSessionStart,
} from '../services/AssessmentPersistenceService';
import type { AssessmentResult } from '../types/assessment';
import type { UploadedDocumentReference } from '../types/copilot';

export const assessmentRouter = Router();

const sseClients = new Map<string, Response[]>();

function persistAsync(operation: Promise<unknown>, label: string) {
  void operation.catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[postgres] ${label}: ${message}`);
  });
}

assessmentRouter.post('/start', async (req: Request, res: Response) => {
  const { filePaths, standards, orgProfile, uploadedDocuments } = req.body as {
    filePaths?: string[];
    standards: string[];
    orgProfile: { company: string; industry: string; employees: string; scope: string };
    uploadedDocuments?: UploadedDocumentReference[];
  };

  if (!standards || !Array.isArray(standards) || standards.length === 0) {
    res.status(400).json({ error: 'At least one standard is required' });
    return;
  }

  const assessmentId = uuidv4();
  createAssessmentRuntimeSession(assessmentId, {
    standards,
    orgProfile,
    uploadedDocuments: uploadedDocuments || [],
  });
  persistAsync(
    persistAssessmentSessionStart(assessmentId, {
      standards,
      orgProfile,
      uploadedDocuments: uploadedDocuments || [],
    }),
    `persist start for ${assessmentId}`,
  );

  res.json({ assessmentId, status: 'processing' });

  // Run assessment asynchronously
  (async () => {
    try {
      let documentText = '';
      if (filePaths && Array.isArray(filePaths) && filePaths.length > 0) {
        const texts = await Promise.all(filePaths.map((fp: string) => parseDocument(fp)));
        documentText = combineDocumentTexts(texts);
      } else {
        documentText = 'No documents uploaded. Using organizational profile for assessment.';
      }
      updateAssessmentRuntimeSession(assessmentId, { documentText });
      persistAsync(
        persistAssessmentDocumentText(assessmentId, documentText),
        `persist document text for ${assessmentId}`,
      );

      const sendSSE = (data: Record<string, unknown>) => {
        const clients = sseClients.get(assessmentId) || [];
        const msg = `data: ${JSON.stringify(data)}\n\n`;
        clients.forEach((client) => {
          try { client.write(msg); } catch { /* client disconnected */ }
        });
      };

      await runOrchestrator(documentText, standards, orgProfile, {
        onAgentStart: (agentName) => {
          sendSSE({ type: 'agent-start', agent: agentName, timestamp: new Date().toISOString() });
        },
        onAgentComplete: (agentName, result) => {
          sendSSE({ type: 'agent-complete', agent: agentName, timestamp: new Date().toISOString() });
          appendAssessmentRuntimeLog(assessmentId, `${agentName} completed`);
          persistAsync(
            persistAssessmentLog(assessmentId, `${agentName} completed`),
            `persist completion log for ${assessmentId}`,
          );
        },
        onAgentError: (agentName, error) => {
          sendSSE({ type: 'agent-error', agent: agentName, error, timestamp: new Date().toISOString() });
        },
        onLog: (message) => {
          sendSSE({ type: 'log', message, timestamp: new Date().toISOString() });
          appendAssessmentRuntimeLog(assessmentId, message);
          persistAsync(
            persistAssessmentLog(assessmentId, message),
            `persist log for ${assessmentId}`,
          );
        },
        onComplete: (result) => {
          registerAssessmentRuntimeResult(assessmentId, result);
          persistAsync(
            persistAssessmentResult(assessmentId, result),
            `persist result for ${assessmentId}`,
          );
          sendSSE({ type: 'complete', assessmentId, result, timestamp: new Date().toISOString() });

          // Close SSE connections
          const clients = sseClients.get(assessmentId) || [];
          clients.forEach((client) => {
            try { client.end(); } catch { /* ignore */ }
          });
          sseClients.delete(assessmentId);
        },
      });
    } catch (error) {
      markAssessmentRuntimeError(assessmentId);
      persistAsync(
        persistAssessmentError(assessmentId),
        `persist error state for ${assessmentId}`,
      );
      const clients = sseClients.get(assessmentId) || [];
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      clients.forEach((client) => {
        try {
          client.write(`data: ${JSON.stringify({ type: 'error', message: errMsg })}\n\n`);
          client.end();
        } catch { /* ignore */ }
      });
    }
  })();
});

assessmentRouter.get('/:id/stream', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const runtime = getAssessmentRuntimeSession(id);
  const entry = runtime?.session;

  if (!entry) {
    res.status(404).json({ error: 'Assessment not found' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send existing logs
  for (const log of entry.logs) {
    res.write(`data: ${JSON.stringify({ type: 'log', message: log })}\n\n`);
  }

  if (entry.status === 'complete' && entry.result) {
    res.write(`data: ${JSON.stringify({ type: 'complete', result: entry.result })}\n\n`);
    res.end();
    return;
  }

  if (!sseClients.has(id)) sseClients.set(id, []);
  sseClients.get(id)!.push(res);

  req.on('close', () => {
    const clients = sseClients.get(id);
    if (clients) {
      const idx = clients.indexOf(res);
      if (idx >= 0) clients.splice(idx, 1);
    }
  });
});

assessmentRouter.get('/:id/results', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const runtime = getAssessmentRuntimeSession(id);
  const entry = runtime?.session;

  const respondFromSession = (session: NonNullable<typeof entry>) => {
    if (session.status !== 'complete') {
      res.json({ status: session.status, logs: session.logs });
      return;
    }

    res.json({ status: 'complete', result: session.result });
  };

  if (entry) {
    respondFromSession(entry);
    return;
  }

  void (async () => {
    const persisted = await findPersistedAssessmentSession(id);
    if (!persisted) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    respondFromSession(persisted.session);
  })().catch((error) => {
    const message = error instanceof Error ? error.message : 'Unknown persistence error';
    res.status(500).json({ error: message });
  });
});
