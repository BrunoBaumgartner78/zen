// src/app/api/upload/create-url/route.ts
import { NextResponse } from 'next/server'
import { generateUploadUrl } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export const runtime = 'nodejs'

// === Settings ===
// Falls du nur eingeloggten Usern Upload erlauben willst -> true
const REQUIRE_AUTH = true

// kleine Helper
function need(name: string, v: string | undefined) {
  if (!v) throw new Error(`ENV fehlend: ${name}`)
  return v
}

export async function POST(req: Request) {
  try {
    // Lokal brauchst du das Token, auf Vercel nicht zwingend – aber wir prüfen,
    // und geben eine verständliche 400 zurück statt 500:
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
    const body = await req.json().catch(() => ({} as any))
    const folder      = (body?.folder as string) || 'gardens'
    const contentType = (body?.contentType as string) || 'image/png'
    const ext         = (body?.ext as string) || (contentType.split('/')[1] ?? 'bin')

    // Dateiname bauen
    const ms  = Date.now()
    const key = `${folder}/${ms}.${ext.replace(/^\./, '')}`

    // Presigned URL erzeugen (public read)
    const { url, pathname } = await generateUploadUrl({
      pathname: key,
      contentType,
      access: 'public',
      // Hinweis: addRandomSuffix ist hier nicht nötig, da der Key bereits eindeutig ist.
    })

    return NextResponse.json({ ok: true, url, pathname, contentType })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[upload/create-url] ERROR:', msg)
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: 'POST mit JSON { folder?, contentType?, ext? } liefert eine presigned PUT URL.',
    example: {
      folder: 'gardens',
      contentType: 'image/png',
      ext: 'png',
    },
  })
}
