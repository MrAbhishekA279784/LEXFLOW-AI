/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function isValidHttpUrl(string: string | undefined): boolean {
  if (!string || string.trim() === '' || string === 'undefined' || string === 'null') return false;
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = isValidHttpUrl(rawUrl) && !!rawKey && rawKey !== 'undefined' && rawKey !== 'mock-key';

let client: SupabaseClient | null = null;

if (isSupabaseConfigured && rawUrl && rawKey) {
  try {
    client = createClient(rawUrl, rawKey);
  } catch (err) {
    console.warn('Supabase initialization deferred:', err);
    client = null;
  }
}

export const supabase = client;
