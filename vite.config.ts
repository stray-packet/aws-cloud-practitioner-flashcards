import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/aws-cloud-practitioner-flashcards/' : '/',
  publicDir: 'static',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png'],
      manifest: {
        name: 'AWS Study',
        short_name: 'AWS Study',
        description: 'Spaced repetition for AWS certification study.',
        theme_color: '#f3f3f3',
        background_color: '#f3f3f3',
        display: 'standalone',
        start_url: '.',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
