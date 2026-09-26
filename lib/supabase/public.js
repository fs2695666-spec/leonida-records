import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabasePublicKey, supabaseUrl } from '@/lib/env';

let client = null;

/**
 * Anonymous, session-less client for PUBLIC pages. It never reads cookies, so
 * pages stay statically cacheable (ISR) and can only ever see published rows (RLS).
 */
export function publicClient() {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(supabaseUrl(), supabasePublicKey(), {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
