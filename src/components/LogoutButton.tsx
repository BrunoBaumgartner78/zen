'use client'
import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      style={{
        display:'inline-flex',alignItems:'center',gap:8,
        padding:'8px 12px',borderRadius:10,background:'#fff',
        border:'1px solid rgba(0,0,0,.12)',cursor:'pointer',fontSize:13
      }}
      title="Abmelden"
    >
      Logout
    </button>
  )
}
