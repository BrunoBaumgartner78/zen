// src/app/api/stripe/checkout/route.ts
import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // <- Pfad an dein Projekt anpassen

export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

function abs(url: string) {
  // Stelle sicher, dass NEXTAUTH_URL gesetzt ist, z.B. https://www.blue-lotos.ch
  const base = process.env.NEXTAUTH_URL!;
  return url.startsWith("http") ? url : `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function createCheckoutSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "unauthorized" as const };
  }

  const price = process.env.STRIPE_PRICE_PREMIUM || process.env.STRIPE_PRICE_ID;
  if (!price) return { error: "STRIPE_PRICE_ID/STRIPE_PRICE_PREMIUM not set" as const };

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,   // 👈 das hier
    success_url: abs("/upgrade/success"),
    cancel_url: abs("/upgrade/cancel"),
    metadata: { app_user_id: String((session.user as any).id ?? "") },
  });

  return { url: checkout.url! };
}

export async function POST(req: NextRequest) {
  const result = await createCheckoutSession();
  if ("error" in result) return NextResponse.json(result, { status: 401 });

  // Wenn Fetch/AJAX: JSON zurückgeben
  const acceptsJson = req.headers.get("accept")?.includes("application/json");
  if (acceptsJson) return NextResponse.json({ url: result.url });

  // Ansonsten direkt weiterleiten
  return NextResponse.redirect(result.url, { status: 303 });
}

// Optional für manuelles Testen im Browser:
// GET erzeugt ebenfalls eine Session und leitet sofort weiter.
export async function GET() {
  const result = await createCheckoutSession();
  if ("error" in result) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.redirect(result.url, { status: 303 });
}
