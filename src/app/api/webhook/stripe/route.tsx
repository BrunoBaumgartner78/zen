import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db, schema } from '@/db/db'     // <-- richtiger Pfad
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// KEINE apiVersion setzen
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = (session.metadata as any)?.userId as string | undefined
      if (userId) {
        await db
          .update(schema.users)
          .set({ hasPremium: true, premiumSince: new Date() as any })
          .where(eq(schema.users.id, userId))
      }
      break
    }
    case 'customer.subscription.created':
    case 'invoice.payment_succeeded': {
      // optional: weitere Absicherung
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
