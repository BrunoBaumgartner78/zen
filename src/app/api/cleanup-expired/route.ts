// src/app/api/cleanup-expired/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db/db'
import { gardens } from '@/db/schema-gardens'
import { and, eq, lt, sql } from 'drizzle-orm'

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

async function handle(req: Request) {
  const auth = isAuthorized(req)
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: 'Unauthorized', detail: auth.reason }, { status: 401 })
  }

  const url = new URL(req.url)
  const graceDays = Math.max(1, Number(url.searchParams.get('grace') ?? 30))
  const cap = Math.max(1, Math.min(1000, Number(url.searchParams.get('max') ?? 200)))
  const dryRun = url.searchParams.get('dry') === '1' ? true : false

  // cutoff: expiredAt < NOW() - graceDays
  const cutoffExpr = sql`now() - make_interval(days := ${graceDays})`

  // Kandidaten holen (IDs)
  const candidates = await db
    .select({ id: gardens.id })
    .from(gardens)
    .where(and(eq(gardens.isExpired, true), lt(gardens.expiredAt, cutoffExpr)))
    .limit(cap)

  let deleted = 0
  if (!dryRun && candidates.length) {
    const ids = candidates.map(c => c.id)
    await db.delete(gardens).where(sql`${gardens.id} = ANY(${ids})`)
    deleted = ids.length
  }

  return NextResponse.json({
    ok: true,
    graceDays,
    cap,
    dryRun,
    candidates: candidates.length,
    deleted,
  })
}

export async function GET(req: Request)  { return handle(req) }
export async function POST(req: Request) { return handle(req) }
