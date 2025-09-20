// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/db/db"
import { users } from "@/db/schema-users"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { z } from "zod"

const credsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
})

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Email & Passwort",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credsSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        })
        if (!parsed.success) return null
        const email = parsed.data.email.trim().toLowerCase()
        const password = parsed.data.password

        const row = (await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1))[0]
        if (!row?.passwordHash) return null

        const ok = await bcrypt.compare(password, row.passwordHash)
        if (!ok) return null

        return {
          id: row.id,
          email: row.email,
          name: row.name ?? undefined,
          image: row.image ?? undefined,
          hasPremium: row.hasPremium ?? false,
        } as any
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Erst-Login: seed
      if (user) {
        token.uid = (user as any).id
        token.hasPremium = (user as any).hasPremium ?? false
      }

      // Fallback: Falls uid nicht gesetzt ist, sub (NextAuth default) verwenden
      if (!token.uid && token.sub) {
        token.uid = token.sub
      }

      // „DB is truth“: hasPremium immer aktuell aus DB ziehen, wenn wir irgendeine ID haben
      const lookupId = String(token.uid || token.sub || "")
      if (lookupId) {
        try {
          const res = await db
            .select({ hasPremium: users.hasPremium })
            .from(users)
            .where(eq(users.id, lookupId))
            .limit(1)
          token.hasPremium = res[0]?.hasPremium ?? false
        } catch {
          // im Fehlerfall Flag nicht ändern
        }
      }

      return token
    },

    async session({ session, token }) {
      // ID belastbar setzen (uid > sub)
      const id = (token as any).uid || token.sub || null
      if (session.user) {
        ;(session.user as any).id = id
        ;(session.user as any).hasPremium = (token as any).hasPremium ?? false
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl)
        const allowed = new Set([new URL(baseUrl).origin, "https://blue-lotos.ch"])
        return allowed.has(u.origin) ? u.toString() : baseUrl
      } catch {
        return baseUrl
      }
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/api/auth/error",
  },
}
