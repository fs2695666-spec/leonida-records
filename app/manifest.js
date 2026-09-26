export default function manifest() {
  return {
    name: 'Leonida Records',
    short_name: 'Leonida',
    description: 'Archivo independiente de GTA VI — unofficial fan project.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff5f0',
    theme_color: '#fff5f0',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
