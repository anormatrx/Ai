import { useEffect, useState } from 'react';
import { getSettings, getSystemStatus, checkService, saveSettings } from '@/lib/systemApi';

export function useSystemSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getSettings(), getSystemStatus()]).then(([s, st]) => {
      setSettings(s);
      setStatus(st);
    });
  }, []);

  async function onSave(next: any) {
    setLoading(true);
    try {
      const res = await saveSettings(next);
      setSettings(res.settings);
    } finally {
      setLoading(false);
    }
  }

  async function onCheck(service: 'ollama' | 'openai' | 'gemini' | 'github' | 'gdrive') {
    return checkService(service);
  }

  return { settings, status, loading, onSave, onCheck };
}