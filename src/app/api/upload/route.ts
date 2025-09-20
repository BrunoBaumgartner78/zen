// src/app/api/upload/create-url/route.ts
import { NextResponse } from 'next/server'
import { generateUploadUrl } from '@vercel/blob'

export const runtime = 'nodejs'

// kleine Helfer für klare 4xx statt 500
function need(name: string, v: string | undefined) {
  if (!v) throw new Error(`ENV fehlend: ${name}`)
  return v
}

export async function POST(req: Request) {
  try {
    // Für @vercel/blob im Server brauchst du ein Token (einfachste Variante)
    need('BLOB_READ_WRITE_TOKEN', process.env.BLOB_READ_WRITE_TOKEN)

    // optionaler Body
    const body = await req.json().catch(() => ({} as any))
    const folder = (body?.folder as string) || 'gardens'
    const ext = (body?.ext as string) || 'png'
    const ct = (body?.contentType as string) || 'image/png'

    // Dateiname generieren
    const ms = Date.now()
    const key = `${folder}/${ms}.` + ext.replace(/^\./, '')

    // Presigned URL erzeugen (public lesen)
    const { url, pathname } = await generateUploadUrl({
      pathname: key,
      contentType: ct,
      access: 'public',
    })

    return NextResponse.json({ ok: true, url, pathname })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[upload/create-url] ERROR:', msg)
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: 'POST hierher, um eine Presigned Upload URL zu erhalten.' })
}
