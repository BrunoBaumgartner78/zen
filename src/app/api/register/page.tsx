// src/app/api/register/route.ts
import { NextResponse } from "next/server"
import { db } from "@/db/db"
import { users } from "@/db/schema-users"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"
import { z } from "zod"

export const runtime = "nodejs"

const schema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "validation_failed", issues: parsed.error.flatten() }, { status: 400 })
    }

    const email = parsed.data.email.trim().toLowerCase()
    const name = (parsed.data.name ?? "").trim()
    const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
    if (exists.length) return NextResponse.json({ error: "email_taken" }, { status: 409 })

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)

    await db.insert(users).values({
      id: randomUUID(),
      email,
      name: name || null,
      passwordHash,
      hasPremium: false,
      premiumSince: null,
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    console.error("[api/register] error", e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
