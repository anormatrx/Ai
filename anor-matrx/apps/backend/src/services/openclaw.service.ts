import fs from 'node:fs';
import path from 'node:path';
import { activityLog } from './activityLog.service';
import type { LogEntry } from './activityLog.service';

const LOG_DIR = path.join(process.cwd(), 'logs');
const DECISION_LOG = path.join(LOG_DIR, 'openclaw.decisions.log');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

export interface OpenClawIntent {
  type: 'chat' | 'plan' | 'maintenance' | 'web' | 'github' | 'terminal' | 'files' | 'python' | 'code' | 'analysis';
  confidence: number;
  reasoning: string;
}

export interface OpenClawDecision {
  model: string;
  provider: string;
  fallback?: string;
  fallbackProvider?: string;
  intent: OpenClawIntent;
  tools?: string[];
  executionPlan?: string;
}

export interface OpenClawResult {
  decision: OpenClawDecision;
  latencyMs: number;
  logs: string[];
  success: boolean;
  error?: string;
  result?: string;
}

const MODEL_PROVIDER_MAP: Record<string, { provider: string; fallback?: string; fallbackProvider?: string }> = {
  // Auto - BEST available model (priority: best local)
  'auto': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'best': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  
  // Cloud models (if keys available)
  'gemini-3.1-pro-preview': { provider: 'gemini' },
  'gemini-3-flash-preview': { provider: 'gemini' },
  'gpt-4': { provider: 'openai', fallback: 'ollama', fallbackProvider: 'ollama' },
  'gpt-4o-mini': { provider: 'openai', fallback: 'ollama', fallbackProvider: 'ollama' },
  
  // Local models - REAL model names from Ollama
  'gemma-3-4b-it-abliterated': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'gemma3': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'gemma3:latest': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'gemma4:e4b': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'deepseek-v3.1:671b-cloud': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'deepseek-coder:latest': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'qwen2.5-coder:3b': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'qwen3-coder:480b-cloud': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'gpt-oss:120b-cloud': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'gpt-oss:20b-cloud': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'llama3': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'llama3.1': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'mistral': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'phi3': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'codellama': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  
  // Aliases for models
  'deepseek': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'deepseek-v3': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'gemma': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'gemma4': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'qwen': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'qwen2.5-coder': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'qwen3-coder': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
  'code': { provider: 'ollama', fallback: 'gemini', fallbackProvider: 'gemini' },
};

const DEFAULT_MODEL = 'auto';

function getModelConfig(model: string) {
  return MODEL_PROVIDER_MAP[model] || MODEL_PROVIDER_MAP[DEFAULT_MODEL];
}

function detectIntent(prompt: string): OpenClawIntent {
  const p = prompt.toLowerCase();
  
  if (p.includes('fix') || p.includes('bug') || p.includes('error') || p.includes('repair') || p.includes('clean')) {
    return { type: 'maintenance', confidence: 0.85, reasoning: 'Intent detected: maintenance/fix task' };
  }
  if (p.includes('build') || p.includes('create') || p.includes('project') || p.includes('develop') || p.includes('architect')) {
    return { type: 'plan', confidence: 0.9, reasoning: 'Intent detected: planning/building task' };
  }
  if (p.includes('web') || p.includes('site') || p.includes('scrape') || p.includes('fetch') || p.includes('http')) {
    return { type: 'web', confidence: 0.8, reasoning: 'Intent detected: web automation task' };
  }
  if (p.includes('git') || p.includes('github') || p.includes('commit') || p.includes('push') || p.includes('pull')) {
    return { type: 'github', confidence: 0.9, reasoning: 'Intent detected: GitHub operation' };
  }
  if (p.includes('terminal') || p.includes('run') || p.includes('command') || p.includes('shell') || p.includes('exec')) {
    return { type: 'terminal', confidence: 0.85, reasoning: 'Intent detected: terminal execution' };
  }
  if (p.includes('file') || p.includes('folder') || p.includes('list') || p.includes('read') || p.includes('write')) {
    return { type: 'files', confidence: 0.8, reasoning: 'Intent detected: file operation' };
  }
  if (p.includes('python') || p.includes('code') || p.includes('script') || p.includes('function')) {
    return { type: 'code', confidence: 0.85, reasoning: 'Intent detected: code execution' };
  }
  if (p.includes('analyze') || p.includes('explain') || p.includes('review') || p.includes('what is') || p.includes('how')) {
    return { type: 'analysis', confidence: 0.75, reasoning: 'Intent detected: analysis task' };
  }
  
  return { type: 'chat', confidence: 0.6, reasoning: 'Default intent: general chat' };
}

function decideModel(selectedModel: string, intent: OpenClawIntent): string {
  // If user explicitly selected a model, use it
  if (selectedModel && selectedModel !== 'auto') {
    return selectedModel;
  }
  
  // Auto mode - prioritize best local models (DeepSeek best, then Qwen, then Gemma)
  if (selectedModel === 'auto' || selectedModel === 'best') {
    // For code tasks, prefer Qwen
    if (intent.type === 'code' || intent.type === 'maintenance') {
      return 'qwen2.5-coder:3b';
    }
    if (intent.type === 'terminal') {
      return 'deepseek-coder:latest';
    }
    if (intent.type === 'plan') {
      return 'deepseek-v3.1:671b-cloud';
    }
    // Default: best local model (DeepSeek V3 is best overall!)
    return 'deepseek-v3.1:671b-cloud';
  }
  
  // Default fallback
  return 'gemini-3-flash-preview';
}

function selectTools(intent: OpenClawIntent): string[] {
  const toolMap: Record<string, string[]> = {
    maintenance: ['search', 'analyze', 'fix'],
    plan: ['search', 'create', 'optimize'],
    web: ['fetch', 'search', 'parse'],
    github: ['git', 'commit', 'push'],
    terminal: ['execute', 'shell'],
    files: ['read', 'write', 'list'],
    code: ['execute', 'analyze'],
    analysis: ['search', 'explain'],
    chat: ['generate'],
  };
  return toolMap[intent.type] || ['generate'];
}

export async function analyze(prompt: string, selectedModel: string): Promise<OpenClawResult> {
  const startTime = Date.now();
  const logs: string[] = [];
  
  ensureLogDir();
  
  logs.push(`[${new Date().toISOString()}] OpenClaw: Request received`);
  logs.push(`[${new Date().toISOString()}] OpenClaw: Analyzing prompt (${prompt.length} chars)`);
  
  activityLog('info', 'openclaw_request', 'OpenClaw analyzing request', 'openclaw', { promptLength: prompt.length, model: selectedModel });
  
  const intent = detectIntent(prompt);
  logs.push(`[${new Date().toISOString()}] OpenClaw: Intent detected: ${intent.type} (${intent.confidence})`);
  logs.push(`[${new Date().toISOString()}] OpenClaw: Reasoning: ${intent.reasoning}`);
  
  activityLog('success', 'openclaw_intent', `Intent resolved: ${intent.type}`, 'openclaw', { confidence: intent.confidence });
  
  const model = decideModel(selectedModel, intent);
  const config = getModelConfig(model);
  
  logs.push(`[${new Date().toISOString()}] OpenClaw: Model selected: ${model}`);
  logs.push(`[${new Date().toISOString()}] OpenClaw: Provider: ${config.provider}`);
  if (config.fallback) {
    logs.push(`[${new Date().toISOString()}] OpenClaw: Fallback: ${config.fallback} (${config.fallbackProvider})`);
  }
  
  activityLog('success', 'openclaw_model', `Model resolved: ${model}`, 'openclaw', { provider: config.provider, fallback: config.fallback });
  
  const tools = selectTools(intent);
  logs.push(`[${new Date().toISOString()}] OpenClaw: Tools selected: ${tools.join(', ')}`);
  
  const executionPlan = `1. Route to ${config.provider} using ${model}\n2. Execute ${intent.type} task\n3. ${config.fallback ? `Fallback to ${config.fallbackProvider} if failed` : 'No fallback needed'}`;
  logs.push(`[${new Date().toISOString()}] OpenClaw: Execution plan:\n${executionPlan}`);
  
  activityLog('success', 'openclaw_execution', 'Execution plan ready', 'openclaw', { model, provider: config.provider, tools });
  
  const decision: OpenClawDecision = {
    model,
    provider: config.provider,
    fallback: config.fallback,
    fallbackProvider: config.fallbackProvider,
    intent,
    tools,
    executionPlan,
  };
  
  const decisionLog = {
    timestamp: new Date().toISOString(),
    model,
    provider: config.provider,
    fallback: config.fallback,
    intent: intent.type,
    confidence: intent.confidence,
  };
  
  fs.appendFileSync(DECISION_LOG, JSON.stringify(decisionLog) + '\n', 'utf-8');
  
  return {
    decision,
    latencyMs: Date.now() - startTime,
    logs,
    success: true,
  };
}

export async function healthCheck(): Promise<{ ok: boolean; latencyMs: number; version: string }> {
  const start = Date.now();
  
  try {
    const result = await analyze('test', 'auto');
    
    return {
      ok: result.success,
      latencyMs: Date.now() - start,
      version: '9.0',
    };
  } catch (e) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      version: '9.0',
    };
  }
}

export function getDecisionLogs(limit = 50): LogEntry[] {
  if (!fs.existsSync(DECISION_LOG)) return [];
  
  const content = fs.readFileSync(DECISION_LOG, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim()).slice(-limit);
  
  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean) as LogEntry[];
}