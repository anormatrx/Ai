import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Basic configuration with validation
const envSchema = z.object({
  PORT: z.number().int().positive(),
  NODE_ENV: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
  API_BASE_URL: z.string().optional(),
});

const parsed = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  API_BASE_URL: process.env.API_BASE_URL,
};

const config = envSchema.parse(parsed);

export default config;
