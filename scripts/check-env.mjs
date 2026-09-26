// `npm run check` — validates your environment before running or deploying.
import { existsSync, readFileSync } from 'node:fs';

function loadDotenv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
loadDotenv('.env.local');
loadDotenv('.env');

const ok = (m) => console.log(`  \x1b[32m✔\x1b[0m ${m}`);
const warn = (m) => console.log(`  \x1b[33m!\x1b[0m ${m}`);
const bad = (m) => { console.log(`  \x1b[31m✘\x1b[0m ${m}`); process.exitCode = 1; };

console.log('\nLeonida Records — environment check\n');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const site = process.env.NEXT_PUBLIC_SITE_URL;
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) bad('NEXT_PUBLIC_SUPABASE_URL is missing (the site will run in read-only demo mode).');
else if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/.test(url.replace(/\/+$/, '')) && !url.startsWith('http://localhost') && !url.startsWith('http://127.0.0.1')) warn(`NEXT_PUBLIC_SUPABASE_URL looks unusual: ${url}`);
else ok('NEXT_PUBLIC_SUPABASE_URL');

if (!key) bad('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.');
else if (key.startsWith('sb_secret_')) bad('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY contains a SECRET key. Use the publishable key!');
else ok('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

if (!site) warn('NEXT_PUBLIC_SITE_URL is not set (Vercel URL / localhost will be used).');
else if (site.endsWith('/')) warn('NEXT_PUBLIC_SITE_URL should not end with a slash.');
else ok(`NEXT_PUBLIC_SITE_URL = ${site}`);

if (secret) {
  if (secret.startsWith('sb_publishable_')) bad('SUPABASE_SECRET_KEY contains the publishable key.');
  else ok('SUPABASE_SECRET_KEY (server-only, enables user invitations)');
} else warn('SUPABASE_SECRET_KEY not set: inviting users from /admin is disabled (optional).');

for (const k of Object.keys(process.env)) {
  if (k.startsWith('NEXT_PUBLIC_') && /SECRET|SERVICE_ROLE/.test(k)) bad(`${k}: secrets must never use the NEXT_PUBLIC_ prefix.`);
}

if (url && key && !process.exitCode) {
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/site_settings?select=key&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (res.ok) ok('Supabase reachable and schema installed');
    else if (res.status === 404) bad('Supabase reachable but tables are missing: run supabase/schema.sql');
    else warn(`Supabase answered ${res.status}: ${(await res.text()).slice(0, 120)}`);
  } catch (e) {
    warn(`Could not reach Supabase: ${e.message}`);
  }
}
console.log(process.exitCode ? '\nFix the items marked ✘.\n' : '\nAll good.\n');
