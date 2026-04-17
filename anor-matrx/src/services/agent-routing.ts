// src/services/agent-routing.ts
// Agent Routing Service - Route tasks to appropriate models

import { runtime, getResolvedAgentModel, getResolvedOpenClawModel } from "../config/runtime";

export type AgentTaskKind =
  | "general-chat"
  | "code-generation"
  | "python-analysis"
  | "skill-authoring"
  | "diagnostics"
  | "web-search"
  | "file-operations"
  | "terminal-execution";

/**
 * Resolve the appropriate Ollama model for a specific task
 */
export function resolveModelForTask(task: AgentTaskKind): string {
  switch (task) {
    case "code-generation":
      return runtime.ollama.codeModel;
    case "python-analysis":
      return runtime.ollama.pythonModel;
    case "skill-authoring":
      return runtime.ollama.codeModel;
    case "diagnostics":
      return runtime.ollama.codeModel;
    case "terminal-execution":
      return runtime.ollama.pythonModel;
    case "web-search":
      return runtime.ollama.defaultModel;
    case "file-operations":
      return runtime.ollama.defaultModel;
    default:
      return runtime.ollama.defaultModel;
  }
}

/**
 * Resolve the appropriate OpenClaw model for a specific task
 * OpenClaw uses provider/model format
 */
export function resolveOpenClawModelForTask(task: AgentTaskKind): string {
  switch (task) {
    case "code-generation":
      return runtime.openclaw.codeModel;
    case "python-analysis":
      return runtime.openclaw.pythonModel;
    default:
      return runtime.openclaw.defaultModel;
  }
}

/**
 * Get the provider name for OpenClaw
 */
export function getOpenClawProvider(): string {
  return runtime.openclaw.provider;
}

/**
 * Get the base URL for OpenClaw/Ollama
 */
export function getOpenClawBaseUrl(): string {
  return runtime.openclaw.baseUrl;
}

/**
 * Get model with fallback chain
 * Returns first available model from preferred list
 */
export function getModelWithFallback(preferredModels: string[]): string {
  // First try preferred models in order
  for (const model of preferredModels) {
    if (model) return model;
  }
  
  // Fallback to runtime default
  return runtime.ollama.defaultModel;
}

/**
 * Get all model assignments for logging/debugging
 */
export function getModelAssignments(): Record<string, string> {
  return {
    default: runtime.ollama.defaultModel,
    code: runtime.ollama.codeModel,
    python: runtime.ollama.pythonModel,
    openclaw: runtime.openclaw.defaultModel,
    openclawCode: runtime.openclaw.codeModel,
    openclawPython: runtime.openclaw.pythonModel,
  };
}

export default {
  resolveModelForTask,
  resolveOpenClawModelForTask,
  getOpenClawProvider,
  getOpenClawBaseUrl,
  getModelWithFallback,
  getModelAssignments,
};