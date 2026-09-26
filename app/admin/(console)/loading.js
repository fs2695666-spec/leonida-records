export default function Loading() {
  return (
    <div className="page" aria-busy="true" aria-label="Cargando">
      <div className="skeleton" style={{ height: 36, width: '40%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 32 }} />
      <div className="skeleton" style={{ height: 52, marginBottom: 10 }} />
      {Array.from({ length: 7 }, (_, i) => <div key={i} className="skeleton" style={{ height: 58, marginBottom: 6, opacity: 1 - i * 0.1 }} />)}
    </div>
  );
}
