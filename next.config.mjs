/** @type {import('next').NextConfig} */

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  } catch {
    return null;
  }
})();

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'" },
];

const nextConfig = {
  poweredByHeader: false,
  experimental: {
    globalNotFound: true,
    serverActions: { bodySizeLimit: '2mb' },
  },
  images: {
    // Image optimization is OFF by default to stay inside free-tier limits.
    // Set IMAGE_OPTIMIZATION=true in Vercel if your plan allows it.
    unoptimized: process.env.IMAGE_OPTIMIZATION !== 'true',
    remotePatterns: [
      { protocol: 'https', hostname: 'www.rockstargames.com' },
      ...(supabaseHost ? [{ protocol: 'https', hostname: supabaseHost }] : []),
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: '/personajes', destination: '/characters', permanent: true },
      { source: '/:lang(en|pt|fr)/personajes', destination: '/:lang/characters', permanent: true },
      { source: '/trailer-room', destination: '/media', permanent: true },
      { source: '/:lang(en|pt|fr)/trailer-room', destination: '/:lang/media', permanent: true },
      { source: '/news', destination: '/noticias', permanent: true },
      { source: '/news/:slug', destination: '/noticias/:slug', permanent: true },
      { source: '/:lang(en|pt|fr)/news', destination: '/:lang/noticias', permanent: true },
      { source: '/:lang(en|pt|fr)/news/:slug', destination: '/:lang/noticias/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
