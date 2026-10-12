import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

/** The public address of the site, so link previews (WhatsApp, iMessage, Slack) get a full image address. */
const siteUrl = () => {
  const given = process.env.SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? '';
  if (!given) return '';
  return (/^https?:/.test(given) ? given : `https://${given}`).replace(/\/$/, '');
};

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      { name: 'site-url', transformIndexHtml: (html: string) => html.replaceAll('%SITE_URL%', siteUrl()) },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Local printer helper (npm run printer-helper)
      proxy: { '/api': 'http://127.0.0.1:3001' },
    },
    preview: {
      proxy: { '/api': 'http://127.0.0.1:3001' },
    },
  };
});
