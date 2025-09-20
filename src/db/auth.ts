import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/db/db";
import { users } from "@/db/schema-users";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email & Passwort",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const u = rows[0];
        if (!u?.passwordHash) return null;

        const ok = await compare(password, u.passwordHash);
        if (!ok) return null;

        return {
          id: u.id,
          email: u.email,
          name: u.name ?? undefined,
          image: u.image ?? undefined,
          hasPremium: u.hasPremium ?? false,
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // initial login: kopiere Flags
      if (user) {
        token.uid = (user as any).id;
        token.hasPremium = (user as any).hasPremium ?? false;
      }
      // beim Refresh: DB-Truth
      if (token?.uid) {
        try {
          const row = await db.select({
            hasPremium: users.hasPremium
          }).from(users).where(eq(users.id, String(token.uid))).limit(1);
          token.hasPremium = row[0]?.hasPremium ?? false;
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).hasPremium = token.hasPremium ?? false;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  }
};
