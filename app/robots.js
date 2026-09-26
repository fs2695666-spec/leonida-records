import { siteUrl } from '@/lib/env';

export default function robots() {
  const isProd = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production';
  return {
    // Preview deployments on Vercel are never indexed.
    rules: isProd
      ? [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/search', '/*/search'] }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
