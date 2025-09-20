// src/app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"

export const runtime = "nodejs"

const stripeSecret = process.env.STRIPE_SECRET_KEY
const priceId = process.env.STRIPE_PRICE_ID

// Fallback-Reihenfolge für die Basis-URL (Production/Preview/Local)
const ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

if (!stripeSecret) {
  console.warn("[/api/stripe/checkout] STRIPE_SECRET_KEY fehlt")
}
if (!priceId) {
  console.warn("[/api/stripe/checkout] STRIPE_PRICE_ID fehlt")
}

const stripe = new Stripe(stripeSecret ?? "", { apiVersion: "2024-06-20" })

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | null)?.id
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    if (!stripeSecret || !priceId) {
      return NextResponse.json({ error: "server_misconfigured" }, { status: 500 })
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      // Optional: Eindeutigere Kundenzuordnung (hilfreich in Webhooks)
      metadata: { userId },
      success_url: `${ORIGIN}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${ORIGIN}/upgrade/cancel`,
      // Optional: ein paar Best-Practice-Optionen
      billing_address_collection: "auto",
      allow_promotion_codes: true,
    })

    // Wahlweise direkt 303 redirecten:
    // return NextResponse.redirect(checkout.url!, { status: 303 })

    return NextResponse.json({ url: checkout.url })
  } catch (err) {
    console.error("[/api/stripe/checkout] error:", err)
    return NextResponse.json({ error: "stripe_error" }, { status: 500 })
  }
}
