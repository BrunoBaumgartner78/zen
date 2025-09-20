// src/lib/winter.ts
import { Session } from "next-auth"

export function useWinter(session: Session | null | undefined) {
  const isDecember = new Date().getMonth() === 11 // 0=Jan … 11=Dez
  const hasPremium = Boolean(session?.user?.hasPremium)
  return { isDecember, hasPremium, hasWinter: isDecember || hasPremium }
}
