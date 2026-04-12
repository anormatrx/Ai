const API_BASE = 'http://127.0.0.1:3002/api';

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  details?: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface EngineStatus {
  ok: boolean;
  version?: string;
  latencyMs?: number;
  lastConnection?: string;
  connected: boolean;
  services: {
    ollama: { ok: boolean; message?: string; latencyMs?: number; models?: string[] };
    openai: { ok: boolean; message?: string };
    gemini: { ok: boolean; message?: string };
    openclaw: { ok: boolean; message?: string };
  };
}

export interface ModelRegistration {
  name: string;
  provider: string;
  version: string;
  status: 'ready' | 'deploying' | 'error' | 'inactive';
  size?: number;
  compatibility: 'compatible' | 'limited' | 'unsupported';
  recommendedUse: 'general' | 'code' | 'cleanup' | 'none';
}

const COMPATIBILITY_MAP: Record<string, { compatibility: ModelRegistration['compatibility'], recommendedUse: ModelRegistration['recommendedUse'] }> = {
  'gemma3:latest': { compatibility: 'compatible', recommendedUse: 'general' },
  'gemma4:e4b': { compatibility: 'limited', recommendedUse: 'general' },
  'qwen2.5-coder:3b': { compatibility: 'compatible', recommendedUse: 'code' },
  'deepseek-coder:latest': { compatibility: 'compatible', recommendedUse: 'cleanup' },
  'deepseek-v3.1:671b-cloud': { compatibility: 'limited', recommendedUse: 'general' },
  'qwen3-coder:480b-cloud': { compatibility: 'unsupported', recommendedUse: 'none' },
  'gpt-oss:120b-cloud': { compatibility: 'unsupported', recommendedUse: 'none' },
  'gpt-oss:20b-cloud': { compatibility: 'unsupported', recommendedUse: 'none' },
};

export type ModelFilter = 'all' | 'compatible' | 'recommended' | 'coding';

export interface ThoughtStep {
  id: number;
  type: 'reasoning' | 'tool_selection' | 'action' | 'complete';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  status: 'pending' | 'in_progress' | 'completed';
  timestamp: string;
}

export interface LiveLog {
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warn';
  action: string;
  service?: string;
  message: string;
}

class OpenClawIntegrationService {
  private pollingInterval: NodeJS.Timeout | null = null;

  private getCompatibilityInfo(modelName: string) {
    // Exact match first
    if (COMPATIBILITY_MAP[modelName]) {
      return COMPATIBILITY_MAP[modelName];
    }
    // Try partial match
    for (const [key, value] of Object.entries(COMPATIBILITY_MAP)) {
      if (modelName.startsWith(key.split(':')[0])) {
        return value;
      }
    }
    // Fallback
    return { compatibility: 'unsupported' as const, recommendedUse: 'none' as const };
  }

  async getRegisteredModels(filter: ModelFilter = 'all'): Promise<ModelRegistration[]> {
    try {
      const res = await fetch(`${API_BASE}/ollama/models`);
      if (!res.ok) throw new Error('Failed to fetch models');
      
      const data = await res.json();
      
      // Backend returns string[] not OllamaModel[]
      const modelNames: string[] = data.models || [];
      
      console.log('[OpenClaw] Raw API response:', data);
      console.log('[OpenClaw] Model names array:', modelNames);
      
      // Map string[] to ModelRegistration[]
      let filteredModels = modelNames.map((modelName) => {
        const compatInfo = this.getCompatibilityInfo(modelName);
        return {
          name: modelName,
          provider: 'Ollama',
          version: this.getModelSize(modelName),
          status: 'ready' as const,
          compatibility: compatInfo.compatibility,
          recommendedUse: compatInfo.recommendedUse,
        };
      });
      
      console.log('[OpenClaw] Mapped count:', filteredModels.length);
      console.log('[OpenClaw] Active filter:', filter);

      // Apply filter
      if (filter === 'all') {
        console.log('[OpenClaw] Filter: ALL - returning all models');
        // Return all - no filtering needed
      } else if (filter === 'compatible') {
        filteredModels = filteredModels.filter(m => m.compatibility === 'compatible');
      } else if (filter === 'recommended') {
        filteredModels = filteredModels.filter(m => m.compatibility === 'compatible' && m.recommendedUse !== 'none');
      } else if (filter === 'coding') {
        filteredModels = filteredModels.filter(m => m.recommendedUse === 'code');
      }
      
      console.log('[OpenClaw] Final filtered count:', filteredModels.length);

      return filteredModels;
    } catch (error) {
      console.error('[OpenClaw] Failed to get models:', error);
      return [];
    }
  }

  private getModelSize(modelName: string): string {
    const sizeMap: Record<string, string> = {
      'gemma3': '4.3B',
      'gemma4': '8B',
      'qwen2.5-coder': '3.1B',
      'deepseek-coder': '1B',
      'deepseek-v3.1': '671B',
      'qwen3-coder': '480B',
      'gpt-oss': '20B-120B',
    };
    
    for (const [key, size] of Object.entries(sizeMap)) {
      if (modelName.includes(key)) return size;
    }
    return '-';
  }

  async getCompatibleModels(): Promise<ModelRegistration[]> {
    return this.getRegisteredModels('compatible');
  }

  async getEngineStatus(): Promise<EngineStatus> {
    try {
      const [statusRes, ollamaRes] = await Promise.all([
        fetch(`${API_BASE}/system/status`),
        fetch(`${API_BASE}/ollama/health`),
      ]);

      const status = await statusRes.json();
      const ollamaHealth = ollamaRes.ok ? await ollamaRes.json() : { ok: false, models: [] };

      return {
        ok: status.ok && ollamaHealth.ok,
        version: 'v2026.4.8',
        lastConnection: new Date().toISOString(),
        connected: ollamaHealth.ok,
        services: {
          ollama: {
            ok: ollamaHealth.ok,
            message: ollamaHealth.message || (ollamaHealth.ok ? 'Online' : 'Offline'),
            latencyMs: ollamaHealth.latencyMs,
            models: ollamaHealth.models || [],
          },
          openai: { ok: status.services?.openai?.ok || false },
          gemini: { ok: status.services?.gemini?.ok || false },
          openclaw: { ok: ollamaHealth.ok, message: 'Active' },
        },
      };
    } catch (error) {
      return {
        ok: false,
        connected: false,
        services: {
          ollama: { ok: false, message: 'Connection failed' },
          openai: { ok: false },
          gemini: { ok: false },
          openclaw: { ok: false, message: 'Connection failed' },
        },
      };
    }
  }

  async deployModel(modelName: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/ollama/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName }),
      });

      if (res.ok) {
        return { success: true, message: `Model ${modelName} deployed successfully` };
      } else {
        const err = await res.json();
        return { success: false, message: err.error || 'Deploy failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error during deployment' };
    }
  }

  async getThoughtProcess(): Promise<ThoughtStep[]> {
    try {
      const res = await fetch(`${API_BASE}/logs?limit=5`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      
      const data = await res.json();
      const logs = data.logs || [];

      return logs.slice(0, 3).map((log: any, idx: number) => ({
        id: idx,
        type: idx === 0 ? 'reasoning' : idx === 1 ? 'tool_selection' : 'action',
        title: idx === 0 ? 'Reasoning' : idx === 1 ? 'Tool Selection' : 'Action',
        titleAr: idx === 0 ? 'تفكير' : idx === 1 ? 'اختيار الأداة' : 'تنفيذ',
        description: `Processing: ${log.action}`,
        descriptionAr: `جاري المعالجة: ${log.action}`,
        status: 'completed' as const,
        timestamp: log.timestamp,
      }));
    } catch (error) {
      return [];
    }
  }

  async getLiveLogs(): Promise<LiveLog[]> {
    try {
      const res = await fetch(`${API_BASE}/logs?limit=15`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      
      const data = await res.json();
      return (data.logs || []).map((log: any) => ({
        timestamp: log.timestamp,
        level: log.level || 'info',
        action: log.action || 'system',
        service: log.service,
        message: log.message || '',
      }));
    } catch (error) {
      return [];
    }
  }

  async testOllamaConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/ollama/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  startPolling(callback: () => void, intervalMs = 10000) {
    this.stopPolling();
    callback();
    this.pollingInterval = setInterval(callback, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}

export const openclawService = new OpenClawIntegrationService();
export default openclawService;