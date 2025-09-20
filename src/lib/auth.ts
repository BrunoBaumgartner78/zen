// src/lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  // wichtig bei lokal/Vercel:
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },

  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(creds) {
        // TODO: echte DB Prüfung
        if (!creds?.email) return null
        return {
          id: 'demo-user-id-1',
          email: String(creds.email),
          name: 'Demo User',
          hasPremium: true, // oder aus DB
        } as any
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id ?? token.sub
        ;(token as any).hasPremium = (user as any).hasPremium ?? false
      }
      return token
    },
    async session({ session, token }) {
      (session.user as any).id = (token as any).id
      ;(session.user as any).hasPremium = (token as any).hasPremium
      return session
    },
  },

  // optional für Debug:
  // debug: process.env.NODE_ENV === 'development',
}
