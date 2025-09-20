import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const price = process.env.STRIPE_PRICE_ID!;
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/upgrade/success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/upgrade/cancel`,
    metadata: { userId: String((session.user as any).id) },
  });

  return NextResponse.json({ url: checkout.url });
}
