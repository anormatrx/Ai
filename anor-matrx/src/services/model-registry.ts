// src/services/model-registry.ts
// Unified Model Registry Service - Single source for model information

import axios from "axios";
import { runtime, getResolvedAgentModel } from "../config/runtime";

export type AppSurface =
  | "chat"
  | "code-editor"
  | "python-room"
  | "agents"
  | "model-binding"
  | "skills-builder";

export type ListedModel = {
  name: string;
  size?: number;
  modified_at?: string;
  details?: {
    format?: string;
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
};

export class ModelRegistryService {
  private cache: ListedModel[] = [];
  private lastSyncAt = 0;
  private readonly cacheTTL = 15000; // 15 seconds

  /**
   * List all available models from Ollama
   * Uses cache with 15s TTL to avoid excessive API calls
   */
  async listAvailableModels(force = false): Promise<ListedModel[]> {
    const now = Date.now();
    if (!force && this.cache.length && now - this.lastSyncAt < this.cacheTTL) {
      return this.cache;
    }

    try {
      const response = await axios.get(`${runtime.ollama.baseUrl}/api/tags`, {
        timeout: runtime.ollama.timeoutMs,
      });

      this.cache = (response.data?.models || []).map((m: any) => ({
        name: m.name,
        size: m.size,
        modified_at: m.modified_at,
        details: m.details,
      }));
      this.lastSyncAt = now;
      console.log(`[ModelRegistry] Loaded ${this.cache.length} models from ${runtime.ollama.baseUrl}`);
      return this.cache;
    } catch (error: any) {
      console.error("[ModelRegistry] Failed to fetch models:", error.message);
      return this.cache.length ? this.cache : [];
    }
  }

  /**
   * Get the default model for a specific surface
   * Falls back to global default if surface-specific not set
   */
  getDefaultModelForSurface(surface: AppSurface): string {
    switch (surface) {
      case "code-editor":
        return runtime.ollama.codeModel;
      case "python-room":
        return runtime.ollama.pythonModel;
      default:
        return runtime.ollama.defaultModel;
    }
  }

  /**
   * Check if a specific model exists in Ollama
   */
  async assertModelExists(model: string): Promise<boolean> {
    const models = await this.listAvailableModels();
    return models.some((m) => m.name === model);
  }

  /**
   * Ensure a model is available for a surface
   * Falls back to first available model if preferred not found
   */
  async ensureSurfaceModel(surface: AppSurface): Promise<string> {
    const candidate = this.getDefaultModelForSurface(surface);
    const exists = await this.assertModelExists(candidate);
    if (exists) return candidate;

    const models = await this.listAvailableModels(true);
    if (models.length === 0) {
      throw new Error("No Ollama models are available. Please check Ollama is running.");
    }

    console.warn(`[ModelRegistry] Model '${candidate}' not found, falling back to '${models[0].name}'`);
    return models[0].name;
  }

  /**
   * Get models filtered by capability
   */
  async getModelsByCapability(capability: "code" | "general" | "python"): Promise<ListedModel[]> {
    const models = await this.listAvailableModels();
    
    if (capability === "code") {
      return models.filter(m => 
        m.name.includes("coder") || 
        m.name.includes("code") ||
        m.name.includes("qwen")
      );
    }
    if (capability === "python") {
      return models.filter(m => 
        m.name.includes("python") || 
        m.name.includes("deepseek")
      );
    }
    return models;
  }

  /**
   * Get model info by name
   */
  async getModelInfo(modelName: string): Promise<ListedModel | null> {
    const models = await this.listAvailableModels();
    return models.find(m => m.name === modelName) || null;
  }
}

export const modelRegistry = new ModelRegistryService();
export default modelRegistry;