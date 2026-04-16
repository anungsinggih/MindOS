import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['mindos-icon.svg'],
      manifest: {
        name: 'MindOS Dashboard',
        short_name: 'MindOS',
        description: 'Your Personal Cognitive Restructuring OS',
        theme_color: '#171614',
        background_color: '#171614',
        display: 'fullscreen',
        orientation: 'portrait',
        icons: [
          {
            src: 'mindos-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
