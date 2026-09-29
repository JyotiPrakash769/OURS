import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // avoids trapping users on stale builds
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'OURS ♡',
        short_name: 'OURS',
        description: 'Our little story.',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F7F3EC',
        theme_color: '#F7F3EC',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // App shell + static assets only; private dynamic data is never cached offline.
      workbox: { globPatterns: ['**/*.{js,css,html,woff2,png}'], navigateFallback: '/index.html' },
    }),
  ],
})
