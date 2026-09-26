import localFont from 'next/font/local';

// Self-hosted variable fonts (no request to Google at build or run time).
export const bodoni = localFont({
  src: [
    { path: '../node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-standard-normal.woff2', style: 'normal', weight: '400 900' },
    { path: '../node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-standard-italic.woff2', style: 'italic', weight: '400 900' },
  ],
  variable: '--font-bodoni',
  display: 'swap',
  fallback: ['Didot', 'Georgia', 'serif'] // note: names starting with a digit ("Bodoni 72") would break the unquoted list,
});

export const schibsted = localFont({
  src: [
    { path: '../node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2', style: 'normal', weight: '400 900' },
    { path: '../node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-italic.woff2', style: 'italic', weight: '400 900' },
  ],
  variable: '--font-schibsted',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});

export const fontVars = `${bodoni.variable} ${schibsted.variable}`;
