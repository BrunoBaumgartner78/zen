/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // TEMP: Lint-Errors stoppen das Build nicht
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TEMP: TS-Fehler stoppen das Build nicht
    ignoreBuildErrors: true,
  },
}

export default nextConfig
