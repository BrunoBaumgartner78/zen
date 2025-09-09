// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['pixi.js', '@pixi/react'],
  productionBrowserSourceMaps: false,
  eslint: {
    // Lint-Fehler blockieren den Build nicht (z. B. auf Vercel).
    // Lokal kannst du weiter `npm run lint` benutzen.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
