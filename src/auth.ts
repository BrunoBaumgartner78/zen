// src/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const {
  handlers,  // -> für /api/auth/[...nextauth]
  auth,      // -> server-side: await auth()
  signIn,    // -> optional server usage
  signOut,   // -> optional server usage
} = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },

  providers: [
    Credentials({
      name: 'credentials',
      async authorize(creds) {
        // TODO: echte DB-Validierung (Email/Passwort)
        if (!creds?.email) return null
        return {
          id: 'demo-user-id-1',
          email: String(creds.email),
          name: 'Demo User',
          hasPremium: true,
        } as any
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id ?? token.sub
        token.hasPremium = (user as any).hasPremium ?? false
      }
      return token
    },
    async session({ session, token }) {
      (session.user as any).id = token.id
      ;(session.user as any).hasPremium = token.hasPremium
      return session
    },
  },
})
