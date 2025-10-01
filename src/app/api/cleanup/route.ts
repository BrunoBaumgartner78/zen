// src/app/api/cleanup/route.ts
import { NextResponse } from 'next/server'
import { list, del } from '@vercel/blob'
import { db } from '@/db/db'
import { gardens } from '@/db/schema-gardens'
import { and, count, desc, eq, inArray, like, lt, sql } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * -----------------------------
 *    🔐 AUTH (CRON_SECRET)
 * -----------------------------
 */
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

/**
 * -----------------------------------------
 *   🗂 Mehrere Stores (aktuell + „alte“)
 *   - aktueller: BLOB_READ_WRITE_TOKEN
 *   - optionale alte: OLD_BLOB_TOKENS = t1,t2,...
 * -----------------------------------------
 */
type Store = { name: string; token: string }

function getStores(): Store[] {
  const stores: Store[] = []
  const currToken = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (currToken) stores.push({ name: process.env.BLOB_STORE_ID || 'current', token: currToken })

  const old = (process.env.OLD_BLOB_TOKENS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  old.forEach((tok, i) => stores.push({ name: `old-${i + 1}`, token: tok }))
  return stores
}

/**
 * 13-stelligen ms-Zeitstempel aus einem Pfad extrahieren (falls im Dateinamen enthalten)
 */
function parseMillisFromPath(pathname: string): number | undefined {
  const m = pathname.match(/(\d{13})/)
  if (!m) return undefined
  const ts = Number(m[1])
  return Number.isFinite(ts) ? ts : undefined
}

/**
 * Aus einer Vercel-Blob-URL das pathname extrahieren:
 * https://<sub>.public.blob.vercel-storage.com/<pathname>
 */
function tryExtractPathnameFromBlobUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // nur Vercel Blob Host?
    if (!/\.public\.blob\.vercel-storage\.com$/.test(u.hostname)) return null
    // URL.pathname beginnt mit '/', wir wollen ohne leading slash
    return u.pathname.replace(/^\/+/, '')
  } catch {
    return null
  }
}

/**
 * HEAD-Check ob Bild erreichbar
 */
async function headOk(url: string | null | undefined): Promise<boolean> {
  if (!url) return false
  try {
    const r = await fetch(url, { method: 'HEAD', cache: 'no-store' })
    return r.ok
  } catch {
    return false
  }
}

/**
 * Blobs über alle Stores auflisten
 */
async function listAcrossStores(prefix: string) {
  const stores = getStores()
  const out: { store: string; pathname: string; uploadedAt?: number }[] = []

  for (const s of stores) {
    let cursor: string | undefined
    do {
      const res = await list({ cursor, prefix, token: s.token })
      for (const b of res.blobs) {
        out.push({
          store: s.name,
          pathname: b.pathname,
          uploadedAt: (b as any).uploadedAt as number | undefined,
        })
      }
      cursor = res.cursor
    } while (cursor)
  }
  return out
}

/**
 * Pfad in einem der Stores löschen (wir versuchen alle)
 */
async function delAcrossStores(pathname: string): Promise<string> {
  const stores = getStores()
  for (const s of stores) {
    try {
      await del(pathname, { token: s.token })
      return s.name
    } catch {
      // weiter probieren
    }
  }
  throw new Error(`del failed for ${pathname} in all stores`)
}

/**
 * -----------------------------
 *      🧹 MODES (handler)
 * -----------------------------
 *
 * mode=ttl           → Blobs älter als ttlDays löschen + DB markieren
 * mode=missing       → DB rows prüfen; wenn Cover fehlt → Row löschen (+Blob versuchen)
 * mode=purgeExpired  → isExpired=true & expiredAt < now() - graceDays endgültig löschen
 *
 * Query:
 *  - dry=1
 *  - max=200 (Cap)
 *  - prefixes=gardens/,cards/        (für mode=ttl)
 *  - ttl=60                          (Tage, für mode=ttl)
 *  - grace=30                        (Tage, für mode=purgeExpired)
 */

async function handleTTL(req: Request, dry: boolean) {
  const url = new URL(req.url)
  const ttlDays = Math.max(1, Number(url.searchParams.get('ttl') ?? 60))
  const cap     = Math.max(1, Math.min(1000, Number(url.searchParams.get('max') ?? 200)))
  const prefixesParam = url.searchParams.get('prefixes') || 'gardens/,cards/'
  const prefixes = prefixesParam.split(',').map(s => s.trim()).filter(Boolean)

  const now = Date.now()
  const cutoff = now - ttlDays * 24 * 60 * 60 * 1000

  type Cand = { store: string; pathname: string; uploadedAt?: number; parsedTs?: number }
  const candidates: Cand[] = []

  for (const prefix of prefixes) {
    const blobs = await listAcrossStores(prefix)
    for (const b of blobs) {
      candidates.push({
        store: b.store,
        pathname: b.pathname,
        uploadedAt: b.uploadedAt,
        parsedTs: parseMillisFromPath(b.pathname),
      })
    }
  }

  // eligible
  const eligible = candidates.filter(c => {
    const ts = c.parsedTs ?? c.uploadedAt
    return ts && ts <= cutoff
  })

  const toDelete = eligible.slice(0, cap)
  let deleted = 0
  let dbMarked = 0
  const deletedSample: string[] = []
  let errors = 0

  if (!dry) {
    for (const c of toDelete) {
      try {
        await delAcrossStores(c.pathname)
        deleted++
        if (deletedSample.length < 12) deletedSample.push(c.pathname)

        // DB: coverUrl-Referenzen leeren & als expired markieren
        const likeSuffix = `%${c.pathname}`
        const res = await db.update(gardens)
          .set({ coverUrl: null, isExpired: true, expiredAt: new Date() })
          .where(like(gardens.coverUrl, likeSuffix))
          .returning({ id: gardens.id })
        dbMarked += res.length
      } catch (e) {
        errors++
        // eslint-disable-next-line no-console
        console.error('[cleanup ttl] fail', c.pathname, e)
      }
    }
  }

  return {
    ok: true,
    mode: 'ttl',
    ttlDays,
    prefixes,
    cap,
    dry,
    checked: candidates.length,
    eligible: eligible.length,
    deleted,
    dbMarked,
    deletedSample,
    errors,
    cutoffISO: new Date(cutoff).toISOString(),
  }
}

async function handleMissing(req: Request, dry: boolean) {
  const url = new URL(req.url)
  const cap = Math.max(1, Math.min(1000, Number(url.searchParams.get('max') ?? 200)))

  // Kandidaten: neueste cap Rows mit coverUrl
  const rows = await db
    .select({ id: gardens.id, coverUrl: gardens.coverUrl })
    .from(gardens)
    .where(sql`${gardens.coverUrl} IS NOT NULL`)
    .orderBy(desc(gardens.createdAt))
    .limit(cap)

  let checked = 0
  let missing: { id: string; coverUrl: string }[] = []
  let deleted = 0
  let cleared = 0
  let blobDeleted = 0

  for (const g of rows) {
    checked++
    const ok = await headOk(g.coverUrl)
    if (ok) continue

    missing.push({ id: g.id, coverUrl: g.coverUrl! })

    if (!dry) {
      // Row löschen (oder alternativ: coverUrl null + isExpired setzen)
      await db.delete(gardens).where(eq(gardens.id, g.id))
      deleted++

      // Versuche Blob zu löschen, falls Vercel-Blob-URL
      const pathname = tryExtractPathnameFromBlobUrl(g.coverUrl!)
      if (pathname) {
        try {
          await delAcrossStores(pathname)
          blobDeleted++
        } catch {
          // ignore
        }
      }
    } else {
      // Im Dry-Run wenigstens markieren, dass wir’s könnten
      // (nur für Reporting; DB bleibt unberührt)
      cleared++
    }
  }

  return {
    ok: true,
    mode: 'missing',
    dry,
    checked,
    missing: missing.length,
    deletedRows: deleted,
    blobDeleted,
    sample: missing.slice(0, 10),
  }
}

async function handlePurgeExpired(req: Request, dry: boolean) {
  const url = new URL(req.url)
  const cap = Math.max(1, Math.min(2000, Number(url.searchParams.get('max') ?? 500)))
  const graceDays = Math.max(1, Number(url.searchParams.get('grace') ?? 30))

  // expiredAt < now() - graceDays
  const cutoffExpr = sql`now() - make_interval(days := ${graceDays})`

  const candidates = await db
    .select({ id: gardens.id })
    .from(gardens)
    .where(and(eq(gardens.isExpired, true), lt(gardens.expiredAt, cutoffExpr)))
    .limit(cap)

  let deleted = 0
  if (!dry && candidates.length) {
    await db.delete(gardens).where(inArray(gardens.id, candidates.map(c => c.id)))
    deleted = candidates.length
  }

  return {
    ok: true,
    mode: 'purgeExpired',
    dry,
    graceDays,
    candidates: candidates.length,
    ...(dry ? { sampleIds: candidates.slice(0, 20).map(c => c.id) } : {}),
    deleted,
  }
}

/**
 * -----------------------------
 *           ROUTES
 * -----------------------------
 * GET/POST /api/cleanup?mode=ttl|missing|purgeExpired&dry=1&ttl=60&prefixes=gardens/,cards/&max=200&grace=30
 */
async function handle(req: Request) {
  const t0 = Date.now()
  const auth = isAuthorized(req)
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: 'Unauthorized', detail: auth.reason }, { status: 401 })
  }

  const url = new URL(req.url)
  const mode = (url.searchParams.get('mode') || 'ttl').toLowerCase()
  const dry  = url.searchParams.get('dry') === '1'

  try {
    if (mode === 'missing') {
      const res = await handleMissing(req, dry)
      return NextResponse.json({ ...res, ms: Date.now() - t0 })
    }
    if (mode === 'purgeexpired' || mode === 'purge_expired') {
      const res = await handlePurgeExpired(req, dry)
      return NextResponse.json({ ...res, ms: Date.now() - t0 })
    }
    // default: ttl
    const res = await handleTTL(req, dry)
    return NextResponse.json({ ...res, ms: Date.now() - t0 })
  } catch (err) {
    console.error('[cleanup] ERROR', err)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}

export async function GET(req: Request)  { return handle(req) }
export async function POST(req: Request) { return handle(req) }
