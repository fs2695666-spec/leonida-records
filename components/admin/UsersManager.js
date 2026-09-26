'use client';
import { useState } from 'react';
import { Select, TextInput } from './fields';
import { RelTime } from './RelTime';
import { useAction, useConfirm } from './ui';
import { deleteUser, inviteUser, updateUser } from '@/app/admin/_actions/settings';

const ROLES = [{ value: 'admin', label: 'Administrador' }, { value: 'editor', label: 'Editor' }, { value: 'pending', label: 'Sin acceso' }];

export function UsersManager({ rows, meId, canInvite }) {
  const [run, busy] = useAction();
  const confirm = useConfirm();
  const [invite, setInvite] = useState({ email: '', display_name: '', role: 'editor' });

  const change = async (u, patch, msg) => { await run(updateUser(u.id, patch), msg); };
  const remove = async (u) => {
    if (!(await confirm({ title: `¿Eliminar a ${u.display_name || u.email}?`, message: 'Se borra su cuenta de acceso. Su contenido se conserva.', confirmLabel: 'Eliminar', danger: true }))) return;
    await run(deleteUser(u.id), 'Usuario eliminado');
  };
  const sendInvite = async (e) => {
    e.preventDefault();
    if (await run(inviteUser(invite), `Invitación enviada a ${invite.email}`)) setInvite({ email: '', display_name: '', role: 'editor' });
  };

  return (
    <div className="panel-grid panel-grid--side">
      <section className="card">
        <div className="dt__scroll">
          <table className="dt__table users-table">
            <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th className="hide-s">Alta</th><th /></tr></thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td data-label="Usuario">
                    <div className="user-cell"><span className="avatar" aria-hidden="true">{(u.display_name || u.email || '?').slice(0, 1).toUpperCase()}</span>
                      <span><strong>{u.display_name || '—'}{u.id === meId && <small className="you"> (tú)</small>}</strong><small>{u.email}</small></span></div>
                  </td>
                  <td data-label="Rol">
                    <select className="input input--s" value={u.role} disabled={busy || u.id === meId} onChange={(e) => change(u, { role: e.target.value }, 'Rol actualizado')} aria-label={`Rol de ${u.email}`}>
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </td>
                  <td data-label="Estado">
                    <button type="button" className="pill pill--btn" data-kind={u.active ? 'published' : 'draft'} disabled={busy || u.id === meId}
                      onClick={() => change(u, { active: !u.active }, u.active ? 'Usuario desactivado' : 'Usuario activado')}>
                      {u.active ? 'Activo' : 'Desactivado'}
                    </button>
                  </td>
                  <td className="hide-s" data-label="Alta"><RelTime iso={u.created_at} /></td>
                  <td className="dt__actions">{u.id !== meId && <button type="button" className="icon-btn" onClick={() => remove(u)} disabled={busy} aria-label="Eliminar usuario">×</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="field__hint">«Sin acceso» es el rol por defecto de cualquier cuenta nueva: no puede ver ni editar nada hasta que le asignes Editor o Administrador.</p>
      </section>
      <section className="card">
        <h2 className="card__title">Invitar a alguien</h2>
        {canInvite ? (
          <form onSubmit={sendInvite}>
            <TextInput label="Email" type="email" required value={invite.email} onChange={(v) => setInvite((i) => ({ ...i, email: v }))} />
            <TextInput label="Nombre" value={invite.display_name} onChange={(v) => setInvite((i) => ({ ...i, display_name: v }))} maxLength={80} />
            <Select label="Rol" value={invite.role} onChange={(v) => setInvite((i) => ({ ...i, role: v }))} options={ROLES.slice(0, 2)} />
            <p className="field__hint">Recibirá un email para crear su contraseña.</p>
            <button type="submit" className="abtn abtn--primary" disabled={busy || !invite.email}>Enviar invitación</button>
          </form>
        ) : (
          <div className="notice">
            <p><strong>Invitaciones desactivadas.</strong> Para invitar desde aquí añade <code>SUPABASE_SECRET_KEY</code> en las variables del servidor (Vercel).</p>
            <p>Alternativa: crea el usuario en Supabase → Authentication → Users → «Add user». Aparecerá en esta tabla con «Sin acceso»; cámbiale el rol.</p>
          </div>
        )}
      </section>
    </div>
  );
}
