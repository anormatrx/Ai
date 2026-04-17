import { clientRuntime } from '@/config/client-runtime';

const API_BASE = `http://${clientRuntime.ollama.host.split(':')[0]}:${clientRuntime.ports.backend}/api`;

export async function askPythonAgent(prompt: string) {
  const res = await fetch(`${API_BASE}/python-agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();

  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Python agent request failed");
  }

  return data;
}

export async function dispatchPythonDecision(decision: any) {
  const res = await fetch(`${API_BASE}/python-tools/dispatch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ decision })
  });

  const data = await res.json();

  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Tool dispatch failed");
  }

  return data;
}