// src/app/twitter-image.tsx
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 } // Twitter large summary akzeptiert 2:1 oder 1200x600/630
export const contentType = 'image/png'

export default function TwitterImage() {
  const { width, height } = size
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width,
          height,
          background: '#E5DED7',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              letterSpacing: 1,
              color: '#1b1b1b',
            }}
          >
            Zen Garden
          </div>
          <div style={{ fontSize: 26, color: '#4b4b4b', marginTop: 10 }}>
            daily calm · made with Pixi.js
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
