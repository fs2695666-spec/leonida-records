import { listEntitiesAdmin } from '@/lib/admin/data';
import { PageHeader } from '@/components/admin/PageHeader';
import { PhotoAssigner } from '@/components/admin/PhotoAssigner';

export const metadata = { title: 'Fotos de las fichas' };

export default async function PhotosPage({ searchParams }) {
  const sp = await searchParams;
  const rows = await listEntitiesAdmin();
  return (
    <div className="page">
      <PageHeader
        title="Fotos de las fichas"
        lead="Pon foto a las fichas que no la tienen, una detrás de otra: elige de la biblioteca, sube un archivo o pega una URL. Se guarda al momento."
        crumbs={[{ label: 'Fichas', href: '/admin/content' }, { label: 'Fotos' }]}
      />
      <PhotoAssigner rows={rows} initialType={sp?.type || 'vehicles'} />
    </div>
  );
}
