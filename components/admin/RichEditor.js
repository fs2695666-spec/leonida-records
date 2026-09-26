'use client';
import { useEffect, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Placeholder } from '@tiptap/extensions';
import { MediaPicker } from './MediaPicker';
import { Modal } from './ui';

/** Custom block: a gallery of images stored as attrs.images = [{src, alt, caption}] */
const Gallery = Node.create({
  name: 'gallery',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return { images: { default: [] } };
  },
  parseHTML() {
    return [{ tag: 'div[data-gallery]', getAttrs: (el) => { try { return { images: JSON.parse(el.getAttribute('data-images') || '[]') }; } catch { return { images: [] }; } } }];
  },
  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-gallery': '', 'data-images': JSON.stringify(node.attrs.images) })];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'ed-gallery';
      dom.setAttribute('contenteditable', 'false');
      for (const im of node.attrs.images || []) {
        const img = document.createElement('img');
        img.src = im.src; img.alt = im.alt || '';
        dom.appendChild(img);
      }
      const label = document.createElement('span');
      label.textContent = `Galería · ${(node.attrs.images || []).length} imágenes`;
      dom.appendChild(label);
      return { dom };
    };
  },
});

function B({ on, onClick, title, children, disabled }) {
  return <button type="button" className="ed-btn" aria-pressed={on || false} onClick={onClick} title={title} aria-label={title} disabled={disabled}>{children}</button>;
}

const EMPTY = { type: 'doc', content: [{ type: 'paragraph' }] };

/**
 * Rich-text editor (Tiptap). Emits ProseMirror JSON — never HTML.
 * The server sanitizes it again before saving (lib/richtext-sanitize.js).
 */
export function RichEditor({ value, onChange, placeholder = 'Empieza a escribir…', minimal = false, label }) {
  const [picker, setPicker] = useState(null); // 'image' | 'gallery'
  const [dialog, setDialog] = useState(null); // {kind:'link'|'youtube', value}

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https', protocols: ['http', 'https', 'mailto'], HTMLAttributes: { rel: 'noopener noreferrer nofollow' } },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ nocookie: true, controls: true, modestBranding: true }),
      Gallery,
      Placeholder.configure({ placeholder }),
    ],
    content: value && value.type === 'doc' ? value : EMPTY,
    editorProps: { attributes: { class: 'richtext ed-content', 'aria-label': label || 'Editor de texto', role: 'textbox', 'aria-multiline': 'true' } },
    // JSON round-trip: ProseMirror attrs are null-prototype objects, which React
    // cannot serialize as Server Action arguments.
    onUpdate: ({ editor: ed }) => onChange(ed.isEmpty ? null : JSON.parse(JSON.stringify(ed.getJSON()))),
  });

  // Replace content when switching language (value identity changes from outside)
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = value && value.type === 'doc' ? value : EMPTY;
    if (JSON.stringify(next) !== current && !(editor.isEmpty && !value)) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: ed }) => ed ? ({
      bold: ed.isActive('bold'), italic: ed.isActive('italic'), strike: ed.isActive('strike'), underline: ed.isActive('underline'),
      h2: ed.isActive('heading', { level: 2 }), h3: ed.isActive('heading', { level: 3 }), link: ed.isActive('link'),
      bullet: ed.isActive('bulletList'), ordered: ed.isActive('orderedList'), quote: ed.isActive('blockquote'),
      canUndo: ed.can().undo(), canRedo: ed.can().redo(),
    }) : {},
  }) || {};

  if (!editor) return <div className="ed ed--loading"><div className="skeleton" style={{ height: 180 }} /></div>;
  const chain = () => editor.chain().focus();

  const applyLink = (raw) => {
    const v = String(raw || "").trim();
    if (!v) { chain().extendMarkRange('link').unsetLink().run(); return; }
    const href = /^(https?:|mailto:|\/|#)/i.test(v) ? v : `https://${v}`;
    if (editor.state.selection.empty && !editor.isActive('link')) {
      // Nothing selected: insert the URL itself as linked text.
      chain().insertContent({ type: 'text', text: href.replace(/^https?:\/\//, ''), marks: [{ type: 'link', attrs: { href } }] }).run();
    } else {
      chain().extendMarkRange('link').setLink({ href }).run();
    }
  };

  return (
    <div className="ed">
      <div className="ed-toolbar" role="toolbar" aria-label="Formato">
        {!minimal && <>
          <B on={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()} title="Título de sección (H2)">H2</B>
          <B on={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()} title="Subtítulo (H3)">H3</B>
          <span className="ed-sep" />
        </>}
        <B on={state.bold} onClick={() => chain().toggleBold().run()} title="Negrita (Ctrl+B)"><b>B</b></B>
        <B on={state.italic} onClick={() => chain().toggleItalic().run()} title="Cursiva (Ctrl+I)"><i>I</i></B>
        <B on={state.underline} onClick={() => chain().toggleUnderline().run()} title="Subrayado"><u>U</u></B>
        <B on={state.strike} onClick={() => chain().toggleStrike().run()} title="Tachado"><s>S</s></B>
        <B on={state.link} onClick={() => setDialog({ kind: 'link', value: editor.getAttributes('link').href || '' })} title="Enlace">🔗</B>
        <span className="ed-sep" />
        <B on={state.bullet} onClick={() => chain().toggleBulletList().run()} title="Lista">•≡</B>
        <B on={state.ordered} onClick={() => chain().toggleOrderedList().run()} title="Lista numerada">1≡</B>
        <B on={state.quote} onClick={() => chain().toggleBlockquote().run()} title="Cita">❝</B>
        {!minimal && <>
          <B onClick={() => chain().setHorizontalRule().run()} title="Separador">―</B>
          <span className="ed-sep" />
          <B onClick={() => setPicker('image')} title="Imagen">🖼</B>
          <B onClick={() => setPicker('gallery')} title="Galería">▦</B>
          <B onClick={() => setDialog({ kind: 'youtube', value: '' })} title="Vídeo de YouTube">▶</B>
        </>}
        <span className="ed-spacer" />
        <B onClick={() => chain().undo().run()} disabled={!state.canUndo} title="Deshacer">↶</B>
        <B onClick={() => chain().redo().run()} disabled={!state.canRedo} title="Rehacer">↷</B>
      </div>
      <EditorContent editor={editor} />

      {picker && (
        <MediaPicker
          multiple={picker === 'gallery'}
          title={picker === 'gallery' ? 'Elegir imágenes para la galería' : 'Insertar imagen'}
          onClose={() => setPicker(null)}
          onPick={(items) => {
            if (picker === 'image') {
              const m = items[0];
              chain().setImage({ src: m.url, alt: m.alt_text || '', title: m.caption || '' }).run();
            } else {
              chain().insertContent({ type: 'gallery', attrs: { images: items.map((m) => ({ src: m.url, alt: m.alt_text || '', caption: m.caption || '' })) } }).run();
            }
          }}
        />
      )}

      {dialog && (
        <Modal title={dialog.kind === 'link' ? 'Enlace' : 'Insertar vídeo de YouTube'} size="s" onClose={() => setDialog(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const v = new FormData(e.currentTarget).get('v') || '';
            if (dialog.kind === 'link') applyLink(String(v));
            else if (String(v).trim()) chain().setYoutubeVideo({ src: String(v).trim() }).run();
            setDialog(null);
          }}>
            <input name="v" className="input" autoFocus defaultValue={dialog.value}
              placeholder={dialog.kind === 'link' ? 'https://www.rockstargames.com/…' : 'https://www.youtube.com/watch?v=…'} />
            <p className="field__hint">{dialog.kind === 'link' ? 'Déjalo vacío para quitar el enlace.' : 'Se incrusta con youtube-nocookie.com.'}</p>
            <div className="modal__actions">
              <button type="button" className="abtn" onClick={() => setDialog(null)}>Cancelar</button>
              <button type="submit" className="abtn abtn--primary">Aplicar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
