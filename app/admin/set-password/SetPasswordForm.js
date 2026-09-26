'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { browserClient } from '@/lib/supabase/browser';

export function SetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p1 = String(fd.get('p1')); const p2 = String(fd.get('p2'));
    if (p1.length < 10) return setError('Mínimo 10 caracteres.');
    if (p1 !== p2) return setError('Las contraseñas no coinciden.');
    setBusy(true);
    const { error: err } = await browserClient().auth.updateUser({ password: p1 });
    setBusy(false);
    if (err) return setError(err.message);
    router.replace('/admin');
    router.refresh();
  };
  return (
    <form onSubmit={submit} className="login__form">
      <div className="field"><label className="field__label" htmlFor="p1">Nueva contraseña</label><input id="p1" name="p1" type="password" className="input" autoComplete="new-password" required minLength={10} /></div>
      <div className="field"><label className="field__label" htmlFor="p2">Repítela</label><input id="p2" name="p2" type="password" className="input" autoComplete="new-password" required /></div>
      {error && <p className="login__error" role="alert">{error}</p>}
      <button className="abtn abtn--primary abtn--block" disabled={busy}>{busy ? 'Guardando…' : 'Guardar y entrar'}</button>
    </form>
  );
}
