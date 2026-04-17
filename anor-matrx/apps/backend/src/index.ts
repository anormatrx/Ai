import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import router from './routes';
import { SwarmOrchestrator } from './swarm';

dotenv.config();

console.log('[DEBUG] SKILLS_WORKSPACE_DIR:', process.env.SKILLS_WORKSPACE_DIR);

// Initialize Swarm Orchestrator v3 (Single Decision Authority)
const swarm = new SwarmOrchestrator();
console.log('[Swarm v3] Orchestrator initialized - AI Router active');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', time: new Date().toISOString() });
});

// Swarm v3 endpoint - AI-powered execution (ONLY entry point)
app.post('/swarm', async (req, res) => {
  try {
    const { task, context } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }

    console.log(`[Swarm v3] Received task: ${task}`);
    const result = await swarm.run(task, context);

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[Swarm v3] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Swarm status endpoint
app.get('/swarm/status', async (_req, res) => {
  try {
    const status = await swarm.getStatus();
    res.json(status);
  } catch (error: any) {
    res.json({
      service: 'Swarm Orchestrator',
      version: '3.0.0',
      status: 'degraded',
      error: error.message,
    });
  }
});

// Swarm feedback endpoint
app.post('/swarm/feedback', async (req, res) => {
  try {
    const { taskId, feedback } = req.body;
    await swarm.addFeedback(taskId, feedback);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Swarm recent tasks
app.get('/swarm/history', async (_req, res) => {
  try {
    const history = await swarm.getRecentTasks(20);
    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clear swarm memory
app.post('/swarm/clear-memory', async (_req, res) => {
  try {
    await swarm.clearMemory();
    res.json({ success: true, message: 'Memory cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api', router);

const port = Number(process.env.BACKEND_PORT || 3002);

app.listen(port, '127.0.0.1', () => {
  console.log(`Backend running at http://127.0.0.1:${port}`);
  console.log(`Swarm v3 endpoints available:`);
  console.log(`  POST /swarm          - Execute task (AI Router)`);
  console.log(`  GET  /swarm/status   - Get status`);
  console.log(`  POST /swarm/feedback - Add feedback`);
  console.log(`  GET  /swarm/history  - Recent tasks`);
});
