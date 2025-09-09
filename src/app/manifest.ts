// src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zen Garden',
    short_name: 'Zen Garden',
    description: 'Ruhige Sandkunst im Browser: Rillen zeichnen, Steine setzen, Wind & Chimes hören.',
    start_url: '/',
    display: 'standalone',
    background_color: '#E9E3D5',
    theme_color: '#E9E3D5',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
