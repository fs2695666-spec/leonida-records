'use client';

export default function AdminError({ error, reset }) {
  return (
    <div className="page">
      <div className="empty">
        <div className="empty__art" aria-hidden="true" />
        <h3>Algo ha fallado al cargar esta sección</h3>
        <p>{error?.message?.includes('Supabase') ? error.message : 'Revisa tu conexión o inténtalo de nuevo. Si persiste, comprueba que el esquema SQL está instalado.'}</p>
        <button type="button" className="abtn abtn--primary" onClick={reset}>Reintentar</button>
      </div>
    </div>
  );
}
