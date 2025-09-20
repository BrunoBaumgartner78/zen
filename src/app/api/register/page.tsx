'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const r = useRouter()
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [pw,setPw] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ name, email, password: pw })
    })
    if (!res.ok) { toast.error('Registrierung fehlgeschlagen'); return }
    toast.success('Registriert – bitte einloggen')
    // optional: auto-login
    await signIn('credentials', { email, password: pw, redirect: false })
    r.push('/')
  }

  return (
    <main style={{maxWidth:420, margin:'60px auto', padding:20}}>
      <h1>Registrieren</h1>
      <form onSubmit={submit} style={{display:'grid', gap:12}}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="E-Mail" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Passwort" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
        <button type="submit">Account anlegen</button>
      </form>
    </main>
  )
}
