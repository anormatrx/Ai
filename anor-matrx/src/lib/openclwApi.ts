const API_BASE = 'http://127.0.0.1:3002/api';

export async function openclwChat(prompt: string, selectedModel = 'auto') {
  const res = await fetch(`${API_BASE}/openclw/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, selectedModel }),
  });
  if (!res.ok) throw new Error('OpenClaw routing failed');
  return res.json();
}

export async function openclwHealth() {
  const res = await fetch(`${API_BASE}/openclw/health`);
  if (!res.ok) throw new Error('OpenClaw health check failed');
  return res.json();
}

export async function openclwAnalyze(prompt: string, model = 'auto') {
  const res = await fetch(`${API_BASE}/openclw/analyze?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(model)}`);
  if (!res.ok) throw new Error('OpenClaw analyze failed');
  return res.json();
}