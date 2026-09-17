import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'MaiBookStory',
        short_name: 'MaiBookStory',
        description:
          'Jouw persoonlijke boekenwereld',
        theme_color: '#f8f8f8',
        background_color: '#f8f8f8',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
  {
    src: '/maibookstory-icon.png',
    sizes: '192x192',
    type: 'image/png',
  },
  {
    src: '/maibookstory-icon.png',
    sizes: '512x512',
    type: 'image/png',
  },
],
      },

      workbox: {
        navigateFallback: '/',
      },
    }),
  ],
})