'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast, Spinner } from './ui';
import { translateMissingBatch, translationStatus } from '@/app/admin/_actions/translate';

/** Dashboard block: automatic translation status + "translate everything that is missing". */
export function TranslateTools() {
  const toast = useToast();
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const load = async () => {
    const r = await translationStatus();
    if (r.ok) setStatus(r.data);
  };
  useEffect(() => { load(); }, []);

  const runAll = async () => {
    setRunning(true);
    setProgress(0);
    let total = 0;
    try {
      for (let i = 0; i < 200; i += 1) {
        const r = await translateMissingBatch();
        if (!r.ok) { toast(r.error, 'error'); break; }
        total += r.data.processed;
        setProgress(total);
        if (!r.data.remaining || !r.data.processed) break;
      }
      if (total) toast(`${total} ${total === 1 ? 'elemento traducido' : 'elementos traducidos'} al inglés, portugués y francés`);
    } finally {
      setRunning(false);
      await load();
      router.refresh();
    }
  };

  if (!status) return <div className="translate-box"><Spinner /> <span className="muted">Comprobando traducciones…</span></div>;

  if (!status.configured) {
    return (
      <div className="translate-box">
        <p><strong>Traducción automática desactivada.</strong> Añade la variable <code>DEEPL_API_KEY</code> en Vercel (cuenta gratuita de DeepL) y todo lo que escribas en español se traducirá solo al guardar.</p>
      </div>
    );
  }
  const pct = status.usage?.limit ? Math.round((status.usage.used / status.usage.limit) * 100) : null;
  return (
    <div className="translate-box">
      <div>
        <p><strong>Traducción automática activada.</strong> {status.pending
          ? `${status.pending} ${status.pending === 1 ? 'elemento tiene' : 'elementos tienen'} idiomas sin traducir.`
          : 'Todo el contenido está traducido.'}</p>
        {pct !== null && <p className="muted">DeepL este mes: {status.usage.used.toLocaleString('es-ES')} de {status.usage.limit.toLocaleString('es-ES')} caracteres ({pct} %).</p>}
      </div>
      {status.pending > 0 && (
        <button type="button" className="abtn abtn--primary abtn--small" onClick={runAll} disabled={running}>
          {running ? <><Spinner /> Traduciendo… {progress}</> : 'Traducir todo lo que falta'}
        </button>
      )}
    </div>
  );
}
