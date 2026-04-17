interface ClientRuntime {
  app: {
    name: string;
    env: string;
    workspace: string;
    dataDir: string;
  };
  ports: {
    backend: number;
    frontend: number;
    pythonRoom: number;
    terminalBridge: number;
  };
  ollama: {
    host: string;
    baseUrl: string;
    defaultModel: string;
    codeModel: string;
    pythonModel: string;
    reasoningModel?: string;
    chatModel?: string;
  };
  openclaw: {
    provider: string;
    baseUrl: string;
    defaultModel: string;
    codeModel: string;
    pythonModel: string;
  };
  skills: {
    sharedDir: string;
    personalAgentDir: string;
    projectAgentDir: string;
    workspaceDir: string;
  };
}

const parsePort = (value: string | undefined): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const clientRuntime: ClientRuntime = {
  app: {
    name: import.meta.env.VITE_APP_NAME ?? 'ANOR-MATRX',
    env: import.meta.env.VITE_APP_ENV ?? 'development',
    workspace: import.meta.env.VITE_APP_WORKSPACE ?? '',
    dataDir: import.meta.env.VITE_APP_DATA_DIR ?? '',
  },
  ports: {
    backend: parsePort(import.meta.env.VITE_BACKEND_PORT) || 3002,
    frontend: parsePort(import.meta.env.VITE_FRONTEND_PORT) || 3000,
    pythonRoom: parsePort(import.meta.env.VITE_PYTHON_ROOM_PORT) || 3210,
    terminalBridge: parsePort(import.meta.env.VITE_TERMINAL_BRIDGE_PORT) || 3211,
  },
  ollama: {
    host: import.meta.env.VITE_OLLAMA_HOST ?? '127.0.0.1:11435',
    baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL ?? 'http://127.0.0.1:11435',
    defaultModel: import.meta.env.VITE_OLLAMA_MODEL ?? 'gemma3:latest',
    codeModel: import.meta.env.VITE_OLLAMA_CODE_MODEL ?? 'qwen2.5-coder:3b',
    pythonModel: import.meta.env.VITE_OLLAMA_PYTHON_MODEL ?? 'deepseek-coder:latest',
    reasoningModel: import.meta.env.VITE_OLLAMA_REASONING_MODEL ?? 'deepseek-r1:latest',
    chatModel: import.meta.env.VITE_OLLAMA_CHAT_MODEL ?? 'gemma3:4b',
  },
  openclaw: {
    provider: import.meta.env.VITE_OPENCLAW_PROVIDER ?? 'ollama',
    baseUrl: import.meta.env.VITE_OPENCLAW_BASE_URL ?? import.meta.env.VITE_OLLAMA_BASE_URL ?? 'http://127.0.0.1:11435',
    defaultModel: `ollama/${import.meta.env.VITE_OPENCLAW_DEFAULT_MODEL ?? 'gemma3:latest'}`,
    codeModel: `ollama/${import.meta.env.VITE_OPENCLAW_CODE_MODEL ?? 'qwen2.5-coder:3b'}`,
    pythonModel: `ollama/${import.meta.env.VITE_OPENCLAW_PYTHON_MODEL ?? 'deepseek-coder:latest'}`,
  },
  skills: {
    sharedDir: import.meta.env.VITE_SKILLS_SHARED_DIR ?? '',
    personalAgentDir: import.meta.env.VITE_SKILLS_PERSONAL_AGENT_DIR ?? '',
    projectAgentDir: import.meta.env.VITE_SKILLS_PROJECT_AGENT_DIR ?? '',
    workspaceDir: import.meta.env.VITE_SKILLS_WORKSPACE_DIR ?? '',
  },
};

export function parseHostPort(baseUrl: string): { host: string; port: number } {
  try {
    const url = new URL(baseUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 11434,
    };
  } catch {
    return { host: '127.0.0.1', port: 11434 };
  }
}

export function getClientModel(kind: 'default' | 'code' | 'python'): string {
  if (kind === 'code') return clientRuntime.ollama.codeModel;
  if (kind === 'python') return clientRuntime.ollama.pythonModel;
  return clientRuntime.ollama.defaultModel;
}

console.log(`[ClientRuntime] Loaded: ${clientRuntime.app.name} (${clientRuntime.app.env})`);