import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { assessmentRouter } from './routes/assessment';
import { chatRouter } from './routes/chat';
import { standardsRouter } from './routes/standards';
import { reportRouter } from './routes/report';
import { demoRouter } from './routes/demo';
import { uploadRouter } from './routes/upload';
import { policyRouter } from './routes/policy';
import { genwRouter } from './routes/genw';
import { getPostgresHealth, initializePostgres, isPostgresEnabled } from './services/PostgresService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));

// Ensure uploads directory exists
import fs from 'fs';
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/assessment', assessmentRouter);
app.use('/api/chat', chatRouter);
app.use('/api/standards', standardsRouter);
app.use('/api/report', reportRouter);
app.use('/api/demo', demoRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/policy', policyRouter);
app.use('/api/genw', genwRouter);

// Health check
app.get('/api/health', (_req, res) => {
  void (async () => {
    const database = await getPostgresHealth();
    res.json({
      status: database === 'error' ? 'degraded' : 'ok',
      timestamp: new Date().toISOString(),
      database,
    });
  })().catch(() => {
    res.json({ status: 'degraded', timestamp: new Date().toISOString(), database: 'error' });
  });
});

void (async () => {
  if (isPostgresEnabled()) {
    try {
      await initializePostgres();
      console.log('🐘 Postgres persistence enabled');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Postgres initialization failed: ${message}`);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 SentriX Server running on port ${PORT}`);
  });
})();

export default app;
