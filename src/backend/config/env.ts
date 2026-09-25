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
  // Clean placeholder values commonly found in template environments
  const cleanEnvValue = (val?: string): string | undefined => {
    if (!val) return undefined;
    const trimmed = val.trim();
    if (
      !trimmed || 
      trimmed === 'undefined' || 
      trimmed === 'null' || 
      trimmed.startsWith('YOUR_SUPABASE') || 
      trimmed.startsWith('your_') ||
      trimmed === 'mock-key'
    ) {
      return undefined;
    }
    return trimmed;
  };

  const rawEnv = {
    ...process.env,
    SUPABASE_URL: cleanEnvValue(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    SUPABASE_ANON_KEY: cleanEnvValue(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY),
    NODE_ENV: isTest ? 'test' : (process.env.NODE_ENV || 'development'),
    AI_MODEL: process.env.AI_MODEL || 'gemini-2.5-flash',
  };

  const result = EnvSchema.safeParse(rawEnv);
  if (!result.success) {
    console.warn('⚠️ Environment variable warnings:', result.error.flatten().fieldErrors);
    return {
      NODE_ENV: isTest ? 'test' : 'development',
      PORT: parseInt(process.env.PORT || '3000', 10),
      SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
      AI_PROVIDER: isTest ? 'fallback' : 'gemini',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      AI_MODEL: 'gemini-2.5-flash',
      CORS_ORIGIN: '*',
      RATE_LIMIT_MAX: 100,
      RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
    };
  }
  return result.data;
}

export const env = loadEnv();
