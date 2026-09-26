// Server-side whitelist for Tiptap/ProseMirror JSON. Everything not listed is dropped.
// Stored documents therefore never contain raw HTML, scripts or unsafe URLs.

const NODES = new Set(['doc', 'paragraph', 'text', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote',
  'horizontalRule', 'hardBreak', 'codeBlock', 'image', 'youtube', 'gallery']);
const MARKS = new Set(['bold', 'italic', 'strike', 'underline', 'code', 'link']);
const MAX_DEPTH = 12;

const httpUrl = (u) => typeof u === 'string' && /^https?:\/\/[^\s"'<>]+$/i.test(u.trim()) ? u.trim().slice(0, 2000) : null;
function linkUrl(u) {
  if (typeof u !== 'string') return null;
  const s = u.trim();
  if (/^(https?:|mailto:)/i.test(s) && !/[\s"'<>]/.test(s)) return s.slice(0, 2000);
  if ((s.startsWith('/') && !s.startsWith('//')) || s.startsWith('#')) return s.slice(0, 2000);
  return null;
}
const str = (v, n = 500) => (typeof v === 'string' ? v.slice(0, n) : '');

function cleanMarks(marks) {
  if (!Array.isArray(marks)) return undefined;
  const out = [];
  for (const m of marks) {
    if (!m || !MARKS.has(m.type)) continue;
    if (m.type === 'link') {
      const href = linkUrl(m.attrs?.href);
      if (!href) continue;
      const external = /^https?:/i.test(href);
      out.push({ type: 'link', attrs: { href, target: external ? '_blank' : null, rel: external ? 'noopener noreferrer nofollow' : null } });
    } else out.push({ type: m.type });
  }
  return out.length ? out : undefined;
}

function cleanNode(node, depth) {
  if (!node || typeof node !== 'object' || !NODES.has(node.type) || depth > MAX_DEPTH) return null;
  const out = { type: node.type };
  switch (node.type) {
    case 'text': {
      const text = str(node.text, 20000);
      if (!text) return null;
      out.text = text;
      const marks = cleanMarks(node.marks);
      if (marks) out.marks = marks;
      return out;
    }
    case 'heading': out.attrs = { level: [2, 3, 4].includes(node.attrs?.level) ? node.attrs.level : 2 }; break;
    case 'orderedList': out.attrs = { start: Number.isInteger(node.attrs?.start) ? node.attrs.start : 1 }; break;
    case 'codeBlock': out.attrs = { language: null }; break;
    case 'image': {
      const src = httpUrl(node.attrs?.src);
      if (!src) return null;
      out.attrs = { src, alt: str(node.attrs?.alt, 300), title: str(node.attrs?.title, 300) };
      return out;
    }
    case 'youtube': {
      const src = httpUrl(node.attrs?.src);
      if (!src || !/(youtube(-nocookie)?\.com|youtu\.be)\//i.test(src)) return null;
      out.attrs = { src };
      return out;
    }
    case 'gallery': {
      const images = (Array.isArray(node.attrs?.images) ? node.attrs.images : []).slice(0, 12)
        .map((i) => ({ src: httpUrl(i?.src), alt: str(i?.alt, 300), caption: str(i?.caption, 300) }))
        .filter((i) => i.src);
      if (!images.length) return null;
      out.attrs = { images };
      return out;
    }
    case 'horizontalRule':
    case 'hardBreak':
      return out;
    default: break;
  }
  if (Array.isArray(node.content)) {
    const content = node.content.map((c) => cleanNode(c, depth + 1)).filter(Boolean);
    if (content.length) out.content = content;
  }
  return out;
}

/** Returns a clean doc, or null for empty/invalid input. */
export function sanitizeDoc(doc) {
  if (!doc || typeof doc !== 'object' || doc.type !== 'doc') return null;
  const clean = cleanNode(doc, 0);
  if (!clean?.content?.length) return null;
  const hasText = JSON.stringify(clean).match(/"text":"[^"]*\S|"type":"(image|youtube|gallery)"/);
  return hasText ? clean : null;
}
