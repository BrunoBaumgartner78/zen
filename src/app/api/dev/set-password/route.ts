import { NextResponse } from 'next/server'
import { db } from '@/db/db'
import { users } from '@/db/schema-users'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'disabled in production' }, { status: 403 })
  }
  try {
    const { email, password } = await req.json() as { email?: string; password?: string }
    const mail = (email ?? '').trim().toLowerCase()
    if (!mail || !password) return NextResponse.json({ error: 'email/password required' }, { status: 400 })

    const hash = await bcrypt.hash(password, 12)
    const res = await db.update(users)
      .set({ passwordHash: hash })
      .where(eq(users.email, mail))

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[dev/set-password]', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
