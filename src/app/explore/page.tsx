// src/app/explore/page.tsx
import Link from 'next/link'
import { db } from '@/db/db'
import { gardens } from '@/db/schema-gardens'
import { desc, eq, and, isNotNull, count } from 'drizzle-orm'

const PAGE_SIZE = 12
export const dynamic = 'force-dynamic'

// Bild wirklich erreichbar?
async function coverOk(url: string | null | undefined): Promise<boolean> {
  if (!url) return false
  try {
    // Minimaler GET (1 Byte), kein Cache, und prüfe Content-Type = image/*
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      cache: 'no-store',
      // Timeout-Guard (optional, Next 15 unterstützt AbortController)
      // signal: AbortSignal.timeout?.(3000) as any,
    })
    if (!res.ok) return false
    const ct = res.headers.get('content-type') || ''
    return ct.startsWith('image/')
  } catch {
    return false
  }
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page
  const pageNum = Number(rawPage)
  const page = Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1

  // Zähle nur Einträge mit (vermutlich) gültigem Cover:
  //   - isPublic = true
  //   - coverUrl IS NOT NULL
  //   - optional: isExpired = false (falls du das Feld hast)
  const [{ c }] = await db
    .select({ c: count() })
    .from(gardens)
    .where(and(eq(gardens.isPublic, true), isNotNull(gardens.coverUrl)))

  const total = Number(c ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const offset = (safePage - 1) * PAGE_SIZE

  // Rohdaten (nur mit coverUrl!=NULL) holen
  const rawItems = await db
    .select({
      id: gardens.id,
      title: gardens.title,
      coverUrl: gardens.coverUrl,
      createdAt: gardens.createdAt,
    })
    .from(gardens)
    .where(and(eq(gardens.isPublic, true), isNotNull(gardens.coverUrl)))
    .orderBy(desc(gardens.createdAt))
    .limit(PAGE_SIZE * 3)   // etwas mehr holen, um nach Filterung noch 12 zu haben
    .offset(offset)

  // Filtere, falls das Bild trotz coverUrl fehlt/404 ist
  const checks = await Promise.all(
    rawItems.map(async (g) => ({ g, ok: await coverOk(g.coverUrl) }))
  )
  const items = checks.filter(x => x.ok).slice(0, PAGE_SIZE).map(x => x.g)

  return (
    <main style={{ maxWidth: 1200, margin: '40px auto', padding: '0 16px' }}>
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Explore</h1>
        <span style={{ opacity: 0.7 }}>
          {total} öffentliche Gärten · Seite {safePage} / {totalPages}
        </span>
        <Link
          href="/"
          style={{
            marginLeft: 'auto',
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,.12)',
            background: '#fff',
            color: '#111',
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          ⌂ Home
        </Link>
      </header>

      {items.length === 0 ? (
        <p style={{ marginTop: 20 }}>Keine Einträge mit gültigem Cover vorhanden.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
            gap: 16,
            marginTop: 20,
          }}
        >
          {items.map((g) => (
            <Link
              key={g.id}
              href={`/g/${g.id}`}
              style={{
                display: 'block',
                border: '1px solid rgba(0,0,0,.08)',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#fff',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '4 / 3',
                  background: '#eee',
                  overflow: 'hidden',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.coverUrl!}
                  alt={g.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ padding: 10 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={g.title}
                >
                  {g.title}
                </div>
                {g.createdAt ? (
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                    {new Date(g.createdAt as any).toLocaleDateString()}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}

      <nav style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
        <PageLink label="« Zurück" page={Math.max(1, safePage - 1)} disabled={safePage <= 1} />
        <span style={{ padding: '6px 10px' }}>
          Seite {safePage} / {totalPages}
        </span>
        <PageLink
          label="Weiter »"
          page={Math.min(totalPages, safePage + 1)}
          disabled={safePage >= totalPages}
        />
      </nav>
    </main>
  )
}

function PageLink({ label, page, disabled }: { label: string; page: number; disabled?: boolean }) {
  const style: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,.12)',
    background: disabled ? '#f5f5f5' : '#fff',
    color: disabled ? '#999' : '#111',
    pointerEvents: disabled ? 'none' : 'auto',
    textDecoration: 'none',
    fontSize: 14,
  }
  return (
    <Link href={`/explore?page=${page}`} style={style} aria-disabled={disabled}>
      {label}
    </Link>
  )
}
