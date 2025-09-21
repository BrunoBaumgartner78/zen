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
    <main className="mx-auto my-10 max-w-[1100px] px-4 md:px-6 lg:px-8">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-white"
        style={{
          background:
            'radial-gradient(1200px 400px at 50% -200px, rgba(99,102,241,0.18), rgba(16,16,16,0)), linear-gradient(180deg, #0f172a, #111827)',
        }}
      >
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="mb-2 inline-block rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs tracking-wide">
            Neu
          </span>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            Werde Premium
          </h1>
          <p className="mt-2 text-sm text-white/85 sm:text-base">
            Unbegrenzte Gärten, schnellere Verarbeitung und priorisierter Support – alles im{' '}
            <strong>Plan „{capitalize(plan)}“</strong>.
          </p>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(500px 160px at 50% 0%, rgba(255,255,255,0.08), transparent)',
          }}
        />
      </section>

      {/* Pricing + FAQ */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_.8fr]">
        {/* Pricing Card */}
        <article className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:p-5 text-black">
          <header className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-xl font-extrabold tracking-tight md:text-2xl">Premium</h2>
              <p className="mt-1 text-sm text-black/70">Alles was du brauchst – ohne Limits</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="leading-none text-3xl font-black md:text-4xl">10</span>
                <span className="text-xs font-bold text-black/70 md:text-sm">CHF</span>
              </div>
              <div className="mt-0.5 text-[11px] text-black/60 md:text-xs">einmaliger Beitrag</div>
            </div>
          </header>

          <ul className="mb-4 mt-3 grid list-none gap-2 p-0 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {[
              'Unbegrenzte privaten & öffentlichen Gärten',
              'Schnellere Renderzeiten',
              'Höhere Upload-Limits',
              'Premium-Badges für dein Profil',
              'Priorisierter E-Mail-Support',
            ].map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 rounded-lg border border-black/10 bg-zinc-50 p-3"
              >
                <span className="mt-0.5 inline-grid h-5 w-5 place-content-center rounded-full bg-green-600 text-[13px] font-extrabold text-white">
                  ✓
                </span>
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <form action="/api/stripe/checkout" method="post" onSubmit={onSubmit}>
            <button
              type="submit"
              disabled={submitting}
              className={[
                'w-full rounded-xl border border-black/10 bg-black px-4 py-3 text-base font-extrabold text-white',
                'transition active:scale-[0.995] disabled:cursor-progress disabled:opacity-75',
              ].join(' ')}
            >
              {submitting ? 'Weiter zu Stripe …' : 'Jetzt upgraden'}
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-black/70 md:text-sm">
            Bezahlt wird sicher über <strong>Stripe</strong>. Du wirst nach dem Klick weitergeleitet.
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2" aria-hidden>
            <div className="rounded-full border border-black/10 bg-zinc-100 px-3 py-1 text-[11px] md:text-xs">
              Sichere Zahlung
            </div>
            <div className="h-1 w-1 self-center rounded-full bg-black/20" />
            <div className="rounded-full border border-black/10 bg-zinc-100 px-3 py-1 text-[11px] md:text-xs">
              Keine versteckten Gebühren
            </div>
            <div className="h-1 w-1 self-center rounded-full bg-black/20" />
            <div className="rounded-full border border-black/10 bg-zinc-100 px-3 py-1 text-[11px] md:text-xs">
              Jederzeit Kontakt
            </div>
          </div>
        </article>

        {/* FAQ */}
        <aside className="h-fit rounded-xl border border-black/10 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] lg:sticky lg:top-4 text-black">
          <h3 className="mb-2 text-lg font-extrabold">Häufige Fragen</h3>

          <details className="mb-2 rounded-lg border border-black/10 bg-zinc-50 p-3">
            <summary className="cursor-pointer font-bold">Brauche ich ein Konto?</summary>
            <p className="mt-2 text-sm text-black/80">
              Ja – bitte melde dich an. Der Zugang wird mit deinem Benutzerkonto verknüpft.
            </p>
          </details>

          <details className="mb-2 rounded-lg border border-black/10 bg-zinc-50 p-3">
            <summary className="cursor-pointer font-bold">Was passiert nach dem Kauf?</summary>
            <p className="mt-2 text-sm text-black/80">
              Du wirst zurückgeleitet und dein Konto sofort auf Premium umgestellt.
            </p>
          </details>

          <details className="rounded-lg border border-black/10 bg-zinc-50 p-3">
            <summary className="cursor-pointer font-bold">Wie erhalte ich Support?</summary>
            <p className="mt-2 text-sm text-black/80">
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
