import { notFound } from 'next/navigation';
import { entityOptions, getArticleAdmin, listCategoriesAdmin, sourceOptions } from '@/lib/admin/data';
import { getSession, isAdminProfile } from '@/lib/auth';
import { ArticleEditor } from '@/components/admin/ArticleEditor';

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { title: 'Noticia' };
  const a = await getArticleAdmin(id).catch(() => null);
  return { title: a?.title?.es || 'Noticia' };
}

export default async function EditArticle({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ profile }, article, categories, sources, entities] = await Promise.all([getSession(), getArticleAdmin(id), listCategoriesAdmin(), sourceOptions(), entityOptions()]);
  if (!article) notFound();
  return (
    <div className="page page--editor">
      <ArticleEditor key={article.id} article={article} categories={categories} sourceOptions={sources} entityOptions={entities} isAdmin={isAdminProfile(profile)} />
    </div>
  );
}
