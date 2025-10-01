import { NextResponse } from 'next/server'
import { db } from '@/db/db'
import { gardens } from '@/db/schema-gardens'
import { eq, and } from 'drizzle-orm'

// Auth (wie gehabt)
function isAuthorized(req: Request) {
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

export const runtime = 'nodejs'

async function handle(req: Request) {
  const auth = isAuthorized(req)
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const cap   = Math.max(1, Math.min(500, Number(url.searchParams.get('max') ?? 100)))
  const dry   = url.searchParams.get('dry') === '1'
  const onlyPublic = url.searchParams.get('onlyPublic') !== '0' // default true

  // Kandidaten: sichtbare oder alle
  const rows = await db
    .select({
      id: gardens.id,
      coverUrl: gardens.coverUrl,
      isExpired: gardens.isExpired,
    })
    .from(gardens)
    .where(onlyPublic
      ? and(eq(gardens.isPublic, true), eq(gardens.isExpired, false))
      : eq(gardens.isExpired, false)
    )
    .limit(cap)

  let checked = 0
  let missing = 0
  const sampleMissing: { id: string; coverUrl: string }[] = []

  for (const g of rows) {
    checked++
    try {
      const res = await fetch(g.coverUrl, { method: 'HEAD', cache: 'no-store' })
      if (!res.ok) {
        missing++
        if (sampleMissing.length < 10) sampleMissing.push({ id: g.id, coverUrl: g.coverUrl })
        if (!dry) {
          await db
            .update(gardens)
            .set({ isExpired: true, expiredAt: new Date() })
            .where(eq(gardens.id, g.id))
        }
      }
    } catch {
      missing++
      if (sampleMissing.length < 10) sampleMissing.push({ id: g.id, coverUrl: g.coverUrl })
      if (!dry) {
        await db
          .update(gardens)
          .set({ isExpired: true, expiredAt: new Date() })
          .where(eq(gardens.id, g.id))
      }
    }
  }

  return NextResponse.json({
    ok: true,
    checked,
    missing,
    markedExpired: dry ? 0 : missing,
    dryRun: dry,
    sampleMissing,
  })
}

export async function GET(req: Request)  { return handle(req) }
export async function POST(req: Request) { return handle(req) }
