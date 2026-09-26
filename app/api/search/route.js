import { NextResponse } from 'next/server';
import { isLocale, DEFAULT_LOCALE } from '@/lib/i18n';
import { searchArchive } from '@/lib/data/public';

// Public search endpoint used by the command palette. Only published rows are
// visible (RLS + the SQL function filter). Responses are CDN-cached briefly.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().slice(0, 80);
  const lang = isLocale(searchParams.get('lang')) ? searchParams.get('lang') : DEFAULT_LOCALE;
  if (q.length < 2) return NextResponse.json({ results: [] });
  try {
    const results = await searchArchive(q, lang, 30);
    return NextResponse.json({ results }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ results: [], error: 'search_failed' }, { status: 500 });
  }
}
