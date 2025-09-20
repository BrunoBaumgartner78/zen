import { NextResponse } from 'next/server'
import { db } from '@/db/db'
import { gardens } from '@/db/schema-gardens'
import { eq } from 'drizzle-orm'

type Ctx = { params: { id: string } }

// GET /api/gardens/:id → einzelner Garden
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const id = params?.id
    if (!id || id.length < 8 || id.length > 64) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const rows = await db.select().from(gardens).where(eq(gardens.id, id)).limit(1)
    const row = rows[0]
    if (!row) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    return NextResponse.json(row, { status: 200 })
  } catch (err) {
    console.error('[api/gardens/:id GET] error:', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
