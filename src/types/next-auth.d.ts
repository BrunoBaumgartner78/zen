import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    hasPremium?: boolean
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      hasPremium?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    hasPremium?: boolean
  }
}
