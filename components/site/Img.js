import Image from 'next/image';

const OPTIMIZE = process.env.IMAGE_OPTIMIZATION === 'true';
const SUPABASE_HOST = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname; } catch { return null; }
})();

function optimizable(src) {
  if (!OPTIMIZE || !src) return false;
  try {
    const host = new URL(src).hostname;
    return host === 'www.rockstargames.com' || host === SUPABASE_HOST;
  } catch {
    return src.startsWith('/');
  }
}

/** next/image wrapper: lazy by default, safe with arbitrary editor-provided URLs. */
export function Img({ src, alt = '', sizes = '100vw', priority = false, className, style, fill = true, width, height }) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
      unoptimized={!optimizable(src)}
      {...(fill ? { fill: true } : { width: width || 1600, height: height || 900 })}
    />
  );
}
