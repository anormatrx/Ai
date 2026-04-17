import { clientRuntime } from '@/config/client-runtime';

const API_BASE = `http://${clientRuntime.ollama.host.split(':')[0]}:${clientRuntime.ports.backend}/api`;

export async function getSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function saveSettings(payload: unknown) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
}

export async function checkService(service: 'ollama' | 'openai' | 'gemini' | 'github' | 'gdrive') {
  const res = await fetch(`${API_BASE}/health/${service}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to check ${service}`);
  return res.json();
}

export async function getSystemStatus() {
  const res = await fetch(`${API_BASE}/system/status`);
  if (!res.ok) throw new Error('Failed to load system status');
  return res.json();
}

export async function getActivityLogs(limit = 50) {
  const res = await fetch(`${API_BASE}/logs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load logs');
  return res.json();
}

export async function chatComplete(message: string, selectedModel: string) {
  const res = await fetch(`${API_BASE}/chat/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, selectedModel }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Chat failed');
  }
  return res.json();
}

export async function getOllamaModels() {
  const res = await fetch(`${API_BASE}/ollama/models`);
  if (!res.ok) throw new Error('Failed to load Ollama models');
  return res.json();
}

export async function checkOllamaModel(model: string) {
  const res = await fetch(`${API_BASE}/ollama/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model }),
  });
  if (!res.ok) throw new Error('Failed to check Ollama model');
  return res.json();
}

export async function getProvidersHealth() {
  const res = await fetch(`${API_BASE}/providers/health`);
  if (!res.ok) throw new Error('Failed to load providers health');
  return res.json();
}

/**
 * Swarm v4 - Smart AI Orchestrator
 * Uses the full autonomous loop with task decomposition, AI routing, and self-correction
 */
export async function swarmExecute(task: string, context?: unknown) {
  const res = await fetch('/swarm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, context }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Swarm execution failed');
  }
  return res.json();
}

/**
 * Get Swarm status and available agents
 */
export async function getSwarmStatus() {
  const res = await fetch('/swarm/status');
  if (!res.ok) throw new Error('Failed to get Swarm status');
  return res.json();
}