import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/db/db'
import { users } from '@/db/schema-users'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs' // App Router: kein "config", kein bodyParser

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !secret) {
    return NextResponse.json({ error: 'missing signature or secret' }, { status: 400 })
  }

  // App Router: raw body via text()
  const raw = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, secret)
  } catch (err: any) {
    return NextResponse.json({ error: `invalid signature: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const paid =
          session.payment_status === 'paid' ||
          (session.mode === 'subscription' &&
            (session.subscription as any)?.status === 'active')

        if (paid) {
          const userId = (session.metadata?.app_user_id || '').trim()
          const userEmail =
            (session.customer_details?.email || session.customer_email || '').toLowerCase()

          if (userId) {
            await db.update(users).set({ hasPremium: true, premiumSince: new Date() }).where(eq(users.id, userId))
          } else if (userEmail) {
            await db.update(users).set({ hasPremium: true, premiumSince: new Date() }).where(eq(users.email, userEmail))
          }
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        // Optional: Status aktiv? → hasPremium true
        // (Hier könntest du über customer → metadata.email / eigene Zuordnung gehen)
        break
      }
      case 'customer.subscription.deleted': {
        // Optional: Abo beendet → hasPremium false setzen
        break
      }
      default:
        // andere Events ignorieren
        break
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    console.error('[stripe/webhook] handler error', e)
    return NextResponse.json({ error: 'handler failed' }, { status: 500 })
  }
}
