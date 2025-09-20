// src/app/api/upload/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { put } from '@vercel/blob'
import { getIP, limit } from '@/lib/rateLimit'

export const runtime = 'nodejs'

const ALLOWED_CT = new Set(['image/png', 'image/jpeg', 'image/webp'])

export async function POST(req: Request) {
  const ip = getIP(req)
  if (!limit(`route:/api/upload:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const ct = (searchParams.get('ct') || 'image/png').toLowerCase()
  if (!ALLOWED_CT.has(ct)) {
    return NextResponse.json({ error: 'unsupported_content_type' }, { status: 400 })
  }

  const ab = await req.arrayBuffer()
  const bytes = Buffer.from(ab)
  const filename = `gardens/${userId}/${Date.now()}` + (ct === 'image/png' ? '.png' : ct === 'image/webp' ? '.webp' : '.jpg')

  const blob = await put(filename, bytes, {
    access: 'public',
    contentType: ct,
    addRandomSuffix: true,
    cacheControl: 'public, max-age=31536000, immutable',
  })

  return NextResponse.json({ url: blob.url }, { status: 200 })
}
