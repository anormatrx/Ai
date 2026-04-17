import { apiRequest } from './client';
import type { BoundModelsState } from '../types/system';

export const modelsApi = {
  getBindingState() {
    return apiRequest<BoundModelsState>('/models/binding');
  },
  getOllamaModels() {
    return apiRequest<any>('/ollama/models');
  },
  checkModel(model: string) {
    return apiRequest<any>('/ollama/check', {
      method: 'POST',
      body: JSON.stringify({ model }),
    });
  },
};