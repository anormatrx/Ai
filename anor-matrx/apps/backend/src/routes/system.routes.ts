import { Router } from 'express';
import dotenv from 'dotenv';

dotenv.config();

import { loadSettings, publicSettings, saveSettings } from '../services/settings.service';
import { activityLog, getActivityLogs } from '../services/activityLog.service';
import { analyze, healthCheck } from '../services/openclaw.service';
import { checkOllamaHealth, listOllamaModels } from '../providers/ollamaRuntime';
import { checkOpenAIHealth, checkGeminiHealth, checkGitHubHealth, checkGDriveHealth } from '../providers/cloudProviders';
import { modelBindingService } from '../services/server/ModelBindingService';
import { resolveSkills } from '../services/server/SkillsResolver';

const RUNTIME = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
    defaultModel: process.env.OLLAMA_MODEL || 'gemma3:latest',
  },
  openclaw: {
    provider: process.env.OPENCLAW_PROVIDER || 'ollama',
    defaultModel: process.env.OPENCLAW_DEFAULT_MODEL || 'ollama/gemma3:latest',
  },
  app: {
    workspace: process.env.APP_WORKSPACE || '',
    dataDir: process.env.APP_DATA_DIR || '',
  },
  ports: {
    backend: parseInt(process.env.BACKEND_PORT || '3002', 10),
    frontend: parseInt(process.env.FRONTEND_PORT || '3000', 10),
    pythonRoom: parseInt(process.env.PYTHON_ROOM_PORT || '3210', 10),
  },
};

export const systemRoutes = Router();

systemRoutes.get('/settings', (_req, res) => {
  res.json(publicSettings());
});

systemRoutes.post('/settings', (req, res) => {
  const saved = saveSettings(req.body);
  activityLog('success', 'settings_update', 'Settings saved', 'settings');
  res.json({ ok: true, settings: saved });
});

systemRoutes.post('/health/ollama', async (_req, res) => {
  const result = await checkOllamaHealth();
  activityLog(result.ok ? 'success' : 'error', 'health_check', result.message, 'ollama', { latencyMs: result.latencyMs });
  res.json(result);
});

systemRoutes.post('/health/openai', async (_req, res) => {
  const s = loadSettings();
  const result = await checkOpenAIHealth(s.openai?.apiKey || '', s.openai?.baseUrl);
  activityLog(result.ok ? 'success' : 'error', 'health_check', result.message, 'openai', { latencyMs: result.latencyMs });
  res.json(result);
});

systemRoutes.post('/health/gemini', async (_req, res) => {
  const s = loadSettings();
  const result = await checkGeminiHealth(s.gemini?.apiKey || '');
  activityLog(result.ok ? 'success' : 'error', 'health_check', result.message, 'gemini', { latencyMs: result.latencyMs });
  res.json(result);
});

systemRoutes.post('/health/github', async (_req, res) => {
  const s = loadSettings();
  const result = await checkGitHubHealth(s.github?.token || '');
  activityLog(result.ok ? 'success' : 'error', 'health_check', result.message, 'github', { latencyMs: result.latencyMs });
  res.json(result);
});

systemRoutes.post('/health/gdrive', async (_req, res) => {
  const s = loadSettings();
  const result = await checkGDriveHealth(s.gdrive?.clientId || '');
  activityLog(result.ok ? 'success' : 'error', 'health_check', result.message, 'gdrive', { latencyMs: result.latencyMs });
  res.json(result);
});

systemRoutes.get('/system/status', async (_req, res) => {
  const s = loadSettings();

  const [ollama, openai, gemini, github, gdrive] = await Promise.all([
    checkOllamaHealth(),
    checkOpenAIHealth(s.openai?.apiKey || '', s.openai?.baseUrl),
    checkGeminiHealth(s.gemini?.apiKey || ''),
    checkGitHubHealth(s.github?.token || ''),
    checkGDriveHealth(s.gdrive?.clientId || ''),
  ]);

  res.json({
    ok: [ollama, openai, gemini, github, gdrive].every(x => x.ok),
    services: { ollama, openai, gemini, github, gdrive },
    checkedAt: new Date().toISOString(),
  });
});

systemRoutes.get('/logs', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  res.json({ logs: getActivityLogs(limit) });
});

systemRoutes.get('/openclaw/health', async (_req, res) => {
  const result = await healthCheck();
  activityLog(result.ok ? 'success' : 'error', 'openclaw_health', `OpenClaw: ${result.ok}`, 'openclaw', { latencyMs: result.latencyMs, version: result.version });
  res.json(result);
});

systemRoutes.get('/openclaw/analyze', async (req, res) => {
  const { prompt, model } = req.query;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required for analysis' });
  }
  
  try {
    const result = await analyze(prompt as string, model as string || 'auto');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

systemRoutes.post('/openclw/chat', async (req, res) => {
  const { prompt, selectedModel } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  try {
    const result = await analyze(prompt, selectedModel || 'auto');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

systemRoutes.get('/system/health', async (_req, res) => {
  try {
    const ollamaHealth = await checkOllamaHealth();
    const models = await listOllamaModels();
    const openclawHealth = await healthCheck();

    res.json({
      ollama: {
        ok: ollamaHealth.ok,
        baseUrl: RUNTIME.ollama.baseUrl,
        models: ollamaHealth.models,
        error: ollamaHealth.ok ? null : ollamaHealth.message,
      },
      openclaw: {
        ok: openclawHealth.ok,
        provider: RUNTIME.openclaw.provider,
        model: RUNTIME.openclaw.defaultModel,
        version: openclawHealth.version,
        status: openclawHealth.ok ? 'connected' : 'disconnected',
        error: openclawHealth.ok ? null : 'OpenClaw check failed',
      },
      app: {
        workspace: RUNTIME.app.workspace,
        backendPort: RUNTIME.ports.backend,
        frontendPort: RUNTIME.ports.frontend,
        pythonRoomPort: RUNTIME.ports.pythonRoom,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

systemRoutes.get('/models/binding', async (_req, res) => {
  try {
    const state = await modelBindingService.getState();
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

systemRoutes.get('/skills', async (_req, res) => {
  try {
    const skills = resolveSkills();
    console.log('[skills endpoint] Resolved:', JSON.stringify(skills));
    res.json(skills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});