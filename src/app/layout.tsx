// src/app/layout.tsx
import './globals.css'
import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import AuthProvider from '@/components/AuthProvider'
import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import UpgradeSync from '@/components/UpgradeSync'
import BrandConsole from '@/components/BrandConsole'
import CookieBanner from '@/components/CookieBanner'

// Google Font
import { Yuji_Mai } from 'next/font/google'
const vibes = Yuji_Mai({ subsets: ['latin'], weight: '400', variable: '--font-yuji' })

const isProd = process.env.NODE_ENV === 'production'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-4LRM8ZC8RQ'

// Für lokale Dev-Previews kannst du optional http://localhost:3000 nutzen
const SITE_URL = 'https://blue-lotos.ch'
const TITLE = 'Zen Garden – Ruhige Sandkunst im Browser'
const DESCRIPTION =
  'Ziehe sanfte Rillen, platziere Steine & lausche Wind und Chimes. Ein beruhigender Zen Garden mit Pixi.js.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Zen Garden',
  title: { default: TITLE, template: '%s · Zen Garden' },
  description: DESCRIPTION,
  alternates: { canonical: '/', languages: { 'de-CH': '/', de: '/', en: '/?lang=en' } },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Zen Garden',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Zen Garden – Sand, Steine & Wellen' }],
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
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E9E3D5' },
    { media: '(prefers-color-scheme: dark)', color: '#D8D3C6' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Strukturierte Daten
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
  const jsonLdGame = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Zen Garden Online',
    applicationCategory: 'Game',
    operatingSystem: 'Web Browser',
    genre: 'Casual, Simulation',
    description:
      'Virtueller Zen Garden online im Browser – Sand, Steine & Wellen ziehen, entspannen und teilen.',
    url: SITE_URL,
    author: { '@type': 'Person', name: 'Bruno Baumgartner', url: 'https://baumgartner-development.ch' },
  }
  const ldJson = JSON.stringify([jsonLdWebsite, jsonLdWebPage, jsonLdGame])

  // kleines Bootstrapping-Snippet:
  // - lädt GA nur bei consent=accepted
  // - reagiert auf ein optionales "ga-consent-granted" Event (kannst du aus dem CookieBanner dispatchen)
  const gaBootstrap = `
    (function() {
      var GA_ID='${GA_ID}';
      if (!('${isProd}' === 'true')) return; // nur Produktion
      function loadGA() {
        if (!GA_ID || window.__gaLoaded) return;
        window.__gaLoaded = true;
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID, { page_path: window.location.pathname });
      }
      try {
        var consent = (typeof localStorage !== 'undefined') ? localStorage.getItem('cookie_consent') : null;
        if (consent === 'accepted') { loadGA(); }
        window.addEventListener('ga-consent-granted', loadGA, { once: true });
      } catch (e) {}
    })();
  `

  return (
    <html lang="de" className={vibes.variable}>
      <body>
        <AuthProvider>
          <UpgradeSync />
          <BrandConsole />
          <CookieBanner />
          {children}
          {/* Vercel Analytics nur in Production */}
          {isProd && <VercelAnalytics debug={false} />}
        </AuthProvider>

        {/* Toaster */}
        <Toaster
          position="top-center"
          richColors
          closeButton
          expand={false}
          toastOptions={{ duration: 3000 }}
        />

        {/* Strukturierte Daten */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson }} />

        {/* GA Bootstrap (lädt GA nur bei Consent + in Prod) */}
        <script dangerouslySetInnerHTML={{ __html: gaBootstrap }} />
      </body>
    </html>
  )
}
