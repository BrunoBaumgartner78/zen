import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/db";
import { users } from "@/db/schema-users";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
      .webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: any) {
    return NextResponse.json({ error: `invalid sig: ${e.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const cs = event.data.object as Stripe.Checkout.Session;
    const userId = cs.metadata?.userId;
    if (userId) {
      await db.update(users).set({ hasPremium: true, premiumSince: new Date() })
        .where(eq(users.id, userId));
    }
  }

  return NextResponse.json({ received: true });
}

export const config = { api: { bodyParser: false } } as any; // Next 15 kompat: raw body
