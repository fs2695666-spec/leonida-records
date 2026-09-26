'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/* ------------------------------------------------------------------ Toasts */
const ToastCtx = createContext(null);
const ConfirmCtx = createContext(null);

export function AdminProviders({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const toast = useCallback((message, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-3), { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 7000 : 3500);
  }, []);

  const confirm = useCallback((opts) => new Promise((resolve) => {
    setConfirmState({ ...opts, resolve });
  }), []);

  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        {children}
        <div className="toasts" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className="toast" data-kind={t.kind}>
              <span className="toast__icon" aria-hidden="true">{t.kind === 'error' ? '!' : '✓'}</span>
              <p>{t.message}</p>
              <button type="button" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} aria-label="Cerrar">×</button>
            </div>
          ))}
        </div>
        {confirmState && (
          <ConfirmDialog
            {...confirmState}
            onClose={(v) => { confirmState.resolve(v); setConfirmState(null); }}
          />
        )}
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
export const useConfirm = () => useContext(ConfirmCtx);

function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', danger = false, onClose }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <Modal title={title} onClose={() => onClose(false)} size="s">
      {message && <p className="confirm__msg">{message}</p>}
      <div className="modal__actions">
        <button type="button" className="abtn" onClick={() => onClose(false)}>Cancelar</button>
        <button type="button" ref={ref} className={`abtn ${danger ? 'abtn--danger' : 'abtn--primary'}`} onClick={() => onClose(true)}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------ Modal/Drawer */
export function Modal({ title, children, onClose, size = 'm', variant = 'modal', footer }) {
  const panel = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0]; const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('is-locked');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('is-locked');
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className={`overlay overlay--${variant}`} role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="overlay__scrim" onClick={onClose} tabIndex={-1} aria-label="Cerrar" />
      <div ref={panel} className={`${variant} ${variant}--${size}`}>
        <header className={`${variant}__head`}>
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">×</button>
        </header>
        <div className={`${variant}__body`}>{children}</div>
        {footer && <footer className={`${variant}__foot`}>{footer}</footer>}
      </div>
    </div>
  );
}

export function Drawer(props) {
  return <Modal {...props} variant="drawer" />;
}

/* ------------------------------------------------------- Server-action runner */
/**
 * Runs a server action returning {ok, error, data}; toasts and refreshes.
 * const [run, pending] = useAction();  await run(saveX(payload), 'Guardado')
 */
export function useAction() {
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const run = useCallback(async (promise, successMsg, { refresh = true, silent = false } = {}) => {
    setBusy(true);
    try {
      const res = await promise;
      if (!res?.ok) {
        toast(res?.error || 'No se pudo completar la acción', 'error');
        return null;
      }
      if (successMsg && !silent) toast(successMsg);
      if (refresh) startTransition(() => router.refresh());
      return res.data ?? true;
    } catch (e) {
      toast(e?.message?.includes('fetch') ? 'Sin conexión con el servidor' : 'Error inesperado', 'error');
      return null;
    } finally {
      setBusy(false);
    }
  }, [toast, router]);
  return [run, busy || pending];
}

/* --------------------------------------------------------------- Small bits */
export function Spinner({ label = 'Cargando' }) {
  return <span className="spinner" role="status" aria-label={label} />;
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty">
      <div className="empty__art" aria-hidden="true" />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function StatusPill({ published, publishedAt }) {
  const scheduled = published && publishedAt && publishedAt > new Date().toISOString();
  const kind = scheduled ? 'scheduled' : published ? 'published' : 'draft';
  const label = scheduled ? 'Programado' : published ? 'Publicado' : 'Borrador';
  return <span className="pill" data-kind={kind}>{label}</span>;
}

export function EvidencePill({ level }) {
  const labels = { CONFIRMED: 'Confirmado', OBSERVED: 'Observado', REPORTED: 'Reportado', SPECULATION: 'Especulación', DEBUNKED: 'Desmentido' };
  return <span className="evidence" data-level={level}>{labels[level] || level}</span>;
}

export function LangDots({ value }) {
  const langs = ['es', 'en', 'pt', 'fr'];
  const filled = (v) => {
    if (!v) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    return JSON.stringify(v).includes('"text":"');
  };
  return (
    <span className="langdots" aria-label="Traducciones">
      {langs.map((l) => <span key={l} data-on={filled(value?.[l]) || undefined} title={`${l.toUpperCase()}: ${filled(value?.[l]) ? 'traducido' : 'falta'}`}>{l}</span>)}
    </span>
  );
}

export function relTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const s = (Date.now() - d.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  if (Math.abs(s) < 60) return 'ahora mismo';
  if (Math.abs(s) < 3600) return rtf.format(-Math.round(s / 60), 'minute');
  if (Math.abs(s) < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
  if (Math.abs(s) < 86400 * 7) return rtf.format(-Math.round(s / 86400), 'day');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatBytes(n) {
  if (!n && n !== 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function slugify(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

/** Warn before leaving the page with unsaved changes. */
export function useUnsavedGuard(dirty) {
  useEffect(() => {
    if (!dirty) return undefined;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);
}

/** Ctrl/Cmd+S */
export function useSaveShortcut(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); ref.current?.(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
}
