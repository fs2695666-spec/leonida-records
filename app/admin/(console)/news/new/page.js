import { entityOptions, listCategoriesAdmin, sourceOptions } from '@/lib/admin/data';
import { getSession, isAdminProfile } from '@/lib/auth';
import { isTranslateConfigured } from '@/lib/translate';
import { ArticleEditor } from '@/components/admin/ArticleEditor';

export const metadata = { title: 'Nueva noticia' };

export default async function NewArticle() {
  const [{ profile }, categories, sources, entities] = await Promise.all([getSession(), listCategoriesAdmin(), sourceOptions(), entityOptions()]);
  return (
    <div className="page page--editor">
      <ArticleEditor article={null} categories={categories} sourceOptions={sources} entityOptions={entities} isAdmin={isAdminProfile(profile)} translateEnabled={isTranslateConfigured()} authorDefault={profile?.display_name || ''} />
    </div>
  );
}
