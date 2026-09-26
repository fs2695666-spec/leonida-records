import { listMediaAdmin } from '@/lib/admin/data';
import { PageHeader } from '@/components/admin/PageHeader';
import { MediaLibrary } from '@/components/admin/MediaLibrary';

export const metadata = { title: 'Media' };

export default async function MediaAdmin() {
  const rows = await listMediaAdmin();
  return (
    <div className="page">
      <PageHeader title="Biblioteca de medios" lead="Todo lo que subes se guarda en Supabase Storage y se puede reutilizar en fichas, noticias y galerías." />
      <MediaLibrary rows={rows} />
    </div>
  );
}
