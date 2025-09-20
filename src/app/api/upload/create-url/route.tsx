import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { put } from '@vercel/blob'
import { authOptions } from '../../auth/[...nextauth]/route' // passe ggf. Pfad an

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const ct = new URL(req.url).searchParams.get('ct') || 'image/png'
  const ab = await req.arrayBuffer()
  if (!ab.byteLength) return new NextResponse('Missing body', { status: 400 })

  try {
    const userId = (session.user as any)?.id ?? 'anon'
    const fileName = `gardens/${userId}-${Date.now()}.png`
    const uploaded = await put(fileName, Buffer.from(ab), {
      access: 'public',
      contentType: ct,
      token: process.env.BLOB_READ_WRITE_TOKEN, // lokal erforderlich
      addRandomSuffix: true,
    })
    return NextResponse.json({ url: uploaded.url })
  } catch (e) {
    console.error('blob put failed:', e)
    return new NextResponse('Blob upload error', { status: 500 })
  }
}
