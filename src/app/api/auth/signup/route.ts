// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server"
import { db } from "@/db/db"
import { users } from "@/db/schema-users"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"
import { z } from "zod"
import { getIP, limit } from "@/lib/rateLimit"

export const runtime = "nodejs"

const schema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  const ip = getIP(req)
  if (!limit(`route:/api/auth/signup:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  try {
    const json = await req.json().catch(() => null)
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 })
    }
    const { name, email, password } = parsed.data
    const mail = email.trim().toLowerCase()

    const exists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, mail))
      .limit(1)
    if (exists.length) {
      return NextResponse.json({ error: "email_taken" }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 12)
    await db.insert(users).values({
      id: randomUUID(),
      email: mail,
      name: (name ?? "").trim() || null,
      passwordHash: hash,
      hasPremium: false,
      premiumSince: null,
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e) {
    console.error("[signup] error", e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
