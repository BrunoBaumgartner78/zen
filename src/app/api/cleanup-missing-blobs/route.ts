// src/app/api/cleanup-missing-blobs/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db/db'
import { gardens } from '@/db/schema-gardens'
import { eq } from 'drizzle-orm'
import { del } from '@vercel/blob'
import { sql } from 'drizzle-orm'

// Autorisierung (gleich wie bei cleanup-expired)
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

async function handle(req: Request) {
  const auth = isAuthorized(req)
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const cap = Math.max(1, Math.min(500, Number(url.searchParams.get('max') ?? 100)))
  const dryRun = url.searchParams.get('dry') === '1'

  // Kandidaten: alle gardens mit coverUrl
  const rows = await db.select({
    id: gardens.id,
    coverUrl: gardens.coverUrl,
  }).from(gardens).limit(cap)

  let checked = 0
  let missing: { id: string; coverUrl: string }[] = []
  let deleted = 0

  for (const g of rows) {
    checked++
    try {
      const res = await fetch(g.coverUrl, { method: 'HEAD' })
      if (!res.ok) {
        missing.push({ id: g.id, coverUrl: g.coverUrl })
        if (!dryRun) {
          // Garden-Eintrag löschen
          await db.delete(gardens).where(eq(gardens.id, g.id))
          // Blob löschen (falls URL auf Vercel Blob zeigt)
          if (g.coverUrl.includes('.public.blob.vercel-storage.com/')) {
            await del(g.coverUrl)
          }
          deleted++
        }
      }
    } catch {
      missing.push({ id: g.id, coverUrl: g.coverUrl })
    }
  }

  return NextResponse.json({
    ok: true,
    checked,
    missing: missing.length,
    deleted,
    dryRun,
    sample: missing.slice(0, 5), // kleine Vorschau
  })
}

export async function GET(req: Request)  { return handle(req) }
export async function POST(req: Request) { return handle(req) }
