// src/app/api/gardens/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { z } from 'zod'
import { getIP, limit } from '@/lib/rateLimit'

import { db } from '@/db/db'
import { gardens } from '@/db/schema-gardens'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const gardenCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  coverUrl: z.string().url().max(2048),
  dataJson: z.any(),
  isPublic: z.boolean().optional().default(true),
})

export async function POST(req: Request) {
  const ip = getIP(req)
  if (!limit(`route:/api/gardens:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const raw = await req.json().catch(() => null)
    if (!raw) return NextResponse.json({ error: 'invalid json' }, { status: 400 })

    const parsed = gardenCreateSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_failed', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const body = parsed.data

    // leichte Härtung auf http/https
    try {
      const u = new URL(body.coverUrl)
      if (u.protocol !== 'https:' && u.protocol !== 'http:') {
        return NextResponse.json({ error: 'invalid cover protocol' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'invalid cover url' }, { status: 400 })
    }

    const id = crypto.randomUUID().slice(0, 40)

    await db.insert(gardens).values({
      id,
      userId,
      title: body.title,
      coverUrl: body.coverUrl,
      dataJson: body.dataJson,
      isPublic: body.isPublic ?? true,
    })

    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error('[api/gardens POST] error:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(gardens)
      .where(eq(gardens.isPublic, true))
      .orderBy(desc(gardens.createdAt))
      .limit(50)

    return NextResponse.json({ items: rows }, { status: 200 })
  } catch (err) {
    console.error('[api/gardens GET] error:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
