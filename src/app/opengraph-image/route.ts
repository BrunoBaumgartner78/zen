import { ImageResponse } from 'next/og'
import { getBaseUrl } from '@/lib/base-url'

// Route Segment config
export const runtime = 'edge'
export const alt = 'Zen Garden – Open Graph'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function GET() {
  // Beispiel: Optional etwas aus der API laden (robust via getBaseUrl)
  const base = getBaseUrl()
  // z.B. letzten öffentlichen Garden (falls du so eine Route hast):
  // const latest = await fetch(`${base}/api/gardens?public=1&limit=1`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 60,
          background: '#E9E3D5',
          color: '#1b1b1b',
          fontSize: 56,
          fontWeight: 800,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div>Zen Garden</div>
        <div style={{ fontSize: 28, marginTop: 12, opacity: 0.75 }}>
          Ziehe sanfte Rillen, platziere Steine & lausche Wind und Chimes.
        </div>
      </div>
    ),
    { ...size }
  )
}
