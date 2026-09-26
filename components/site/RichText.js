import { Fragment } from 'react';
import { Img } from './Img';

// Safe renderer for Tiptap/ProseMirror JSON. Only whitelisted node types and marks
// are rendered; links are restricted to http(s), mailto and relative URLs.
// No HTML string is ever injected.

export function safeHref(url) {
  if (typeof url !== 'string') return null;
  const u = url.trim();
  if (/^(https?:|mailto:)/i.test(u)) return u;
  if (u.startsWith('/') && !u.startsWith('//')) return u;
  if (u.startsWith('#')) return u;
  return null;
}

export function youtubeId(src) {
  if (typeof src !== 'string') return null;
  const m = src.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/);
  return m ? m[1] : null;
}

function renderMarks(text, marks = [], key) {
  let node = text;
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold': node = <strong key={key}>{node}</strong>; break;
      case 'italic': node = <em key={key}>{node}</em>; break;
      case 'strike': node = <s key={key}>{node}</s>; break;
      case 'underline': node = <u key={key}>{node}</u>; break;
      case 'code': node = <code key={key}>{node}</code>; break;
      case 'link': {
        const href = safeHref(mark.attrs?.href);
        if (href) {
          const external = /^https?:/i.test(href);
          node = <a key={key} href={href} className="rt-link" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{node}</a>;
        }
        break;
      }
      default: break;
    }
  }
  return node;
}

function Node({ node, idx }) {
  const kids = (node.content || []).map((c, i) => <Node key={i} node={c} idx={i} />);
  switch (node.type) {
    case 'doc': return <>{kids}</>;
    case 'paragraph': return kids.length ? <p>{kids}</p> : null;
    case 'text': return <Fragment>{renderMarks(node.text || '', node.marks, idx)}</Fragment>;
    case 'hardBreak': return <br />;
    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 2, 2), 4);
      const Tag = `h${level}`;
      return <Tag>{kids}</Tag>;
    }
    case 'bulletList': return <ul>{kids}</ul>;
    case 'orderedList': return <ol start={node.attrs?.start || 1}>{kids}</ol>;
    case 'listItem': return <li>{kids}</li>;
    case 'blockquote': return <blockquote>{kids}</blockquote>;
    case 'horizontalRule': return <hr />;
    case 'codeBlock': return <pre><code>{kids}</code></pre>;
    case 'image': {
      const src = safeHref(node.attrs?.src);
      if (!src) return null;
      return (
        <figure className="rt-figure">
          <div className="rt-figure__img"><Img src={src} alt={node.attrs?.alt || ''} fill={false} sizes="(min-width: 900px) 760px, 100vw" /></div>
          {node.attrs?.title && <figcaption>{node.attrs.title}</figcaption>}
        </figure>
      );
    }
    case 'youtube': {
      const id = youtubeId(node.attrs?.src);
      if (!id) return null;
      return (
        <div className="rt-embed">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
            title="YouTube"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      );
    }
    case 'gallery': {
      const images = Array.isArray(node.attrs?.images) ? node.attrs.images.filter((i) => safeHref(i?.src)) : [];
      if (!images.length) return null;
      return (
        <div className="rt-gallery" data-count={Math.min(images.length, 4)}>
          {images.slice(0, 12).map((im, i) => (
            <figure key={i}>
              <div className="rt-gallery__img"><Img src={im.src} alt={im.alt || ''} sizes="(min-width: 900px) 380px, 50vw" /></div>
              {im.caption && <figcaption>{im.caption}</figcaption>}
            </figure>
          ))}
        </div>
      );
    }
    default: return kids.length ? <>{kids}</> : null;
  }
}

/** Render a rich-text value: a Tiptap doc, or a plain string (split into paragraphs). */
export function RichText({ value, className = 'richtext' }) {
  if (!value) return null;
  if (typeof value === 'string') {
    const paras = value.split(/\n{2,}|\r\n\r\n/).map((p) => p.trim()).filter(Boolean);
    return <div className={className}>{paras.map((p, i) => <p key={i}>{p}</p>)}</div>;
  }
  if (value.type !== 'doc') return null;
  return <div className={className}><Node node={value} idx={0} /></div>;
}
