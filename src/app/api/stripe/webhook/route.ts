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

  // Stripe erst zur Request-Zeit laden (verhindert Build-Fehler)
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(sk, { apiVersion: '2024-06-20' })

  // App Router: raw body via text()
  const raw = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, secret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json({ error: `invalid signature: ${msg}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const paid = session.payment_status === 'paid'

        if (paid) {
          // ➜ In /api/stripe/checkout/route.ts hast du `metadata: { userId }` gesetzt
          const userId = session.metadata?.userId?.trim()
          const userEmail = (session.customer_details?.email || session.customer_email || '')
            .trim()
            .toLowerCase()

          if (userId) {
            await db
              .update(users)
              .set({ hasPremium: true, premiumSince: new Date() })
              .where(eq(users.id, userId))
          } else if (userEmail) {
            await db
              .update(users)
              .set({ hasPremium: true, premiumSince: new Date() })
              .where(eq(users.email, userEmail))
          }
        }
        break
      }

      // Optional: Wenn du Subscriptions nutzt, ist "invoice.paid" oft robuster:
      // case 'invoice.paid': { ... setze hasPremium true ...; break }
      // case 'customer.subscription.deleted': { ... setze hasPremium false ...; break }

      default:
        // andere Events ignorieren
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe/webhook] handler error', err)
    return NextResponse.json({ error: 'handler failed' }, { status: 500 })
  }
}
