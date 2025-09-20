// src/app/api/cleanup/route.ts
import { NextResponse } from 'next/server'
import { list, del } from '@vercel/blob'
import { db } from '@/db/db'
import { gardens } from '@/db/schema-gardens'
import { like, and, eq } from 'drizzle-orm'

export const runtime = 'nodejs'

// --- Auth: bevorzugt Authorization: Bearer <CRON_SECRET>, Fallback x-cron-secret / ?secret= ---
function isAuthorized(req: Request): { ok: boolean; reason?: string } {
  const url = new URL(req.url)
  const auth = req.headers.get('authorization') || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const headerSecret = req.headers.get('x-cron-secret')?.trim()
  const querySecret  = url.searchParams.get('secret')?.trim()
  const serverSecret = process.env.CRON_SECRET?.trim()
  if (!serverSecret) return { ok: false, reason: 'CRON_SECRET is not set' }
  if ([bearer, headerSecret, querySecret].includes(serverSecret)) return { ok: true }
  return { ok: false, reason: 'Invalid secret' }
}

// 13-stellige ms-Zeitstempel aus Pfadnamen ziehen
function parseMillisFromPath(pathname: string): number | undefined {
  const m = pathname.match(/(\d{13})/)
  if (!m) return undefined
  const ts = Number(m[1])
  return Number.isFinite(ts) ? ts : undefined
}

async function handle(req: Request) {
  const auth = isAuthorized(req)
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: 'Unauthorized', detail: auth.reason }, { status: 401 })
  }

  const url = new URL(req.url)
  const ttlDays = Math.max(1, Number(url.searchParams.get('ttl') ?? 5))
  // Mehrere Präfixe (gardens, cards)
  const prefixesParam = url.searchParams.get('prefixes') || 'gardens/,cards/'
  const prefixes = prefixesParam.split(',').map(s => s.trim()).filter(Boolean)

  const dryRun = url.searchParams.get('dry') === '1' ? true : false
  const cap    = Math.max(1, Math.min(500, Number(url.searchParams.get('max') ?? 100))) // Safety
  const now = Date.now()
  const cutoff = now - ttlDays * 24 * 60 * 60 * 1000

  type Cand = { pathname: string; uploadedAt?: number; parsedTs?: number; prefix: string }
  const candidates: Cand[] = []

  // Alle Prefixes listen
  for (const prefix of prefixes) {
    let cursor: string | undefined
    do {
      const res = await list({ cursor, prefix })
      for (const b of res.blobs) {
        candidates.push({
          pathname: b.pathname,
          uploadedAt: (b as any).uploadedAt as number | undefined,
          parsedTs: parseMillisFromPath(b.pathname),
          prefix,
        })
      }
      cursor = res.cursor
    } while (cursor)
  }

  // eligible bestimmen
  const eligible: Cand[] = []
  for (const c of candidates) {
    const ts = c.parsedTs ?? c.uploadedAt
    if (!ts) continue
    if (ts <= cutoff) eligible.push(c)
  }

  const toDelete = eligible.slice(0, cap)
  const capped = eligible.length > cap

  let deleted = 0
  let dbMarked = 0
  let errors = 0
  const deletedPathsSample: string[] = []

  if (!dryRun) {
    for (const c of toDelete) {
      try {
        // 1) Blob hart löschen
        await del(c.pathname)
        deleted++
        if (deletedPathsSample.length < 12) deletedPathsSample.push(c.pathname)

        // 2) DB: Cover referenzen aufräumen + expired markieren (nur, wenn es ein Garden ist)
        // Wir versuchen, Garden-Einträge zu finden, deren coverUrl auf den pathname endet.
        // Beispiel: …vercel.store/<random>/<pathname>
        if (c.prefix.startsWith('gardens/')) {
          const likeSuffix = `%${c.pathname}`
          const nowIso = new Date().toISOString()
          // nur Datensätze anfassen, die nicht schon expired sind (optional)
          const res = await db.update(gardens)
            .set({ coverUrl: null, isExpired: true, expiredAt: new Date(nowIso) })
            .where(like(gardens.coverUrl, likeSuffix))
            .returning({ id: gardens.id })
          dbMarked += res.length
        }

        // Karten (cards/) haben idR. keinen DB-Eintrag → nichts weiter zu tun
      } catch (e) {
        errors++
        // eslint-disable-next-line no-console
        console.error('[cleanup] failed for', c.pathname, e)
      }
    }
  }

  const sample = candidates.slice(0, 5).map(c => ({
    pathname: c.pathname,
    prefix: c.prefix,
    parsedTs: c.parsedTs ? new Date(c.parsedTs).toISOString() : null,
    uploadedAt: c.uploadedAt ? new Date(c.uploadedAt).toISOString() : null,
  }))

  return NextResponse.json({
    ok: true,
    ttlDays,
    prefixes,
    dryRun,
    cap,
    capped,
    cutoffISO: new Date(cutoff).toISOString(),
    checked: candidates.length,
    toDelete: toDelete.length,
    deleted,
    dbMarked, // wie viele Garden-Rows auf expired gesetzt wurden
    errors,
    sample,
    deletedPathsSample,
  })
}

export async function GET(req: Request)  { return handle(req) }
export async function POST(req: Request) { return handle(req) }
