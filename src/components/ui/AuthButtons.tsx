"use client"
import { useSession, signIn, signOut } from "next-auth/react"

export default function AuthButtons() {
  const { data: session, status } = useSession()
  if (status === "loading") return null

  if (!session) {
    return (
      <button
        onClick={() => signIn("email")}
        style={{ padding:"6px 10px", borderRadius:10, border:"1px solid rgba(0,0,0,0.15)", background:"#fff", cursor:"pointer" }}
      >
        Einloggen
      </button>
    )
  }
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      <span style={{ fontSize:12, opacity:0.8 }}>{session.user?.email}</span>
      <button
        onClick={() => signOut()}
        style={{ padding:"6px 10px", borderRadius:10, border:"1px solid rgba(0,0,0,0.15)", background:"#fff", cursor:"pointer" }}
      >
        Logout
      </button>
    </div>
  )
}
