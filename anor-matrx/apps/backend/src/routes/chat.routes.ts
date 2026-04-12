import { Router } from 'express';
import { chatWithOllama, checkOllamaHealth, checkModelExists, getModelNameForProvider, listOllamaModels } from '../providers/ollamaRuntime';
import { chatWithOpenAI, checkOpenAIHealth, checkGeminiHealth, chatWithGemini, checkGitHubHealth, checkGDriveHealth } from '../providers/cloudProviders';
import { activityLog } from '../services/activityLog.service';
import { analyze } from '../services/openclaw.service';
import { loadSettings } from '../services/settings.service';

export const chatRoutes = Router();

// Priority fallback chain: cloud → best local → other locals
const FALLBACK_CHAIN = [
  { model: 'deepseek-v3.1:671b-cloud', provider: 'ollama', name: 'DeepSeek V3' },
  { model: 'qwen2.5-coder:3b', provider: 'ollama', name: 'Qwen Coder' },
  { model: 'gemma4:e4b', provider: 'ollama', name: 'Gemma 4' },
  { model: 'deepseek-coder:latest', provider: 'ollama', name: 'DeepSeek Coder' },
  { model: 'gpt-oss:120b-cloud', provider: 'ollama', name: 'GPT-OSS' },
];

async function findBestAvailableModel(): Promise<{ model: string; name: string } | null> {
  const available = await listOllamaModels();
  const modelNames = available.map(m => m.name);
  
  for (const fallback of FALLBACK_CHAIN) {
    if (modelNames.includes(fallback.model)) {
      return { model: fallback.model, name: fallback.name };
    }
  }
  return null;
}

async function tryLocalFallback(): Promise<{ response: string; model: string; provider: string } | null> {
  const bestLocal = await findBestAvailableModel();
  if (!bestLocal) return null;
  
  try {
    const result = await chatWithOllama('Ping test', bestLocal.model);
    return {
      response: result.response,
      model: bestLocal.model,
      provider: 'ollama'
    };
  } catch {
    return null;
  }
}

async function routeChat(req: { body: { message: string; selectedModel: string } }, res: { json: (data: unknown) => void; status: (code: number) => { json: (data: unknown) => void } }) {
  const { message, selectedModel } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const modelChoice = selectedModel || 'auto';

  try {
    activityLog('info', 'chat_request', 'Chat request received', 'chat', { messageLength: message.length, model: modelChoice });

    // Step 1: OpenClaw analyzes and decides
    const openclwResult = await analyze(message, modelChoice);
    const decision = openclwResult.decision;

    activityLog('info', 'openclaw_decision', `OpenClaw resolved to ${decision.provider}:${decision.model}`, 'chat', {
      model: decision.model,
      provider: decision.provider,
      intent: decision.intent.type,
    });

    const ollamaModelName = getModelNameForProvider(decision.model);

    // ====== OLLAMA ROUTE ======
    if (decision.provider === 'ollama' && ollamaModelName) {
      const modelCheck = await checkModelExists(ollamaModelName);
      
      if (!modelCheck.ok || !modelCheck.foundModel) {
        // Try fallback to another local model
        const fallbackModel = await findBestAvailableModel();
        if (fallbackModel) {
          activityLog('warn', 'ollama_fallback', `Trying fallback: ${fallbackModel.name}`, 'chat');
          
          const ollamaResult = await chatWithOllama(message, fallbackModel.model);
          
          activityLog('success', 'ollama_response', `Response from fallback: ${fallbackModel.name}`, 'chat', {
            model: fallbackModel.model,
          });
          
          return res.json({
            ok: true,
            response: ollamaResult.response,
            provider: 'ollama',
            model: fallbackModel.model,
            decision,
            usedFallback: true,
          });
        }
        
        const errorMsg = `Model '${ollamaModelName}' not found. Available: ${modelCheck.models.join(', ')}`;
        activityLog('error', 'ollama_model', errorMsg, 'chat');
        
        return res.json({
          ok: false,
          error: errorMsg,
          decision: { ...decision, modelNotFound: true },
          availableModels: modelCheck.models,
        });
      }

      activityLog('info', 'ollama_chat', `Sending to Ollama:${ollamaModelName}`, 'chat');

      const ollamaResult = await chatWithOllama(message, modelCheck.foundModel);

      activityLog('success', 'ollama_response', `Ollama response received`, 'chat', {
        model: ollamaModelName,
        responseLength: ollamaResult.response.length,
      });

      return res.json({
        ok: true,
        response: ollamaResult.response,
        provider: 'ollama',
        model: ollamaModelName,
        decision,
      });
    }

    // ====== OPENAI ROUTE ======
    if (decision.provider === 'openai') {
      const settings = loadSettings();
      const apiKey = settings.openai?.apiKey;

      if (!apiKey) {
        // FALLBACK: Try local Ollama instead of failing
        activityLog('warn', 'openai_missing_key', 'OpenAI key missing, trying local fallback', 'chat');
        
        const localResult = await tryLocalFallback();
        if (localResult) {
          return res.json({
            ok: true,
            response: localResult.response,
            provider: 'ollama',
            model: localResult.model,
            decision,
            usedFallback: true,
            fallbackFrom: 'openai',
          });
        }
        
        return res.json({
          ok: false,
          error: 'OPENAI_API_KEY not configured AND no local models available.',
          decision,
          needsKey: true,
        });
      }

      activityLog('info', 'openai_chat', `Sending to OpenAI:${decision.model}`, 'chat');

      const openaiResult = await chatWithOpenAI(message, {
        apiKey,
        baseUrl: settings.openai?.baseUrl,
        model: decision.model,
      });

      activityLog('success', 'openai_response', `OpenAI response received`, 'chat', {
        model: decision.model,
        responseLength: openaiResult.response.length,
      });

      return res.json({
        ok: true,
        response: openaiResult.response,
        provider: 'openai',
        model: decision.model,
        decision,
      });
    }

    // ====== GEMINI ROUTE ======
    if (decision.provider === 'gemini') {
      const settings = loadSettings();
      const apiKey = settings.gemini?.apiKey;

      if (!apiKey) {
        // FALLBACK: Try local Ollama instead of failing
        activityLog('warn', 'gemini_missing_key', 'Gemini key missing, trying local fallback', 'chat');
        
        const localResult = await tryLocalFallback();
        if (localResult) {
          return res.json({
            ok: true,
            response: localResult.response,
            provider: 'ollama',
            model: localResult.model,
            decision,
            usedFallback: true,
            fallbackFrom: 'gemini',
          });
        }
        
        return res.json({
          ok: false,
          error: 'GEMINI_API_KEY not configured AND no local models available.',
          decision,
          needsKey: true,
        });
      }

      activityLog('info', 'gemini_chat', `Sending to Gemini:${decision.model}`, 'chat');

      const geminiResult = await chatWithGemini(message, apiKey, decision.model || 'gemini-2.0-flash');

      activityLog('success', 'gemini_response', `Gemini response received`, 'chat', {
        model: decision.model,
        responseLength: geminiResult.response.length,
      });

      return res.json({
        ok: true,
        response: geminiResult.response,
        provider: 'gemini',
        model: decision.model,
        decision,
      });
    }

    activityLog('warn', 'unsupported_provider', `No route for provider: ${decision.provider}`, 'chat');
    
    return res.status(400).json({
      error: `Unsupported provider: ${decision.provider}.`,
      decision,
    });

  } catch (error: any) {
    activityLog('error', 'chat_error', `Chat error: ${error.message}`, 'chat');
    res.status(500).json({ error: error.message });
  }
}

chatRoutes.post('/chat/complete', async (req, res) => {
  await routeChat(req, res);
});

chatRoutes.get('/ollama/health', async (_req, res) => {
  try {
    const health = await checkOllamaHealth();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

chatRoutes.get('/ollama/models', async (_req, res) => {
  try {
    const health = await checkOllamaHealth();
    if (health.ok && health.models) {
      res.json({ ok: true, models: health.models });
    } else {
      res.json({ ok: false, models: [], message: health.message });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

chatRoutes.post('/ollama/check', async (req, res) => {
  const { model } = req.body;
  const modelName = model || 'gemma3';
  
  try {
    const result = await checkModelExists(modelName);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

chatRoutes.get('/providers/health', async (_req, res) => {
  try {
    const settings = loadSettings();
    
    const [ollama, openai, gemini, github, gdrive] = await Promise.all([
      checkOllamaHealth(),
      checkOpenAIHealth(settings.openai?.apiKey || '', settings.openai?.baseUrl),
      checkGeminiHealth(settings.gemini?.apiKey || ''),
      checkGitHubHealth(settings.github?.token || ''),
      checkGDriveHealth(settings.gdrive?.clientId || ''),
    ]);

    res.json({
      ollama: { ok: ollama.ok, latencyMs: ollama.latencyMs, models: ollama.models },
      openai: { ok: openai.ok, latencyMs: openai.latencyMs },
      gemini: { ok: gemini.ok, latencyMs: gemini.latencyMs },
      github: { ok: github.ok, latencyMs: github.latencyMs },
      gdrive: { ok: gdrive.ok, latencyMs: gdrive.latencyMs },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});