'use client';
import { useState } from 'react';

export function ShareBar({ url, title, labels }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    } else copy();
  };
  return (
    <div className="sharebar" aria-label={labels.share}>
      <span className="sharebar__label">{labels.share}</span>
      <a href={`https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`} target="_blank" rel="noopener noreferrer">X</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
      <a href={`https://wa.me/?text=${enc(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <button type="button" onClick={copy}>{copied ? labels.copied : labels.copyLink}</button>
      <button type="button" className="sharebar__native" onClick={share} aria-label={labels.share}>↗</button>
      <span className="sr-only" aria-live="polite">{copied ? labels.copied : ''}</span>
    </div>
  );
}
