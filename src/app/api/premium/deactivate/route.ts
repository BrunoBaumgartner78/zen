import 'server-only'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db/db'
import { users } from '@/db/schema-users'
import { eq } from 'drizzle-orm'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const userId = String(session.user.id)

  try {
    // @ts-ignore – column explained in schema snippet below
    await db.update(users).set({ hasPremium: false }).where(eq(users.id, userId))
    return NextResponse.redirect(new URL('/upgrade?ok=0', process.env.AUTH_URL ?? 'http://localhost:3000'))
  } catch (e: any) {
    const msg = `${e?.message || e}`
    if (/column .*hasPremium/i.test(msg) || /has_premium/i.test(msg)) {
      return new NextResponse(
        'Spalte users.hasPremium fehlt. Füge sie via Migration hinzu (BOOLEAN NOT NULL DEFAULT false).',
        { status: 501 }
      )
    }
    console.error('[premium/deactivate] error', e)
    return new NextResponse('internal error', { status: 500 })
  }
}
