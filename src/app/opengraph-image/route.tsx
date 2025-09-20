// src/app/opengraph-image/route.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Zen Garden – Sand, Steine & Wellen'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#E9E3D5',
          color: '#111',
          fontSize: 80,
          fontWeight: 700,
          letterSpacing: -1.5,
          fontFamily:
            'system-ui, ui-sans-serif, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji',
        }}
      >
        Zen Garden
      </div>
    ),
    size
  )
}
