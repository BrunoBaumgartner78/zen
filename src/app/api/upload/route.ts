// src/app/api/upload/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'

// ggf. nur authentifizierten Nutzern erlauben
const REQUIRE_AUTH = true

// DEV-Hinweis: lokal braucht man das Token, auf Vercel liefert die Integration es automatisch.
function need(name: string, v: string | undefined) {
  if (!v) throw new Error(`ENV fehlend: ${name}`)
  return v
}

export async function POST(req: Request) {
  try {
    if (process.env.VERCEL !== '1') {
      need('BLOB_READ_WRITE_TOKEN', process.env.BLOB_READ_WRITE_TOKEN)
    }

    if (REQUIRE_AUTH) {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
    }

    const url = new URL(req.url)
    const ct = url.searchParams.get('ct') || 'image/png'

    const ab = await req.arrayBuffer()
    if (!ab.byteLength) {
      return new NextResponse('Missing body', { status: 400 })
    }

    const userId = 'user' // optional: aus Session lesen, z.B. (session.user as any)?.id ?? 'anon'
    const key = `gardens/${userId}-${Date.now()}.png`

    const uploaded = await put(key, Buffer.from(ab), {
      access: 'public',
      contentType: ct,
      token: process.env.BLOB_READ_WRITE_TOKEN, // lokal nötig, auf Vercel optional
      addRandomSuffix: true,
    })

    return NextResponse.json({
      ok: true,
      url: uploaded.url,     // öffentliche URL
      pathname: uploaded.pathname,
      contentType: ct,
    })
  } catch (e) {
    console.error('[api/upload] ERROR:', e)
    const msg = e instanceof Error ? e.message : String(e)
    const status = msg.startsWith('ENV fehlend') ? 400 : 500
    return NextResponse.json({ ok: false, error: msg }, { status })
  }
}
