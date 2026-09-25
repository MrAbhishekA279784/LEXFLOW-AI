import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  // Validate URL protocol
  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
  } catch {
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    logger.info('Supabase client initialized successfully', { url: supabaseUrl });
    return supabaseInstance;
  } catch (err) {
    logger.warn('Failed to initialize Supabase client; falling back to in-memory store', { error: String(err) });
    return null;
  }
}

export function isSupabaseAvailable(): boolean {
  return getSupabaseClient() !== null;
}
