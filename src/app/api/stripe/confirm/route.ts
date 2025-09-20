import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/db/db'
import { users } from '@/db/schema-users'
import { eq } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const sid = url.searchParams.get('session_id')
    if (!sid) return NextResponse.json({ error: 'missing session_id' }, { status: 400 })

    const s = await stripe.checkout.sessions.retrieve(sid)
    if (s.payment_status !== 'paid') {
      return NextResponse.json({ error: 'not paid' }, { status: 402 })
    }

    const userId = (s.metadata?.userId ?? '').trim()
    if (!userId) return NextResponse.json({ error: 'no userId' }, { status: 400 })

    await db.update(users)
      .set({ hasPremium: true, premiumSince: new Date().toISOString() })
      .where(eq(users.id, userId))

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[stripe/confirm] error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
