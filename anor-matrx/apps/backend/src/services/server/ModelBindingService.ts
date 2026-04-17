// Model Binding Service - Backend version
import axios from 'axios';

function getOllamaUrl() {
  const baseUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
  return baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
}

function getModelFromEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export type BoundModelsState = {
  baseUrl: string;
  defaultModel: string;
  codeModel: string;
  pythonModel: string;
  availableModels: string[];
};

export class ModelBindingService {
  async getState(): Promise<BoundModelsState> {
    const baseUrl = getOllamaUrl();
    const timeout = parseInt(process.env.OLLAMA_TIMEOUT_MS || '120000', 10);

    try {
      const res = await axios.get(`${baseUrl}/api/tags`, { timeout });
      const availableModels = (res.data?.models || []).map((m: any) => m.name);

      return {
        baseUrl,
        defaultModel: getModelFromEnv('OLLAMA_MODEL', 'gemma3:latest'),
        codeModel: getModelFromEnv('OLLAMA_CODE_MODEL', 'qwen2.5-coder:3b'),
        pythonModel: getModelFromEnv('OLLAMA_PYTHON_MODEL', 'deepseek-coder:latest'),
        availableModels,
      };
    } catch {
      return {
        baseUrl,
        defaultModel: getModelFromEnv('OLLAMA_MODEL', 'gemma3:latest'),
        codeModel: getModelFromEnv('OLLAMA_CODE_MODEL', 'qwen2.5-coder:3b'),
        pythonModel: getModelFromEnv('OLLAMA_PYTHON_MODEL', 'deepseek-coder:latest'),
        availableModels: [],
      };
    }
  }

  validateSelection(model: string, availableModels: string[]) {
    return availableModels.includes(model);
  }
}

export const modelBindingService = new ModelBindingService();