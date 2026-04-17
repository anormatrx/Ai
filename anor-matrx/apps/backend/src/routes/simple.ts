import express from 'express';
import { publicSettings, saveSettings } from '../services/settings.service';
import { analyze, healthCheck } from '../services/openclaw.service';
import { checkOllamaHealth, listOllamaModels } from '../providers/ollamaRuntime';
import { resolveSkills } from '../services/server/SkillsResolver';

const router = express.Router();

console.log('[simple.ts] Loading routes...');

// Diagnostics endpoint for Dashboard
router.get('/diagnostics', async (_req, res) => {
  console.log('[simple.ts] /diagnostics called');
  try {
    const ollamaHealth = await checkOllamaHealth();
    const models = await listOllamaModels();
    res.json({
      status: ollamaHealth.ok ? 'Healthy' : 'Degraded',
      uptime: process.uptime ? process.uptime() * 1000 : 0,
      memory: {
        rss: process.memoryUsage().rss,
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
      },
      ollama: {
        ok: ollamaHealth.ok,
        message: ollamaHealth.message,
        modelsCount: models.length,
      },
      services: {
        openclaw: ollamaHealth.ok,
        python: true,
        terminal: true,
      },
    });
  } catch (error: any) {
    res.json({
      status: 'Error',
      error: error.message,
    });
  }
});

// Terminal endpoint
router.post('/terminal', async (req, res) => {
  const { command } = req.body;
  console.log('[simple.ts] /terminal called with:', command);
  
  // Mock terminal response for now
  res.json({
    output: `Command "${command}" would be executed here`,
    cwd: '/app/applet',
  });
});

// Health
router.get('/health', (_req, res) => {
  console.log('[simple.ts] /health called');
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// Settings
router.get('/settings', (_req, res) => {
  console.log('[simple.ts] /settings called');
  res.json(publicSettings());
});

router.post('/settings', express.json(), (req, res) => {
  const saved = saveSettings(req.body);
  res.json({ ok: true, settings: saved });
});

// System health
router.get('/system/health', async (_req, res) => {
  console.log('[simple.ts] /system/health called');
  try {
    const ollamaHealth = await checkOllamaHealth();
    const models = await listOllamaModels();
    const openclawHealth = await healthCheck();
    res.json({
      ollama: { ok: ollamaHealth.ok, models: ollamaHealth.models },
      openclaw: { ok: openclawHealth.ok, version: openclawHealth.version },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// OpenClaw
router.get('/openclw/health', async (_req, res) => {
  console.log('[simple.ts] /openclw/health called');
  const result = await healthCheck();
  res.json(result);
});

router.get('/openclw/analyze', async (req, res) => {
  const { prompt, model } = req.query;
  const result = await analyze(String(prompt || ''), String(model || 'auto'));
  res.json(result);
});

// Skills
router.get('/skills', async (_req, res) => {
  console.log('[simple.ts] /skills called');
  const skills = resolveSkills();
  res.json(skills);
});

export default router;