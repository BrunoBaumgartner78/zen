// src/app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const price = process.env.STRIPE_PRICE_PREMIUM
  const secret = process.env.STRIPE_SECRET_KEY
  const origin = process.env.NEXTAUTH_URL
  if (!price || !secret || !origin) {
    return NextResponse.json({ error: 'stripe env missing' }, { status: 500 })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/upgrade/success`,
    cancel_url: `${origin}/upgrade/cancel`,
    metadata: { userId },
  })

  return NextResponse.json({ url: checkout.url })
}
