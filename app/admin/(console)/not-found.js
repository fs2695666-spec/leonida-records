import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="page">
      <div className="empty">
        <div className="empty__art" aria-hidden="true" />
        <h3>No lo encontramos</h3>
        <p>Puede que se haya eliminado o que el enlace sea incorrecto.</p>
        <Link className="abtn abtn--primary" href="/admin">Volver al panel</Link>
      </div>
    </div>
  );
}
