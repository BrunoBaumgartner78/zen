// src/app/api/gardens/sweep-missing/route.ts
import { NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db/db'
import { gardens } from '@/db/schema-gardens'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function head(url: string, timeoutMs = 6000): Promise<number> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store', signal: ctrl.signal })
    return res.status
  } finally {
    clearTimeout(t)
  }
}

export async function POST(req: Request) {
  try {
    const { limit = 200 } = await req.json().catch(() => ({}))
    const rows = await db
      .select({
        id: gardens.id,
        coverUrl: gardens.coverUrl,
      })
      .from(gardens)
      .where(and(eq(gardens.isPublic, true), eq(gardens.isExpired, false)))
      .orderBy(desc(gardens.createdAt))
      .limit(Math.min(1000, Math.max(1, Number(limit))))

    const results: Array<{ id: string; status: number }> = []

    // Parallel aber moderat
    const BATCH = 20
    for (let i = 0; i < rows.length; i += BATCH) {
      const slice = rows.slice(i, i + BATCH)
      const checked = await Promise.all(
        slice.map(async (r) => {
          const status = await head(r.coverUrl).catch(() => 0)
          return { id: r.id, status }
        })
      )
      results.push(...checked)
    }

    const expiredIds = results
      .filter((r) => r.status === 404 || r.status === 410 || r.status === 0)
      .map((r) => r.id)

    if (expiredIds.length) {
      // Batchweise updaten
      const chunks: string[][] = []
      for (let i = 0; i < expiredIds.length; i += 100) {
        chunks.push(expiredIds.slice(i, i + 100))
      }
      for (const chunk of chunks) {
        // Drizzle hat kein IN(...)=ANY direkt im eq – daher mehrere Updates nacheinander:
        for (const id of chunk) {
          await db
            .update(gardens)
            .set({ isExpired: true, expiredAt: new Date() })
            .where(eq(gardens.id, id))
        }
      }
    }

    return NextResponse.json({
      checked: rows.length,
      expiredMarked: expiredIds.length,
    })
  } catch (e) {
    console.error('[sweep-missing] error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: 'POST { "limit": 200 } prüft die letzten N öffentlichen Einträge und markiert fehlende coverUrl als isExpired.',
  })
}
