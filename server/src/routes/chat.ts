import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';
import { ComplianceCopilotService } from '../services/ComplianceCopilotService';
import type { ComplianceCopilotRequest } from '../types/copilot';

export const chatRouter = Router();

const GROQ_MODEL = 'openai/gpt-oss-120b';
const copilotService = new ComplianceCopilotService();

chatRouter.post('/copilot', async (req: Request, res: Response) => {
  const body = req.body as ComplianceCopilotRequest;

  if (!body?.message?.trim()) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    const response = await copilotService.answer(body);
    res.json(response);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errMsg });
  }
});

// Streaming chat endpoint
chatRouter.post('/stream', async (req: Request, res: Response) => {
  const { message, context } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  if (!process.env.GROQ_API_KEY) {
    // Return simulated response as SSE for demo mode
    const simulated = getSimulatedResponse(message);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Stream word by word for typewriter effect
    const words = simulated.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      res.write(`data: ${JSON.stringify({ type: 'delta', text: chunk })}\n\n`);
      await new Promise((r) => setTimeout(r, 30));
    }
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
    return;
  }

  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `You are SentriX Assistant, an AI expert in ISO compliance standards (ISO 37001, 37301, 27001, 9001, 37000, 37002).
You help users understand compliance requirements, assessment results, and remediation strategies.
You operate with the rigor of a legal compliance advisor. All guidance must be precise and reference specific ISO clauses.
${context ? `Current assessment context: ${JSON.stringify(context)}` : ''}
Keep responses concise and actionable. Use markdown formatting for lists and emphasis.`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const stream = await client.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ type: 'delta', text: delta })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    res.write(`data: ${JSON.stringify({ type: 'error', message: errMsg })}\n\n`);
    res.end();
  }
});

chatRouter.post('/', async (req: Request, res: Response) => {
  const { message, context } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // If no API key, return a simulated response
  if (!process.env.GROQ_API_KEY) {
    const simulated = getSimulatedResponse(message);
    res.json({ response: simulated });
    return;
  }

  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `You are SentriX Assistant, an AI expert in ISO compliance standards (ISO 37001, 37301, 27001, 9001, 37000, 37002).
You help users understand compliance requirements, assessment results, and remediation strategies.
You operate with the rigor of a legal compliance advisor. All guidance must be precise and reference specific ISO clauses.
${context ? `Current assessment context: ${JSON.stringify(context)}` : ''}
Keep responses concise and actionable.`;

    const response = await client.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    const text = response.choices?.[0]?.message?.content || '';

    res.json({ response: text });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errMsg });
  }
});

function getSimulatedResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('score') || lower.includes('overall')) {
    return 'Your overall compliance score is 62%, which indicates a Maturity Level 3 (Defined). Key areas for improvement include ISO 37001 clauses on financial controls and due diligence, as well as ISO 27001 risk treatment procedures.';
  }
  if (lower.includes('gap') || lower.includes('risk')) {
    return 'The assessment identified 12 gaps across 4 standards. The most critical are: (1) Insufficient due diligence procedures (ISO 37001 §8.2), (2) Missing risk treatment plan (ISO 27001 §8.3), and (3) Incomplete compliance obligation register (ISO 37301 §4.5). I recommend prioritizing these in Phase 1 of your remediation roadmap.';
  }
  if (lower.includes('remediation') || lower.includes('fix') || lower.includes('improve')) {
    return 'Your remediation roadmap has 3 phases: Phase 1 (Immediate, 30 days) — Address 4 critical gaps including policy documentation and risk assessments. Phase 2 (Short-term, 90 days) — Implement training programs and control frameworks. Phase 3 (Long-term, 180 days) — Establish continuous monitoring and improvement processes.';
  }
  if (lower.includes('iso 37001') || lower.includes('bribery') || lower.includes('anti-bribery')) {
    return 'ISO 37001 scored 54% (Maturity Level 2). Key findings: Due diligence procedures need significant enhancement (§8.2: 30%), financial controls lack documentation (§8.3: 35%), and whistleblowing channels are insufficiently promoted (§8.6: 40%). Strengths include leadership commitment (§5.1: 72%).';
  }
  return 'I can help you understand your compliance assessment results, identify gaps, and plan remediation strategies. Try asking about your overall score, specific standards, gap analysis, or remediation recommendations.';
}
