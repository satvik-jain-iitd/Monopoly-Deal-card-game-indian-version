import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.ico', 'icons/*.svg'],
      manifest: {
        name: 'Dhandha - Property Card Game',
        short_name: 'Dhandha',
        description: 'India ka apna property card game — 2 se 6 players ke saath khelo!',
        theme_color: '#E65100',
        background_color: '#FFF8F0',
        display: 'standalone',
        orientation: 'portrait',
        scope: './',
        start_url: './',
        icons: [
          { src: 'icons/pwa-64x64.png',               sizes: '64x64',   type: 'image/png' },
          { src: 'icons/pwa-192x192.png',              sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512x512.png',              sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-icon-512x512.png',    sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  base: './',
})
