import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'logo.svg'],
      manifest: {
        name: 'Managecoin',
        short_name: 'Managecoin',
        description: 'Quản lý chi tiêu',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/logo.svg', // Temporary icon URL
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo.svg', // Temporary icon URL
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/logo.svg',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
});
