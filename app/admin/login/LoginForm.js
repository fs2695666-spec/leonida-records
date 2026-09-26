'use client';
import { useActionState, useState } from 'react';
import { login, requestReset } from './actions';

export function LoginForm({ next, notice }) {
  const [mode, setMode] = useState('login');
  const [state, formAction, pending] = useActionState(mode === 'login' ? login : requestReset, null);
  return (
    <form action={formAction} className="login__form" key={mode}>
      <input type="hidden" name="next" value={next || ''} />
      {notice && <p className="login__notice">{notice}</p>}
      <div className="field">
        <label className="field__label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" autoComplete="username" required defaultValue={state?.email || ''} autoFocus />
      </div>
      {mode === 'login' && (
        <div className="field">
          <label className="field__label" htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
        </div>
      )}
      {state?.error && <p className="login__error" role="alert">{state.error}</p>}
      {state?.sent && <p className="login__ok" role="status">Si existe una cuenta con ese email, te hemos enviado un enlace para crear una contraseña nueva.</p>}
      <button type="submit" className="abtn abtn--primary abtn--block" disabled={pending}>
        {pending ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Enviar enlace'}
      </button>
      <button type="button" className="login__switch" onClick={() => setMode(mode === 'login' ? 'reset' : 'login')}>
        {mode === 'login' ? '¿Has olvidado la contraseña?' : 'Volver al acceso'}
      </button>
    </form>
  );
}
