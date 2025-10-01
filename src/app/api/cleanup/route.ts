// src/app/api/cleanup/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db/db'
import { gardens } from '@/db/schema-gardens'
import { and, eq, lt, isNotNull, sql, inArray } from 'drizzle-orm'
import { list, del } from '@vercel/blob'

export const runtime = 'nodejs'

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

type Mode = 'ttl' | 'missing' | 'purgeExpired' | 'beforeDate'

async function handle(req: Request) {
  const auth = isAuthorized(req)
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: 'Unauthorized', detail: auth.reason }, { status: 401 })
  }

  const url = new URL(req.url)
  const mode = (url.searchParams.get('mode') as Mode) || 'ttl'
  const cap  = Math.max(1, Math.min(1000, Number(url.searchParams.get('max') ?? 200)))
  const dry  = url.searchParams.get('dry') === '1'
  const prefixesParam = url.searchParams.get('prefixes') || 'gardens/,cards/'
  const prefixes = prefixesParam.split(',').map(s => s.trim()).filter(Boolean)

  // Helper: Blob-Pfad aus einer vercel-Blob-URL extrahieren
  const pathFromBlobUrl = (u: string) => {
    try {
      const url = new URL(u)
      // https://<store>.public.blob.vercel-storage.com/<pathname>
      const idx = url.pathname.indexOf('/', 1)
      return idx >= 0 ? url.pathname.slice(idx + 1) : url.pathname.replace(/^\//, '')
    } catch { return '' }
  }

  if (mode === 'ttl') {
    const ttlDays = Math.max(1, Number(url.searchParams.get('ttl') ?? 60))
    const now = Date.now()
    const cutoff = now - ttlDays * 24 * 60 * 60 * 1000

    type Cand = { pathname: string; uploadedAt?: number; parsedTs?: number; prefix: string }
    const parseMillisFromPath = (pathname: string): number | undefined => {
      const m = pathname.match(/(\d{13})/)
      if (!m) return undefined
      const ts = Number(m[1])
      return Number.isFinite(ts) ? ts : undefined
    }

    const candidates: Cand[] = []
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

    const eligible = candidates.filter(c => (c.parsedTs ?? c.uploadedAt ?? 0) <= cutoff).slice(0, cap)

    let deleted = 0, dbMarked = 0, errors = 0
    const deletedSample: string[] = []

    if (!dry) {
      for (const c of eligible) {
        try {
          await del(c.pathname)
          deleted++
          if (deletedSample.length < 12) deletedSample.push(c.pathname)

          if (c.prefix.startsWith('gardens/')) {
            const likeSuffix = `%${c.pathname}`
            const res = await db.update(gardens)
              .set({ coverUrl: null as any })
              .where(sql`${gardens.coverUrl} LIKE ${likeSuffix}`)
              .returning({ id: gardens.id })
            dbMarked += res.length
          }
        } catch (e) {
          errors++
          console.error('[cleanup ttl] failed for', c.pathname, e)
        }
      }
    }

    return NextResponse.json({
      ok: true, mode, ttlDays, prefixes, cap, dry,
      checked: candidates.length,
      eligible: eligible.length,
      deleted, dbMarked, deletedSample,
      errors,
      cutoffISO: new Date(cutoff).toISOString(),
    })
  }

  if (mode === 'missing') {
    // Prüfe alle sichtbaren Gärten (mit coverUrl), lösche Rows bei 404/Fehler und lösche den Blob (falls vercel-Blob).
    const rows = await db.select({
      id: gardens.id,
      coverUrl: gardens.coverUrl,
    })
    .from(gardens)
    .where(isNotNull(gardens.coverUrl))
    .limit(cap)

    let checked = 0, missing = 0, deletedRows = 0, blobDeleted = 0
    const sample: { id: string; coverUrl: string }[] = []

    for (const g of rows) {
      checked++
      let ok = false
      try {
        const res = await fetch(g.coverUrl!, { method: 'HEAD', cache: 'no-store' })
        ok = res.ok
      } catch { ok = false }

      if (!ok) {
        missing++
        if (sample.length < 12) sample.push({ id: g.id, coverUrl: g.coverUrl! })
        if (!dry) {
          await db.delete(gardens).where(eq(gardens.id, g.id))
          deletedRows++
          if (g.coverUrl && g.coverUrl.includes('.public.blob.vercel-storage.com/')) {
            const p = pathFromBlobUrl(g.coverUrl)
            if (p) { await del(p); blobDeleted++ }
          }
        }
      }
    }

    return NextResponse.json({
      ok: true, mode, dry,
      checked, missing, deletedRows, blobDeleted,
      sample,
    })
  }

  if (mode === 'purgeExpired') {
    const graceDays = Math.max(1, Number(url.searchParams.get('grace') ?? 30))
    // Falls du `isExpired/expiredAt` nutzt – hier alle Kandidaten löschen, die abgelaufen sind
    // Wenn deine Tabelle die Felder nicht hat, bleibt das no-op.
    const cutoffExpr = sql`now() - make_interval(days := ${graceDays})`

    // Prüfen ob Spalten vorhanden sind (optional robust)
    // Hier gehen wir davon aus, dass sie existieren – sonst bitte ausbauen/überspringen.
    const candidates = await db
      .select({ id: gardens.id })
      .from(gardens)
      .where(and(sql`coalesce(${gardens['isExpired'] as any}, false) = true`, lt(sql`${gardens['expiredAt'] as any}`, cutoffExpr)))
      .limit(cap)

    let deleted = 0
    if (!dry && candidates.length) {
      const ids = candidates.map(c => c.id)
      await db.delete(gardens).where(inArray(gardens.id, ids))
      deleted = ids.length
    }

    return NextResponse.json({
      ok: true, mode, dry,
      graceDays,
      candidates: candidates.length,
      deleted,
    })
  }

  if (mode === 'beforeDate') {
    // ❗ Einmalig/gezielt: Alles vor einem Datum löschen
    // Query-Params:
    //   date=YYYY-MM-DD (oder ISO)
    //   deleteBlobs=1 (optional: zugehörige Blobs mitlöschen)
    const dateStr = url.searchParams.get('date') || ''
    const deleteBlobs = url.searchParams.get('deleteBlobs') === '1'

    let cutoff: Date | null = null
    try { if (dateStr) cutoff = new Date(dateStr) } catch {}
    if (!cutoff || isNaN(cutoff.getTime())) {
      return NextResponse.json({ ok: false, error: 'invalid date' }, { status: 400 })
    }

    // Kandidaten holen (nur public + coverUrl != null, damit wir ggf. Blob löschen können)
    const rows = await db.select({
      id: gardens.id,
      coverUrl: gardens.coverUrl,
      createdAt: gardens.createdAt,
    })
    .from(gardens)
    .where(and(eq(gardens.isPublic, true), lt(gardens.createdAt, cutoff), isNotNull(gardens.coverUrl)))
    .limit(cap)

    let deletedRows = 0, blobDeleted = 0
    const sample: { id: string; coverUrl: string | null; createdAt: string | null }[] =
      rows.slice(0, 12).map(r => ({
        id: r.id,
        coverUrl: r.coverUrl ?? null,
        createdAt: r.createdAt ? new Date(r.createdAt as any).toISOString() : null,
      }))

    if (!dry && rows.length) {
      if (deleteBlobs) {
        for (const r of rows) {
          if (r.coverUrl && r.coverUrl.includes('.public.blob.vercel-storage.com/')) {
            const p = pathFromBlobUrl(r.coverUrl)
            if (p) { try { await del(p); blobDeleted++ } catch (e) { console.error('[beforeDate] del blob fail', p, e) } }
          }
        }
      }
      const ids = rows.map(r => r.id)
      await db.delete(gardens).where(inArray(gardens.id, ids))
      deletedRows = ids.length
    }

    return NextResponse.json({
      ok: true, mode, dry,
      cutoffISO: cutoff.toISOString(),
      candidates: rows.length,
      deletedRows,
      ...(deleteBlobs ? { blobDeleted } : {}),
      sample,
    })
  }

  return NextResponse.json({ ok: false, error: `unknown mode: ${mode}` }, { status: 400 })
}

export async function GET(req: Request)  { return handle(req) }
export async function POST(req: Request) { return handle(req) }
