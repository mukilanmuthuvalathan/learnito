import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.GITHUB_PAGES === 'true' ? '/learnito/' : '/';

function inlineCssPlugin() {
  return {
    name: 'inline-css-for-pagespeed',
    enforce: 'post',
    generateBundle(_, bundle) {
      const htmlAsset = Object.values(bundle).find((asset) => asset.type === 'asset' && asset.fileName === 'index.html');
      const cssAsset = Object.values(bundle).find((asset) => asset.type === 'asset' && asset.fileName.endsWith('.css'));

      if (!htmlAsset || !cssAsset) return;

      htmlAsset.source = String(htmlAsset.source).replace(
        /<link rel="stylesheet" crossorigin href="\/(assets\/[^\"]+\.css)">/,
        `<style>${cssAsset.source}</style>`
      );
      delete bundle[cssAsset.fileName];
    }
  };
}

export default defineConfig({
  base,
  plugins: [
    react(),
    inlineCssPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'learnito-logo.png', 'learnito-logo-ui.png', 'learnito-logo-small.png', 'whatsapp-qr.jpeg'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Learnito AI Study Notes Generator',
        short_name: 'Learnito AI',
        description: 'Generate summaries, concepts, and quizzes from study material.',
        theme_color: '#2563eb',
        background_color: '#f8fafc',
        display: 'standalone',
        scope: base,
        start_url: base,
        icons: [
          {
            src: `${base}learnito-logo.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: `${base}icon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'study-notes-pages'
            }
          }
        ]
      }
    })
  ]
});
