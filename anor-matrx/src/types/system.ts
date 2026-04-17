export type HealthReport = {
  ollama: {
    ok: boolean;
    baseUrl: string;
    models: string[];
    error: string | null;
  };
  openclaw: {
    ok: boolean;
    provider: string;
    model: string;
    status: string;
    error: string | null;
  };
  app: {
    workspace: string;
    backendPort: number;
    frontendPort: number;
    pythonRoomPort: number;
  };
};

export type BoundModelsState = {
  baseUrl: string;
  defaultModel: string;
  codeModel: string;
  pythonModel: string;
  availableModels: string[];
};

export type SkillEntry = {
  name: string;
  source: 'workspace' | 'project-agent' | 'personal-agent' | 'shared';
  skillFile: string;
};

export type SettingsState = {
  ollama: {
    host: string;
    port: number;
  };
  gemini: {
    apiKey: string;
  };
  openai: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };
  github: {
    token: string;
  };
  gdrive: {
    clientId: string;
  };
  performance: {
    gpuName: string;
    cudaEnabled: boolean;
    dynamicLoadBalancing: boolean;
    performanceMode: boolean;
  };
  cache: {
    autoClean: boolean;
    dynamicMemory: boolean;
    randomRecovery: boolean;
  };
};