// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db/db'
import { users } from '@/db/schema-users'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const sk = process.env.STRIPE_SECRET_KEY
  if (!sig || !secret || !sk) {
    return NextResponse.json({ error: 'missing stripe config' }, { status: 400 })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(sk, { apiVersion: '2024-06-20' })

  const raw = await req.text()

  let event: InstanceType<typeof Stripe>['events']['retrieve'] extends never ? any : import('stripe').Stripe.Event
  try {
    // @ts-expect-error: types are fine at runtime
    event = await stripe.webhooks.constructEventAsync(raw, sig, secret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json({ error: `invalid signature: ${msg}` }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as import('stripe').Stripe.Checkout.Session
      if (session.payment_status === 'paid') {
        const userId = session.metadata?.userId?.trim()
        const userEmail = (session.customer_details?.email || session.customer_email || '').trim().toLowerCase()

        if (userId) {
          await db.update(users).set({ hasPremium: true, premiumSince: new Date() }).where(eq(users.id, userId))
        } else if (userEmail) {
          await db.update(users).set({ hasPremium: true, premiumSince: new Date() }).where(eq(users.email, userEmail))
        }
      }
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe/webhook] handler error', err)
    return NextResponse.json({ error: 'handler failed' }, { status: 500 })
  }
}
