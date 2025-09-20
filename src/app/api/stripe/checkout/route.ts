// src/app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route' // ← Pfad ggf. anpassen

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const priceId = process.env.STRIPE_PRICE_PREMIUM // z.B. "price_1S..."
  if (!priceId) {
    console.error('[stripe.checkout] Missing STRIPE_PRICE_PREMIUM')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl  = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/upgrade`

  const userId = (session.user as any).id ?? ''
  const userEmail = (session.user.email ?? '').toLowerCase()

  const cs = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      app_user_id: String(userId),
      app_email: userEmail,
    },
    customer_email: userEmail || undefined,
  })

  return NextResponse.json({ url: cs.url }, { status: 200 })
}
