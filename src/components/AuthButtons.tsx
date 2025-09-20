// z.B. src/components/AuthButtons.tsx
'use client'
import { signIn, signOut, useSession } from 'next-auth/react'

export default function AuthButtons() {
  const { data: session, status } = useSession()
  if (status === 'loading') return null

  return session ? (
    <div style={{position:'absolute', top:16, right:16, zIndex:30, display:'flex', gap:8}}>
      <span style={{background:'rgba(255,255,255,.7)', padding:'6px 10px', borderRadius:10}}>
        Hallo {session.user?.name ?? 'User'}
      </span>
      <button onClick={() => signOut()} style={{padding:'6px 10px', borderRadius:10}}>Sign out</button>
    </div>
  ) : (
    <div style={{position:'absolute', top:16, right:16, zIndex:30}}>
      <button onClick={() => signIn('github')} style={{padding:'6px 10px', borderRadius:10}}>Sign in with GitHub</button>
    </div>
  )
}
