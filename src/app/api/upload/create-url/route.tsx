// src/app/api/upload/create-url/route.ts
import { NextResponse } from 'next/server'
import { generateUploadUrl } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export const runtime = 'nodejs'

// ==== Settings ====
// nur eingeloggte Nutzer dürfen Upload-URLs anfordern?
const REQUIRE_AUTH = true

// ==== Helpers ====
function need(name: string, v: string | undefined) {
  if (!v) throw new Error(`ENV fehlend: ${name}`)
  return v
}

function safeJson<T = any>(req: Request): Promise<T> {
  return req.json().catch(() => ({} as T))
}

export async function POST(req: Request) {
  try {
    // Lokal brauchst du das Blob-Token. Auf Vercel liefert die Integration es automatisch.
    // Wir erzwingen es *nur* lokal, damit der Fehler verständlich ist.
    if (process.env.VERCEL !== '1') {
      need('BLOB_READ_WRITE_TOKEN', process.env.BLOB_READ_WRITE_TOKEN)
    }

    if (REQUIRE_AUTH) {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Body lesen (optional)
    const body = await safeJson(req) as {
      folder?: string
      contentType?: string
      ext?: string
      filenameHint?: string
    }

    const folder = (body.folder || 'gardens').replace(/^\//, '').replace(/\/+$/,'')
    const contentType = body.contentType || 'image/png'

    // Dateiendung
    const ext =
      (body.ext?.replace(/^\./, '') ||
        contentType.split('/')[1] ||
        'bin').toLowerCase()

    // eindeutiger Key
    const ms = Date.now()
    const key = `${folder}/${ms}.${ext}`

    // Presigned Upload URL (public read)
    const { url, pathname } = await generateUploadUrl({
      pathname: key,
      contentType,
      access: 'public',
      // addRandomSuffix nicht nötig, Key ist schon unique
    })

    return NextResponse.json({
      ok: true,
      url,          // PUT-URL für den Upload
      pathname,     // endgültiger Blob-Pfad (für DB/Referenz)
      contentType,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[upload/create-url] ERROR:', message)
    const status = message.startsWith('ENV fehlend') ? 400 : 500
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: 'POST JSON { folder?, contentType?, ext? } → presigned PUT URL',
    example: { folder: 'gardens', contentType: 'image/png', ext: 'png' },
  })
}
