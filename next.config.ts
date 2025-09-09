// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // App Router default
  reactStrictMode: true,

  // WICHTIG: Pixi & @pixi/react von Next/SWC transpilen lassen
  transpilePackages: ['pixi.js', '@pixi/react'],

  // Quelle-Maps im Dev, weniger Blackbox
  productionBrowserSourceMaps: false,

  // Saubere Headers können z.B. Audiocache erleichtern (optional)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
