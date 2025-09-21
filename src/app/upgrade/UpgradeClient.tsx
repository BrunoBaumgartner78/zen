// src/app/upgrade/UpgradeClient.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

export default function UpgradeClient() {
  const sp = useSearchParams()
  const plan = useMemo(() => sp.get('plan') ?? 'premium', [sp])
  const [submitting, setSubmitting] = useState(false)

  const onSubmit: React.FormEventHandler<HTMLFormElement> = () => {
    setSubmitting(true) // verhindert Doppel-Klicks
  }

  return (
    <main style={styles.main} data-upgrade>
      {/* Hero */}
      <section style={styles.hero} data-hero>
        <div style={styles.heroInner}>
          <span style={styles.badge}>Neu</span>
          <h1 style={styles.h1}>Werde Premium</h1>
          <p style={styles.subtitle}>
            Unbegrenzte Gärten, schnellere Verarbeitung und priorisierter Support – alles im{' '}
            <strong>Plan „{capitalize(plan)}“</strong>.
          </p>
        </div>
        <div style={styles.heroGlow} aria-hidden />
      </section>

      {/* Pricing + FAQ */}
      <section style={styles.wrap} className="wrap" data-wrap>
        <article style={styles.card} className="card" data-card>
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
                <span style={styles.featureText}>{f}</span>
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
            Bezahlt wird sicher über <strong>Stripe</strong>. Du wirst nach dem Klick weitergeleitet.
          </p>

          <div style={styles.trustRow} aria-hidden>
            <div style={styles.trustPill}>Sichere Zahlung</div>
            <div style={styles.dot} />
            <div style={styles.trustPill}>Keine versteckten Gebühren</div>
            <div style={styles.dot} />
            <div style={styles.trustPill}>Jederzeit Kontakt</div>
          </div>
        </article>

        <aside style={styles.sideCard} className="sideCard" data-side>
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

      {/* Responsive Tweaks */}
      <style>{responsiveCss}</style>
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

  // HERO (dunkel, hochwertig)
  hero: {
    position: 'relative',
    borderRadius: 22,
    padding: '56px 20px',
    background:
      'radial-gradient(1200px 420px at 50% -220px, rgba(99,102,241,0.22), rgba(16,16,16,0)),' +
      'linear-gradient(180deg, #0f172a, #111827)',
    color: '#fff',
    overflow: 'hidden',
    boxShadow: '0 28px 80px rgba(0,0,0,.45)',
  },
  heroInner: {
    maxWidth: 860,
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  heroGlow: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(520px 170px at 50% 0%, rgba(255,255,255,0.09), rgba(255,255,255,0))',
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
    fontSize: 44,
    lineHeight: 1.08,
    fontWeight: 800,
  },
  subtitle: {
    margin: 0,
    opacity: 0.9,
    fontSize: 16,
  },

  // GRID
  wrap: {
    display: 'grid',
    gridTemplateColumns: '1.35fr .85fr',
    gap: 18,
    marginTop: 22,
  },

  // CARD (hell, lesbar)
  card: {
    borderRadius: 18,
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(0,0,0,.06)',
    boxShadow: '0 18px 60px rgba(2,6,23,.08)',
    padding: 18,
    color: '#0f172a', // FIX: klare Textfarbe, nicht mehr weiß auf weiß
    backdropFilter: 'blur(6px)',
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
    color: '#0b1220',
  },
  planSubtitle: {
    margin: '4px 0 0',
    opacity: 0.75,
    fontSize: 14,
    color: '#3f4756',
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
    color: '#0b1220',
  },
  priceUnit: {
    fontSize: 14,
    opacity: 0.75,
    fontWeight: 700,
    color: '#475069',
  },
  priceNote: {
    marginTop: 2,
    fontSize: 12,
    opacity: 0.65,
    color: '#6b7280',
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
  featureText: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 1.35,
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
    boxShadow: '0 6px 16px rgba(22,163,74,.35)',
  },

  ctaButton: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,.12)',
    background: 'linear-gradient(180deg, #111, #0b0b0b)',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 16,
    boxShadow: '0 12px 34px rgba(2,6,23,.3)',
    transition: 'transform .12s ease, box-shadow .2s ease',
  },
  ctaButtonDisabled: {
    opacity: 0.78,
    cursor: 'progress',
  },
  help: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.75,
    textAlign: 'center' as const,
    color: '#4b5563',
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
    color: '#222',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: 'rgba(0,0,0,.18)',
    alignSelf: 'center',
  },

  // SIDE CARD
  sideCard: {
    borderRadius: 18,
    background: 'rgba(255,255,255,0.96)',
    border: '1px solid rgba(0,0,0,.06)',
    boxShadow: '0 16px 48px rgba(2,6,23,.08)',
    padding: 16,
    height: 'fit-content',
    position: 'sticky' as const,
    top: 18,
    color: '#0f172a',
    backdropFilter: 'blur(6px)',
  },
  sideTitle: {
    margin: '2px 0 8px',
    fontSize: 16,
    fontWeight: 800,
    color: '#0b1220',
  },
  details: {
    border: '1px solid rgba(0,0,0,.08)',
    borderRadius: 12,
    padding: '8px 12px',
    background: '#fafafa',
    marginBottom: 8,
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 700,
    color: '#0b1220',
  },
  answer: {
    margin: '8px 0 0',
    opacity: 0.9,
    color: '#374151',
  },
}

/* -------------------- Responsive CSS -------------------- */
const responsiveCss = `
/* bis 980px: 2 Spalten -> 1 Spalte, Typo sanft kleiner */
@media (max-width: 980px) {
  [data-upgrade] [data-hero] {
    padding: 40px 16px;
    border-radius: 18px;
  }
  [data-upgrade] h1 {
    font-size: 36px !important;
  }
  [data-upgrade] [data-wrap].wrap {
    display: block !important;
  }
  [data-upgrade] .sideCard {
    position: static !important;
    margin-top: 14px !important;
  }
  [data-upgrade] [data-card] {
    padding: 16px !important;
  }
}

/* bis 720px: engere Abstände & Buttons größer */
@media (max-width: 720px) {
  [data-upgrade] {
    padding: 0 12px !important;
  }
  [data-upgrade] [data-hero] {
    padding: 30px 14px !important;
  }
  [data-upgrade] h1 {
    font-size: 30px !important;
    line-height: 1.15 !important;
  }
  [data-upgrade] [data-card] .features {
    grid-template-columns: 1fr !important;
  }
  [data-upgrade] button[type="submit"] {
    padding: 14px 18px !important;
    font-size: 17px !important;
    border-radius: 14px !important;
  }
}

/* bis 520px: Preise/Abstände kompakter */
@media (max-width: 520px) {
  [data-upgrade] [data-card] .price {
    font-size: 34px !important;
  }
  [data-upgrade] [data-card] .priceUnit {
    font-size: 13px !important;
  }
  [data-upgrade] [data-card] .priceNote {
    font-size: 11px !important;
  }
  [data-upgrade] [data-card] .planTitle {
    font-size: 20px !important;
  }
  [data-upgrade] [data-card] .planSubtitle {
    font-size: 13px !important;
  }
}
`
