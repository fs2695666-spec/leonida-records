import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from '@/lib/i18n';

const COOKIE_OPTS = { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' };

/**
 * 1. /admin/*  → refreshes the Supabase session cookie and requires a signed-in user.
 * 2. Public    → locale routing. Spanish lives at "/", other languages at /en, /pt, /fr.
 *                Unprefixed URLs are rewritten to the internal /es/* route.
 *                The last language explicitly visited is remembered in a cookie.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return adminGate(request);

  const first = pathname.split('/')[1];

  // /es/... is not canonical: redirect to the root version and remember Spanish.
  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    const res = NextResponse.redirect(url, 308);
    res.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, COOKIE_OPTS);
    return res;
  }

  if (isLocale(first)) {
    const res = NextResponse.next();
    // Only a real page load changes the remembered language. Background prefetches of
    // /fr/... (still in flight after the visitor picked another language) must not.
    if (isDocumentRequest(request) && request.cookies.get(LOCALE_COOKIE)?.value !== first) {
      res.cookies.set(LOCALE_COOKIE, first, COOKIE_OPTS);
    }
    return res;
  }

  // Unprefixed path: honour a remembered non-default language, otherwise serve Spanish.
  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
  if (remembered && remembered !== DEFAULT_LOCALE && isLocale(remembered) && isDocumentRequest(request)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${remembered}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url, 307);
  }
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

function isDocumentRequest(request) {
  // True only for real page loads, never for Next.js RSC/prefetch fetches.
  const dest = request.headers.get('sec-fetch-dest');
  if (dest) return dest === 'document';
  return !request.headers.get('rsc')
    && !request.headers.get('next-router-prefetch')
    && !request.nextUrl.searchParams.has('_rsc');
}

async function adminGate(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  const isPublicAdminRoute = pathname === '/admin/login' || pathname.startsWith('/admin/auth/');
  if (!url || !key) {
    if (isPublicAdminRoute) return NextResponse.next();
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Validates the JWT with Supabase Auth and refreshes the session if needed.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isPublicAdminRoute) {
    const login = new URL('/admin/login', request.url);
    if (pathname !== '/admin') login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }
  if (user && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals, API routes and static files.
    '/((?!_next/|api/|favicon\\.ico|icon\\.svg|apple-icon|opengraph-image|og\\.png|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|txt|xml|woff2?)$).*)',
  ],
};
