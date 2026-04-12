import axios from 'axios';
import { activityLog } from '../services/activityLog.service';

const DEFAULT_TIMEOUT = 30000;

export interface CloudProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export async function checkOpenAIHealth(apiKey: string, baseUrl = 'https://api.openai.com/v1'): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const started = Date.now();
  
  if (!apiKey) {
    return { ok: false, message: 'OPENAI_API_KEY missing', latencyMs: 0 };
  }

  try {
    await axios.get(`${baseUrl}/models`, {
      timeout: 8000,
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    return {
      ok: true,
      message: 'OpenAI reachable',
      latencyMs: Date.now() - started,
    };
  } catch (error: any) {
    return {
      ok: false,
      message: error?.response?.data?.error?.message || error?.message || 'OpenAI unreachable',
      latencyMs: Date.now() - started,
    };
  }
}

export async function chatWithOpenAI(
  message: string,
  config: CloudProviderConfig,
  systemPrompt?: string
): Promise<{ response: string; model: string }> {
  if (!config.apiKey) {
    throw new Error('OPENAI_API_KEY missing');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: message });

  try {
    const { data } = await axios.post(
      `${config.baseUrl || 'https://api.openai.com/v1'}/chat/completions`,
      {
        model: config.model || 'gpt-4',
        messages,
      },
      {
        timeout: DEFAULT_TIMEOUT,
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    activityLog('success', 'openai_response', 'Response from OpenAI', 'openai', {
      model: config.model,
      responseLength: data?.choices?.[0]?.message?.content?.length || 0,
    });

    return {
      response: data?.choices?.[0]?.message?.content || '',
      model: data?.model || config.model || 'gpt-4',
    };
  } catch (error: any) {
    const errMsg = error?.response?.data?.error?.message || error?.message || 'OpenAI chat failed';
    activityLog('error', 'openai_error', errMsg, 'openai');
    throw new Error(errMsg);
  }
}

export async function checkGeminiHealth(apiKey: string): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const started = Date.now();
  
  if (!apiKey) {
    return { ok: false, message: 'GEMINI_API_KEY missing', latencyMs: 0 };
  }

  try {
    await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { timeout: 8000 }
    );

    return {
      ok: true,
      message: 'Gemini reachable',
      latencyMs: Date.now() - started,
    };
  } catch (error: any) {
    return {
      ok: false,
      message: error?.response?.data?.error?.message || error?.message || 'Gemini unreachable',
      latencyMs: Date.now() - started,
    };
  }
}

export async function chatWithGemini(
  message: string,
  apiKey: string,
  model = 'gemini-2.0-flash',
  systemInstruction?: string
): Promise<{ response: string; model: string }> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY missing');
  }

  const contents = [{ role: 'user', parts: [{ text: message }] }];

  try {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents,
        systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
      },
      {
        timeout: DEFAULT_TIMEOUT,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const response = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    activityLog('success', 'gemini_response', 'Response from Gemini', 'gemini', {
      model,
      responseLength: response.length,
    });

    return { response, model };
  } catch (error: any) {
    const errMsg = error?.response?.data?.error?.message || error?.message || 'Gemini chat failed';
    activityLog('error', 'gemini_error', errMsg, 'gemini');
    throw new Error(errMsg);
  }
}

export async function checkGitHubHealth(token: string): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const started = Date.now();
  
  if (!token) {
    return { ok: false, message: 'GITHUB_TOKEN missing', latencyMs: 0 };
  }

  try {
    await axios.get('https://api.github.com/user', {
      timeout: 8000,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    return {
      ok: true,
      message: 'GitHub reachable',
      latencyMs: Date.now() - started,
    };
  } catch (error: any) {
    return {
      ok: false,
      message: error?.response?.data?.message || error?.message || 'GitHub unreachable',
      latencyMs: Date.now() - started,
    };
  }
}

export async function checkGDriveHealth(clientId: string): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const started = Date.now();
  
  if (!clientId) {
    return { ok: false, message: 'GOOGLE_DRIVE_CLIENT_ID missing', latencyMs: 0 };
  }

  return {
    ok: true,
    message: 'Client ID present; OAuth required for full check',
    latencyMs: Date.now() - started,
  };
}