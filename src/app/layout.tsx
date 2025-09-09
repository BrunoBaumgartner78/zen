// src/app/layout.tsx
import './globals.css'
import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'

const SITE_URL = 'https://blue-lotos.ch'
const TITLE = 'Zen Garden – Ruhige Sandkunst im Browser'
const DESCRIPTION =
  'Ziehe sanfte Rillen, platziere Steine & lausche Wind und Chimes. Ein beruhigender Zen Garden mit Pixi.js.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Zen Garden',
  title: {
    default: TITLE,
    template: '%s · Zen Garden',
  },
  description: DESCRIPTION,
  alternates: {
    canonical: '/',
    languages: { 'de-CH': '/', 'de': '/', 'en': '/?lang=en' },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Zen Garden',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Zen Garden – Sand, Steine & Wellen',
      },
    ],
    locale: 'de_CH',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/twitter-image'],
  },
  icons: {
    icon: [
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.webmanifest',
}

// hierher gehört themeColor!
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E9E3D5' },
    { media: '(prefers-color-scheme: dark)', color: '#D8D3C6' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // JSON-LD (WebSite + WebPage)
  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Zen Garden',
    url: SITE_URL,
    inLanguage: 'de-CH',
  }
  const jsonLdWebPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Zen Garden – Ruhige Sandkunst im Browser',
    description: DESCRIPTION,
    url: SITE_URL,
    isPartOf: { '@type': 'WebSite', url: SITE_URL, name: 'Zen Garden' },
  }

  return (
    <html lang="de" style={{ height: '100%', overflow: 'hidden' }}>
      <body
        style={{
          margin: 0,
          padding: 0,
          height: '100%',
          overflow: 'hidden',
          overscrollBehavior: 'none' as any,
          background: '#E9E3D5',
        }}
      >
        {children}
        <script
          type="application/ld+json"
          // @ts-ignore
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([jsonLdWebsite, jsonLdWebPage]),
          }}
        />
      </body>
    </html>
  )
}
