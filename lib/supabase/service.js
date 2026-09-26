import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/env';

/**
 * Privileged client using the SECRET key. Server-only; used exclusively for
 * user management (invite / delete auth users) after an admin check.
 * Returns null when SUPABASE_SECRET_KEY is not configured.
 */
export function serviceClient() {
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl() || !secret) return null;
  return createClient(supabaseUrl(), secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
