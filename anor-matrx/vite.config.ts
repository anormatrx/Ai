import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_APP_ENV': JSON.stringify(env.APP_ENV),
      'import.meta.env.VITE_APP_NAME': JSON.stringify(env.APP_NAME),
      'import.meta.env.VITE_APP_WORKSPACE': JSON.stringify(env.APP_WORKSPACE),
      'import.meta.env.VITE_APP_DATA_DIR': JSON.stringify(env.APP_DATA_DIR),
      'import.meta.env.VITE_BACKEND_PORT': JSON.stringify(env.BACKEND_PORT),
      'import.meta.env.VITE_FRONTEND_PORT': JSON.stringify(env.FRONTEND_PORT),
      'import.meta.env.VITE_PYTHON_ROOM_PORT': JSON.stringify(env.PYTHON_ROOM_PORT),
      'import.meta.env.VITE_TERMINAL_BRIDGE_PORT': JSON.stringify(env.TERMINAL_BRIDGE_PORT),
      'import.meta.env.VITE_OLLAMA_HOST': JSON.stringify(env.OLLAMA_HOST),
      'import.meta.env.VITE_OLLAMA_BASE_URL': JSON.stringify(env.OLLAMA_BASE_URL),
      'import.meta.env.VITE_OLLAMA_TIMEOUT_MS': JSON.stringify(env.OLLAMA_TIMEOUT_MS),
      'import.meta.env.VITE_OLLAMA_MODEL': JSON.stringify(env.OLLAMA_MODEL),
      'import.meta.env.VITE_OLLAMA_CODE_MODEL': JSON.stringify(env.OLLAMA_CODE_MODEL),
      'import.meta.env.VITE_OLLAMA_PYTHON_MODEL': JSON.stringify(env.OLLAMA_PYTHON_MODEL),
      'import.meta.env.VITE_OLLAMA_REASONING_MODEL': JSON.stringify(env.OLLAMA_REASONING_MODEL),
      'import.meta.env.VITE_OLLAMA_CHAT_MODEL': JSON.stringify(env.OLLAMA_CHAT_MODEL),
      'import.meta.env.VITE_OPENCLAW_PROVIDER': JSON.stringify(env.OPENCLAW_PROVIDER),
      'import.meta.env.VITE_OPENCLAW_BASE_URL': JSON.stringify(env.OPENCLAW_BASE_URL),
      'import.meta.env.VITE_OPENCLAW_DEFAULT_MODEL': JSON.stringify(env.OPENCLAW_DEFAULT_MODEL),
      'import.meta.env.VITE_OPENCLAW_CODE_MODEL': JSON.stringify(env.OPENCLAW_CODE_MODEL),
      'import.meta.env.VITE_OPENCLAW_PYTHON_MODEL': JSON.stringify(env.OPENCLAW_PYTHON_MODEL),
      'import.meta.env.VITE_SKILLS_SHARED_DIR': JSON.stringify(env.SKILLS_SHARED_DIR),
      'import.meta.env.VITE_SKILLS_PERSONAL_AGENT_DIR': JSON.stringify(env.SKILLS_PERSONAL_AGENT_DIR),
      'import.meta.env.VITE_SKILLS_PROJECT_AGENT_DIR': JSON.stringify(env.SKILLS_PROJECT_AGENT_DIR),
      'import.meta.env.VITE_SKILLS_WORKSPACE_DIR': JSON.stringify(env.SKILLS_WORKSPACE_DIR),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${env.BACKEND_PORT || 3002}`,
          changeOrigin: true,
          secure: false,
        },
        '/swarm': {
          target: `http://127.0.0.1:${env.BACKEND_PORT || 3002}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
