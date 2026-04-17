// Model Binding Service - Unified model state for UI
import axios from 'axios'
import { runtime } from '../config/runtime'

export type BoundModelsState = {
  baseUrl: string
  defaultModel: string
  codeModel: string
  pythonModel: string
  availableModels: string[]
}

export class ModelBindingService {
  async getState(): Promise<BoundModelsState> {
    try {
      const res = await axios.get(`${runtime.ollama.baseUrl}/api/tags`, {
        timeout: runtime.ollama.timeoutMs,
      })
      const availableModels = (res.data?.models || []).map((m: any) => m.name)
      return {
        baseUrl: runtime.ollama.baseUrl,
        defaultModel: runtime.ollama.defaultModel,
        codeModel: runtime.ollama.codeModel,
        pythonModel: runtime.ollama.pythonModel,
        availableModels,
      }
    } catch (error: any) {
      return {
        baseUrl: runtime.ollama.baseUrl,
        defaultModel: runtime.ollama.defaultModel,
        codeModel: runtime.ollama.codeModel,
        pythonModel: runtime.ollama.pythonModel,
        availableModels: [],
      }
    }
  }

  validateSelection(model: string, availableModels: string[]) {
    return availableModels.includes(model)
  }
}

export const modelBindingService = new ModelBindingService()
export default modelBindingService