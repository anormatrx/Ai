// src/services/health.service.ts
// Health Service - Unified health check for all components

import axios from "axios";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { runtime } from "../config/runtime";

const execAsync = promisify(exec);

export type HealthStatus = "healthy" | "degraded" | "offline";

export type OllamaHealth = {
  status: HealthStatus;
  baseUrl: string;
  models: string[];
  latencyMs?: number;
  error?: string;
};

export type OpenClawHealth = {
  status: HealthStatus;
  provider: string;
  defaultModel: string;
  gatewayStatus?: string;
  rpcStatus?: string;
  error?: string;
};

export type AppHealth = {
  status: HealthStatus;
  workspace: string;
  dataDir: string;
};

export type HealthReport = {
  timestamp: string;
  overall: HealthStatus;
  ollama: OllamaHealth;
  openclaw: OpenClawHealth;
  app: AppHealth;
};

/**
 * Check Ollama health
 */
async function checkOllama(): Promise<OllamaHealth> {
  const start = Date.now();
  
  try {
    const response = await axios.get(`${runtime.ollama.baseUrl}/api/tags`, {
      timeout: runtime.ollama.timeoutMs,
    });
    
    const models = (response.data?.models || []).map((m: any) => m.name);
    const latencyMs = Date.now() - start;
    
    return {
      status: models.length > 0 ? "healthy" : "degraded",
      baseUrl: runtime.ollama.baseUrl,
      models,
      latencyMs,
    };
  } catch (error: any) {
    return {
      status: "offline",
      baseUrl: runtime.ollama.baseUrl,
      models: [],
      error: error.message,
    };
  }
}

/**
 * Check OpenClaw Gateway health
 */
async function checkOpenClaw(): Promise<OpenClawHealth> {
  try {
    const { stdout } = await execAsync("openclaw gateway status", { timeout: 10000 });
    
    const isRunning = stdout.includes("Runtime: running");
    const rpcOk = stdout.includes("RPC probe: ok");
    
    return {
      status: isRunning && rpcOk ? "healthy" : "degraded",
      provider: runtime.openclaw.provider,
      defaultModel: runtime.openclaw.defaultModel,
      gatewayStatus: isRunning ? "running" : "stopped",
      rpcStatus: rpcOk ? "ok" : "failed",
    };
  } catch (error: any) {
    return {
      status: "offline",
      provider: runtime.openclaw.provider,
      defaultModel: runtime.openclaw.defaultModel,
      error: error.message,
    };
  }
}

/**
 * Check application health
 */
function checkApp(): AppHealth {
  const workspaceExists = runtime.app.workspace && 
    (runtime.app.workspace === "" || require("node:fs").existsSync(runtime.app.workspace));
  
  return {
    status: workspaceExists ? "healthy" : "degraded",
    workspace: runtime.app.workspace,
    dataDir: runtime.app.dataDir,
  };
}

/**
 * Get full health report
 */
export async function getHealthReport(): Promise<HealthReport> {
  const [ollama, openclaw, app] = await Promise.all([
    checkOllama(),
    checkOpenClaw(),
    Promise.resolve(checkApp()),
  ]);
  
  const statuses = [ollama.status, openclaw.status, app.status];
  const overall: HealthStatus = statuses.every(s => s === "healthy") ? "healthy" 
    : statuses.some(s => s === "offline") ? "offline" 
    : "degraded";
  
  return {
    timestamp: new Date().toISOString(),
    overall,
    ollama,
    openclaw,
    app,
  };
}

/**
 * Simple health check - returns boolean
 */
export async function isHealthy(): Promise<boolean> {
  const report = await getHealthReport();
  return report.ollama.status === "healthy" || report.openclaw.status === "healthy";
}

/**
 * Get formatted health status for display
 */
export function formatHealthReport(report: HealthReport): string {
  const lines = [
    "╔══════════════════════════════════════╗",
    "║      ANOR-MATRX Health Report        ║",
    "╠══════════════════════════════════════╣",
    `║ Overall: ${report.overall.toUpperCase().padEnd(23)}║`,
    "╠══════════════════════════════════════╣",
    `║ Ollama: ${report.ollama.status.toUpperCase().padEnd(23)}║`,
    `║   URL: ${report.ollama.baseUrl.padEnd(28)}║`,
    `║   Models: ${report.ollama.models.length.toString().padEnd(26)}║`,
    ...report.ollama.models.slice(0, 3).map(m => `║   - ${m.padEnd(36)}║`),
    "╠══════════════════════════════════════╣",
    `║ OpenClaw: ${report.openclaw.status.toUpperCase().padEnd(21)}║`,
    `║   Provider: ${report.openclaw.provider.padEnd(25)}║`,
    `║   Model: ${report.openclaw.defaultModel.padEnd(28)}║`,
    "╚══════════════════════════════════════╝",
  ];
  return lines.join("\n");
}

export default {
  getHealthReport,
  isHealthy,
  formatHealthReport,
};