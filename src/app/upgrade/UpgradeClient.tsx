// src/app/upgrade/UpgradeClient.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

export default function UpgradeClient() {
  const sp = useSearchParams()
  const plan = useMemo(() => sp.get('plan') ?? 'premium', [sp])
  const [submitting, setSubmitting] = useState(false)

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    // Button-Feedback: verhindert Doppel-Klicks
    setSubmitting(true)
  }

  return (
    <main style={styles.main}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <span style={styles.badge}>Neu</span>
          <h1 style={styles.h1}>Werde Premium</h1>
          <p style={styles.subtitle}>
            Unbegrenzte Gärten, schnellere Verarbeitung und priorisierter Support – 
            alles im <strong>Plan „{capitalize(plan)}“</strong>.
          </p>
        </div>
        <div style={styles.heroGlow} aria-hidden />
      </section>

      {/* Pricing Card */}
      <section style={styles.wrap}>
        <article style={styles.card}>
          <header style={styles.cardHeader}>
            <div>
              <h2 style={styles.planTitle}>Premium</h2>
              <p style={styles.planSubtitle}>Alles was du brauchst – ohne Limits</p>
            </div>
            <div style={styles.priceBox}>
              <div style={styles.priceRow}>
                <span style={styles.price}>10</span>
                <span style={styles.priceUnit}>CHF</span>
              </div>
              <div style={styles.priceNote}>einmaliger Beitrag</div>
            </div>
          </header>

          <ul style={styles.features}>
            {[
              'Unbegrenzte privaten & öffentlichen Gärten',
              'Schnellere Renderzeiten',
              'Höhere Upload-Limits',
              'Premium-Badges für dein Profil',
              'Priorisierter E-Mail-Support',
            ].map((f) => (
              <li key={f} style={styles.featureItem}>
                <span style={styles.check} aria-hidden>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <form action="/api/stripe/checkout" method="post" onSubmit={onSubmit}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.ctaButton,
                ...(submitting ? styles.ctaButtonDisabled : null),
              }}
            >
              {submitting ? 'Weiter zu Stripe …' : 'Jetzt upgraden'}
            </button>
          </form>

          <p style={styles.help}>
            Bezahlt wird sicher über <strong>Stripe</strong>.
            Du wirst nach dem Klick weitergeleitet.
          </p>

          <div style={styles.trustRow} aria-hidden>
            <div style={styles.trustPill}>Sichere Zahlung</div>
            <div style={styles.dot} />
            <div style={styles.trustPill}>Keine versteckten Gebühren</div>
            <div style={styles.dot} />
            <div style={styles.trustPill}>Jederzeit Kontakt</div>
          </div>
        </article>

        {/* FAQ / Hinweis */}
        <aside style={styles.sideCard}>
          <h3 style={styles.sideTitle}>Häufige Fragen</h3>
          <details style={styles.details}>
            <summary style={styles.summary}>Brauche ich ein Konto?</summary>
            <p style={styles.answer}>
              Ja – bitte melde dich an. Der Zugang wird mit deinem Benutzerkonto verknüpft.
            </p>
          </details>
          <details style={styles.details}>
            <summary style={styles.summary}>Was passiert nach dem Kauf?</summary>
            <p style={styles.answer}>
              Du wirst zurückgeleitet und dein Konto sofort auf Premium umgestellt.
            </p>
          </details>
          <details style={styles.details}>
            <summary style={styles.summary}>Wie erhalte ich Support?</summary>
            <p style={styles.answer}>
              Schreibe uns direkt auf bruno@brainbloom.ch – Premium-Anfragen werden priorisiert.
            </p>
          </details>
        </aside>
      </section>
    </main>
  )
}

function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

/* -------------------- Styles -------------------- */
const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 1100,
    margin: '40px auto',
    padding: '0 16px',
  },
  hero: {
    position: 'relative',
    borderRadius: 20,
    padding: '48px 20px',
    background:
      'radial-gradient(1200px 400px at 50% -200px, rgba(99,102,241,0.18), rgba(16,16,16,0)),' +
      'linear-gradient(180deg, #0f172a, #111827)',
    color: '#fff',
    overflow: 'hidden',
  },
  heroInner: {
    maxWidth: 820,
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  heroGlow: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(500px 160px at 50% 0%, rgba(255,255,255,0.08), rgba(255,255,255,0))',
    pointerEvents: 'none',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: 999,
    background: 'rgba(255,255,255,.12)',
    border: '1px solid rgba(255,255,255,.18)',
    fontSize: 12,
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  h1: {
    margin: '6px 0 8px',
    fontSize: 42,
    lineHeight: 1.1,
    fontWeight: 800,
  },
  subtitle: {
    margin: 0,
    opacity: 0.85,
    fontSize: 16,
  },
  wrap: {
    display: 'grid',
    gridTemplateColumns: '1.35fr .8fr',
    gap: 18,
    marginTop: 22,
  },
  card: {
    borderRadius: 16,
    background: '#fff',
    border: '1px solid rgba(0,0,0,.08)',
    boxShadow: '0 8px 30px rgba(0,0,0,.06)',
    padding: 18,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  planTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: 0.2,
  },
  planSubtitle: {
    margin: '4px 0 0',
    opacity: 0.7,
    fontSize: 14,
  },
  priceBox: {
    textAlign: 'right' as const,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    justifyContent: 'flex-end',
  },
  price: {
    fontSize: 40,
    fontWeight: 900,
    lineHeight: 1,
  },
  priceUnit: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: 700,
  },
  priceNote: {
    marginTop: 2,
    fontSize: 12,
    opacity: 0.6,
  },
  features: {
    margin: '12px 0 16px',
    padding: 0,
    listStyle: 'none',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 10,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '10px 12px',
    border: '1px solid rgba(0,0,0,.06)',
    borderRadius: 12,
    background: '#fafafa',
  },
  check: {
    display: 'inline-block',
    width: 22,
    height: 22,
    borderRadius: 999,
    background: '#16a34a',
    color: '#fff',
    fontWeight: 800,
    lineHeight: '22px',
    textAlign: 'center' as const,
    fontSize: 14,
    marginTop: 1,
  },
  ctaButton: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,.12)',
    background:
      'linear-gradient(180deg, #111, #0b0b0b)',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 16,
  },
  ctaButtonDisabled: {
    opacity: 0.75,
    cursor: 'progress',
  },
  help: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.7,
    textAlign: 'center' as const,
  },
  trustRow: {
    marginTop: 12,
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  trustPill: {
    padding: '6px 10px',
    borderRadius: 999,
    background: '#f6f6f6',
    border: '1px solid rgba(0,0,0,.06)',
    fontSize: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: 'rgba(0,0,0,.18)',
    alignSelf: 'center',
  },
  sideCard: {
    borderRadius: 16,
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,.08)',
    boxShadow: '0 8px 30px rgba(0,0,0,.05)',
    padding: 16,
    height: 'fit-content',
    position: 'sticky' as const,
    top: 18,
  },
  sideTitle: {
    margin: '2px 0 8px',
    fontSize: 16,
    fontWeight: 800,
  },
  details: {
    border: '1px solid rgba(0,0,0,.06)',
    borderRadius: 12,
    padding: '8px 12px',
    background: '#fafafa',
    marginBottom: 8,
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 700,
  },
  answer: {
    margin: '8px 0 0',
    opacity: 0.8,
  },
  /* responsive */
  '@media( max-width: 880px )': {} as any,
}

// simple responsive tweak via injected style tag (optional)
if (typeof document !== 'undefined') {
  const css = `
  @media (max-width: 880px) {
    main[data-upgrade] .wrap {
      display: block;
    }
    main[data-upgrade] .sideCard {
      position: static;
      margin-top: 12px;
    }
  }`
  const id = 'upgrade-inline-media'
  if (!document.getElementById(id)) {
    const el = document.createElement('style')
    el.id = id
    el.innerHTML = css
    document.head.appendChild(el)
  }
}
