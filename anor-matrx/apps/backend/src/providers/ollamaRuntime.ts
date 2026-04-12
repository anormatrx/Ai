import axios from 'axios';
import { activityLog } from '../services/activityLog.service';

const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = 11434;
const OLLAMA_BASE_URL = `http://${OLLAMA_HOST}:${OLLAMA_PORT}`;
const REQUEST_TIMEOUT = 120000;

export interface OllamaModel {
  name: string;
  size?: number;
  modified_at?: string;
}

export interface OllamaHealthResult {
  ok: boolean;
  latencyMs: number;
  models: string[];
  message: string;
}

export interface OllamaChatResult {
  response: string;
  done: boolean;
  model: string;
}

export interface ModelCheckResult {
  ok: boolean;
  models: string[];
  foundModel?: string;
}

export async function listOllamaModels(): Promise<OllamaModel[]> {
  try {
    const { data } = await axios.get<{ models: OllamaModel[] }>(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 5000 });
    return data.models || [];
  } catch {
    return [];
  }
}

export async function checkOllamaHealth(): Promise<OllamaHealthResult> {
  const started = Date.now();
  
  try {
    const { data } = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 5000 });
    const modelNames = Array.isArray(data?.models) ? data.models.map((m: OllamaModel) => m.name) : [];
    
    return {
      ok: true,
      latencyMs: Date.now() - started,
      models: modelNames,
      message: 'Ollama reachable',
    };
  } catch (error: any) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      models: [],
      message: error?.message || 'Ollama unreachable',
    };
  }
}

export async function checkModelExists(modelName: string): Promise<ModelCheckResult> {
  const models = await listOllamaModels();
  const modelNames = models.map((m) => m.name);
  
  const found = modelNames.find((m) => 
    m.includes(modelName) || m === modelName || m.replace(':', '-') === modelName
  );
  
  return {
    ok: !!found,
    models: modelNames,
    foundModel: found,
  };
}

export async function chatWithOllama(
  message: string, 
  model: string,
  systemPrompt?: string
): Promise<OllamaChatResult> {
  const messages: Array<{ role: string; content: string }> = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: message });

  try {
    const { data } = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model,
        messages,
        stream: false,
      },
      { timeout: REQUEST_TIMEOUT }
    );

    activityLog('success', 'ollama_response', `Response from ${model}`, 'ollama', {
      responseLength: data?.message?.content?.length || 0,
    });

    return {
      response: data?.message?.content || '',
      done: data?.done || false,
      model: data?.model || model,
    };
  } catch (error: any) {
    const errMsg = error?.response?.data?.error || error?.message || 'Ollama chat failed';
    activityLog('error', 'ollama_error', errMsg, 'ollama', { model });
    throw new Error(errMsg);
  }
}

export async function chatWithOllamaStream(
  message: string, 
  model: string,
  onChunk: (chunk: string) => void
): Promise<OllamaChatResult> {
  const messages = [{ role: 'user', content: message }];

  try {
    const { data } = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      { model, messages, stream: true },
      { 
        timeout: REQUEST_TIMEOUT,
        responseType: 'stream'
      }
    );

    let fullResponse = '';
    let finalModel = model;

    for await (const chunk of data) {
      const lines = chunk.toString().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            fullResponse += parsed.message.content;
            onChunk(parsed.message.content);
          }
          if (parsed.model) finalModel = parsed.model;
        } catch {}
      }
    }

    return { response: fullResponse, done: true, model: finalModel };
  } catch (error: any) {
    const errMsg = error?.message || 'Ollama stream failed';
    throw new Error(errMsg);
  }
}

export const AVAILABLE_OLLAMA_MODELS = [
  'gemma3',
  'gemma3:4b',
  'llama3',
  'llama3.1',
  'mistral',
  'phi3',
  'codellama',
  'deepseek-coder',
];

export function getModelNameForProvider(providerModel: string): string | null {
  // REAL models from Ollama - mapping UI names to actual model names
  const MODEL_MAP: Record<string, string> = {
    // Gemma models
    'gemma-3-4b-it-abliterated': 'gemma4:e4b',
    'gemma-3b': 'gemma3:latest',
    'gemma3': 'gemma3:latest',
    'gemma4': 'gemma4:e4b',
    'gemma4:e4b': 'gemma4:e4b',
    'gemma3:latest': 'gemma3:latest',
    
    // Qwen models (best for code!)
    'qwen2.5-coder': 'qwen2.5-coder:3b',
    'qwen3-coder': 'qwen3-coder:480b-cloud',
    'qwen': 'qwen2.5-coder:3b',
    
    // DeepSeek models (best overall!)
    'deepseek': 'deepseek-coder:latest',
    'deepseek-coder': 'deepseek-coder:latest',
    'deepseek-v3': 'deepseek-v3.1:671b-cloud',
    'deepseek-v3.1': 'deepseek-v3.1:671b-cloud',
    'deepseek-coder:latest': 'deepseek-coder:latest',
    'deepseek-v3.1:671b-cloud': 'deepseek-v3.1:671b-cloud',
    
    // Llama models
    'llama3': 'llama3',
    'llama3.1': 'llama3.1',
    
    // Other models
    'mistral': 'mistral',
    'phi3': 'phi3',
    'codellama': 'codellama',
    
    // Aliases
    'auto': 'deepseek-v3.1:671b-cloud', // Best local model!
    'best': 'deepseek-v3.1:671b-cloud',
    'code': 'qwen2.5-coder:3b',
  };
  
  return MODEL_MAP[providerModel] || null;
}