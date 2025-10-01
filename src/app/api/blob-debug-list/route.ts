// src/app/api/blob-debug-list/route.ts
import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const u = new URL(req.url)
  const prefix = u.searchParams.get('prefix') || undefined
  const limit = Math.max(1, Math.min(200, Number(u.searchParams.get('limit') ?? 50)))

  let cursor: string | undefined
  const out: Array<{ pathname: string; size: number; uploadedAt?: number }> = []
  do {
    const res = await list({ prefix, cursor })
    for (const b of res.blobs) {
      out.push({
        pathname: b.pathname,
        size: b.size,
        uploadedAt: (b as any).uploadedAt,
      })
      if (out.length >= limit) break
    }
    if (out.length >= limit) break
    cursor = res.cursor
  } while (cursor)

  return NextResponse.json({ ok: true, prefix: prefix ?? '(root)', sampleCount: out.length, sample: out })
}
