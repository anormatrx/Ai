import { apiRequest } from './client';
import type { HealthReport } from '../types/system';

export const systemApi = {
  getHealth() {
    return apiRequest<HealthReport>('/system/health');
  },
  getStatus() {
    return apiRequest<any>('/system/status');
  },
  getLogs(limit = 50) {
    return apiRequest<any>(`/logs?limit=${limit}`);
  },
  checkService(service: 'ollama' | 'openai' | 'gemini' | 'github' | 'gdrive') {
    return apiRequest<any>(`/health/${service}`, { method: 'POST' });
  },
};