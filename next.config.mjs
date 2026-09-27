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
      // Old news URLs: they used to be Spanish at the root and English under /en
      { source: '/noticias', destination: '/es/news', permanent: true },
      { source: '/noticias/archivo', destination: '/es/news/archive', permanent: true },
      { source: '/noticias/:slug', destination: '/es/news/:slug', permanent: true },
      { source: '/en/noticias', destination: '/news', permanent: true },
      { source: '/en/noticias/archivo', destination: '/news/archive', permanent: true },
      { source: '/en/noticias/:slug', destination: '/news/:slug', permanent: true },
      // Portuguese and French are no longer offered
      { source: '/:lang(pt|fr)', destination: '/', permanent: true },
      { source: '/:lang(pt|fr)/noticias/:slug', destination: '/news/:slug', permanent: true },
      { source: '/:lang(pt|fr)/:path*', destination: '/:path*', permanent: true },
      // v8 URLs
      { source: '/personajes', destination: '/characters', permanent: true },
      { source: '/trailer-room', destination: '/media', permanent: true },
    ];
  },
};

export default nextConfig;
