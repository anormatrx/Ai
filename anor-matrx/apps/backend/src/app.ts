import express from 'express';
// Use CommonJS requires to avoid needing extra type definitions in this skeleton
const cors = require('cors');
const helmet = require('helmet');
const pino = require('pino');
const expressPino = require('express-pino-logger');
import config from './config';
import router from './routes';

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// Logging
const logger = pino({ level: (config as any).LOG_LEVEL ?? 'info' });
app.use(expressPino({ logger }));

// Mount routes
app.use('/api', router);

// Health at top-level as quick check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Global error handler can be extended later
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
