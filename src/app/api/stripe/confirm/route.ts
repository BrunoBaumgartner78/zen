// src/app/api/stripe/confirm/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  // Stripe nur zur Laufzeit laden
  const sk = process.env.STRIPE_SECRET_KEY
  if (!sk) {
    return NextResponse.json(
      { error: 'Stripe not configured (missing STRIPE_SECRET_KEY)' },
      { status: 503 }
    )
  }

  const { sessionId } = await req.json().catch(() => ({} as { sessionId?: string }))
  if (!sessionId) {
    return NextResponse.json({ error: 'missing sessionId' }, { status: 400 })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(sk, { apiVersion: '2024-06-20' })

  try {
    const sess = await stripe.checkout.sessions.retrieve(sessionId)
    // Du kannst hier optional mehr Infos zurückgeben oder eigene Business-Logik einbauen
    return NextResponse.json({
      id: sess.id,
      payment_status: sess.payment_status,
      customer: sess.customer,
      amount_total: sess.amount_total,
      currency: sess.currency,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'failed_to_retrieve_session' },
      { status: 500 }
    )
  }
}
