import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase/server';

const TYPES = ['invite', 'recovery', 'magiclink', 'signup', 'email', 'email_change'];

/**
 * Landing for Supabase e-mail links (invitations and password resets).
 * Supports both `?token_hash=…&type=…` (recommended e-mail template) and PKCE `?code=…`.
 */
export async function GET(request) {
  const url = new URL(request.url);
  const next = url.searchParams.get('next');
  const target = next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin/set-password';
  const supabase = await serverClient();
  if (!supabase) return NextResponse.redirect(new URL('/admin/login', url));

  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const code = url.searchParams.get('code');

  let error = null;
  if (tokenHash && TYPES.includes(type)) ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  else if (code) ({ error } = await supabase.auth.exchangeCodeForSession(code));
  else error = new Error('missing token');

  if (error) return NextResponse.redirect(new URL('/admin/login?notice=expired', url));
  return NextResponse.redirect(new URL(target, url));
}
