import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env if present
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Supabase (optional at runtime; memory fallback is activated if missing)
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // AI Provider configuration
  AI_PROVIDER: z.enum(['gemini', 'fallback']).default('gemini'),
  GEMINI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('gemini-2.5-flash'),
  
  // CORS
  CORS_ORIGIN: z.string().default('*'),
  
  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

function loadEnv(): EnvConfig {
  const isTest = !!process.env.VITEST || process.env.NODE_ENV === 'test';
  const rawEnv = {
    ...process.env,
    NODE_ENV: isTest ? 'test' : (process.env.NODE_ENV || 'development'),
    AI_MODEL: process.env.AI_MODEL || 'gemini-3.8-flash',
  };

  const result = EnvSchema.safeParse(rawEnv);
  if (!result.success) {
    console.warn('⚠️ Environment variable warnings:', result.error.flatten().fieldErrors);
    return {
      NODE_ENV: isTest ? 'test' : 'development',
      PORT: parseInt(process.env.PORT || '3000', 10),
      AI_PROVIDER: isTest ? 'fallback' : 'gemini',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      AI_MODEL: 'gemini-3.8-flash',
      CORS_ORIGIN: '*',
      RATE_LIMIT_MAX: 100,
      RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
    };
  }
  return result.data;
}

export const env = loadEnv();
