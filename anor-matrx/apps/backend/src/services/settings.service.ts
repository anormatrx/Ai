import fs from 'node:fs';
import path from 'node:path';
import { Settings, SettingsSchema } from '../config/schema';
import { activityLog } from './activityLog.service';

const filePath = path.join(process.cwd(), 'data.settings.json');

const defaultSettings: Settings = SettingsSchema.parse({
  ollama: { host: '127.0.0.1', port: 11434 },
  gemini: { apiKey: '' },
  openai: { apiKey: '', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  github: { token: '' },
  gdrive: { clientId: '' },
  performance: {
    gpuName: 'auto',
    cudaEnabled: true,
    dynamicLoadBalancing: true,
    performanceMode: true,
  },
  cache: {
    autoClean: true,
    dynamicMemory: true,
    randomRecovery: false,
  },
});

export function loadSettings(): Settings {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultSettings, null, 2), 'utf-8');
    return defaultSettings;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return SettingsSchema.parse(raw);
}

export function saveSettings(payload: unknown): Settings {
  const parsed = SettingsSchema.parse(payload);
  fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
  activityLog('success', 'settings_update', 'Settings saved successfully', 'settings', { sections: Object.keys(parsed) });
  return parsed;
}

function mask(value?: string) {
  if (!value) return '';
  if (value.length <= 4) return '••••';
  return '••••••••' + value.slice(-4);
}

export function publicSettings() {
  const s = loadSettings();
  return {
    ...s,
    gemini: { ...s.gemini, apiKey: mask(s.gemini.apiKey) },
    openai: { ...s.openai, apiKey: mask(s.openai.apiKey) },
    github: { ...s.github, token: mask(s.github.token) },
    gdrive: { ...s.gdrive, clientId: mask(s.gdrive.clientId) },
  };
}
