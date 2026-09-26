// Central place for environment configuration. Only NEXT_PUBLIC_* values are
// exposed to the browser; secrets are read exclusively in server-only modules.

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

export function supabasePublicKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && supabasePublicKey());
}

/**
 * Canonical site URL. Priority:
 *   1. NEXT_PUBLIC_SITE_URL (set this when you connect your own domain)
 *   2. Vercel production URL (automatic on Vercel)
 *   3. Vercel deployment URL (previews)
 *   4. localhost
 */
export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 3000}`;
}
