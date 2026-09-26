import '@/styles/base.css';
import '@/styles/admin.css';
import { fontVars } from '@/lib/fonts';
import { AdminProviders } from '@/components/admin/ui';

export const metadata = {
  title: { default: 'Editorial · Leonida Records', template: '%s · Editorial Leonida Records' },
  robots: { index: false, follow: false },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#1d1a3a' };

export default function AdminRootLayout({ children }) {
  return (
    <html lang="es" className={fontVars}>
      <body className="admin-body">
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
