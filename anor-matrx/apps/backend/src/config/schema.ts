import { z } from 'zod';

export const SettingsSchema = z.object({
  ollama: z.object({
    host: z.string().min(1).default('127.0.0.1'),
    port: z.coerce.number().int().positive().default(11434),
  }),
  gemini: z.object({
    apiKey: z.string().optional().default(''),
  }),
  openai: z.object({
    apiKey: z.string().optional().default(''),
    baseUrl: z.string().optional().default('https://api.openai.com/v1'),
    model: z.string().optional().default('gpt-4o-mini'),
  }),
  github: z.object({
    token: z.string().optional().default(''),
  }),
  gdrive: z.object({
    clientId: z.string().optional().default(''),
  }),
  performance: z.object({
    gpuName: z.string().default('auto'),
    cudaEnabled: z.boolean().default(true),
    dynamicLoadBalancing: z.boolean().default(true),
    performanceMode: z.boolean().default(true),
  }),
  cache: z.object({
    autoClean: z.boolean().default(true),
    dynamicMemory: z.boolean().default(true),
    randomRecovery: z.boolean().default(false),
  }),
});

export type Settings = z.infer<typeof SettingsSchema>;
