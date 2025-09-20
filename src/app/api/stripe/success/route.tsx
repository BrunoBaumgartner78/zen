// src/app/api/stripe/success/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/db/db'
import { users } from '@/db/schema-users'
import { eq } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      return NextResponse.json({ error: 'session_id fehlt' }, { status: 400 })
    }

    const cs = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription'],
    })

    const paid =
      cs.payment_status === 'paid' ||
      (cs.mode === 'subscription' && (cs.subscription as any)?.status === 'active')

    if (!paid) {
      return NextResponse.json({ error: 'nicht bezahlt/aktiv' }, { status: 400 })
    }

    // Wer ist der Käufer?
    const metaUserId = (cs.metadata?.app_user_id ?? '').trim()
    const metaEmail  = (cs.metadata?.app_email ?? '').toLowerCase()
    const fromStripeEmail = (cs.customer_details?.email ?? cs.customer_email ?? '').toLowerCase()

    const email = metaEmail || fromStripeEmail

    // Erst nach ID, fallback Email
    let updated
    if (metaUserId) {
      updated = await db.update(users)
        .set({ hasPremium: true, premiumSince: new Date() })
        .where(eq(users.id, metaUserId))
        .returning({ id: users.id, email: users.email, hasPremium: users.hasPremium, premiumSince: users.premiumSince })
    }
    if ((!updated || updated.length === 0) && email) {
      updated = await db.update(users)
        .set({ hasPremium: true, premiumSince: new Date() })
        .where(eq(users.email, email))
        .returning({ id: users.id, email: users.email, hasPremium: users.hasPremium, premiumSince: users.premiumSince })
    }

    if (!updated || updated.length === 0) {
      // Sichtbares Debug hilft, wenn Schema/Spaltennamen nicht passen
      console.error('[stripe/success] Kein User geupdatet', { metaUserId, email })
      return NextResponse.json({ error: 'Kein passender User für Update gefunden' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, user: updated[0] })
  } catch (err: any) {
    console.error('[stripe/success]', err)
    return NextResponse.json({ error: err?.message ?? 'Fehler' }, { status: 500 })
  }
}
