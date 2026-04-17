/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_WORKSPACE: string;
  readonly VITE_APP_DATA_DIR: string;
  readonly VITE_BACKEND_PORT: string;
  readonly VITE_FRONTEND_PORT: string;
  readonly VITE_PYTHON_ROOM_PORT: string;
  readonly VITE_TERMINAL_BRIDGE_PORT: string;
  readonly VITE_OLLAMA_HOST: string;
  readonly VITE_OLLAMA_BASE_URL: string;
  readonly VITE_OLLAMA_TIMEOUT_MS: string;
  readonly VITE_OLLAMA_MODEL: string;
  readonly VITE_OLLAMA_CODE_MODEL: string;
  readonly VITE_OLLAMA_PYTHON_MODEL: string;
  readonly VITE_OPENCLAW_PROVIDER: string;
  readonly VITE_OPENCLAW_BASE_URL: string;
  readonly VITE_OPENCLAW_DEFAULT_MODEL: string;
  readonly VITE_OPENCLAW_CODE_MODEL: string;
  readonly VITE_OPENCLAW_PYTHON_MODEL: string;
  readonly VITE_SKILLS_SHARED_DIR: string;
  readonly VITE_SKILLS_PERSONAL_AGENT_DIR: string;
  readonly VITE_SKILLS_PROJECT_AGENT_DIR: string;
  readonly VITE_SKILLS_WORKSPACE_DIR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {}