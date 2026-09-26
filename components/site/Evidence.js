import { getDictionary } from '@/lib/i18n';

/**
 * Evidence level badge with an accessible explanation.
 * - default: focusable tooltip (+ title + screen-reader text)
 * - withText: label only (the explanation is rendered next to it by the caller)
 * - inert: inside links/buttons (no focus stop), explanation via title only
 */
export function Evidence({ level, lang, withText = false, inert = false }) {
  const dict = getDictionary(lang);
  const meta = dict.evidence[level] || dict.evidence.OBSERVED;
  const interactive = !withText && !inert;
  return (
    <span className="evidence" data-level={level} data-tip={interactive ? meta.text : undefined} tabIndex={interactive ? 0 : undefined} title={meta.text}>
      {meta.label}
      {!withText && <span className="sr-only">: {meta.text}</span>}
    </span>
  );
}
