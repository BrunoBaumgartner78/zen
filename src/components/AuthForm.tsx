// src/components/AuthForm.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

type Props = {
  open: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

const ZEN = {
  sand: '#E9E3D5',
  sandDeep: '#D8D3C6',
  ink: '#2C2A27',
  leaf: '#7F9B7A',
  leafDark: '#6B8C67',
  dusk: '#B5ADA0',
  error: '#B85C5C',
  white: '#FFFFFF',
}

export default function AuthForm({ open, onClose, defaultTab = 'login' }: Props) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    // focus erstes Feld beim Öffnen
    const t = setTimeout(() => emailRef.current?.focus(), 30)
    // ESC zum Schließen
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  useEffect(() => {
    if (!open) { setBusy(false) }
  }, [open])

  async function doLogin(e?: React.FormEvent) {
    e?.preventDefault()
    if (!email || !password) { toast.error('Bitte E-Mail und Passwort eingeben'); return }
    try {
      setBusy(true)
      const res = await signIn('credentials', { email, password, redirect: false })
      setBusy(false)
      if (res?.error) {
        toast.error('Login fehlgeschlagen')
        return
      }
      toast.success('Willkommen zurück ✨')
      onClose()
    } catch {
      setBusy(false)
      toast.error('Login fehlgeschlagen')
    }
  }

  async function doRegister(e?: React.FormEvent) {
    e?.preventDefault()
    if (!email || !password) { toast.error('Bitte E-Mail und Passwort eingeben'); return }
    try {
      setBusy(true)
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      if (!r.ok) {
        const msg = (await r.json().catch(() => ({})))?.error ?? 'Registrierung fehlgeschlagen'
        throw new Error(msg)
      }
      // danach direkt einloggen
      const res = await signIn('credentials', { email, password, redirect: false })
      setBusy(false)
      if (res?.error) { toast.error('Automatischer Login fehlgeschlagen'); return }
      toast.success('Account erstellt ✨')
      onClose()
    } catch (err: any) {
      setBusy(false)
      toast.error(err?.message ?? 'Registrierung fehlgeschlagen')
    }
  }

  if (!open) return null

  return (
    <div
      aria-modal
      role="dialog"
      ref={dialogRef}
      onMouseDown={(e) => {
        // Klick auf den Backdrop schließt
        if (e.target === dialogRef.current) onClose()
      }}
      style={styles.backdrop}
    >
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleWrap}>
            <span style={styles.logo}>禅</span>
            <h3 style={styles.title}>Anmelden</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Schließen">×</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setTab('login')}
            style={tab === 'login' ? styles.tabActive : styles.tab}
          >
            Login
          </button>
          <button
            onClick={() => setTab('register')}
            style={tab === 'register' ? styles.tabActive : styles.tab}
          >
            Registrieren
          </button>
        </div>

        {/* Form */}
        <form onSubmit={tab === 'login' ? doLogin : doRegister} style={styles.form}>
          {tab === 'register' && (
            <LabeledInput
              label="Name (optional)"
              value={name}
              onChange={setName}
              placeholder="Dein Name"
              autoComplete="name"
            />
          )}
          <LabeledInput
            inputRef={emailRef}
            label="E-Mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="du@example.com"
            autoComplete="email"
            required
          />
          <LabeledInput
            label="Passwort"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            required
          />

          <button
            type="submit"
            disabled={busy}
            style={busy ? styles.ctaBtnDisabled : styles.ctaBtn}
          >
            {busy ? 'Bitte warten…' : tab === 'login' ? 'Einloggen' : 'Registrieren'}
          </button>

          {/* Hint */}
          <p style={styles.hint}>
            {tab === 'login' ? (
              <>
                Noch kein Konto?{' '}
                <a
                  style={styles.link}
                  onClick={(e) => { e.preventDefault(); setTab('register') }}
                  href="#register"
                >
                  Jetzt registrieren
                </a>
              </>
            ) : (
              <>
                Schon registriert?{' '}
                <a
                  style={styles.link}
                  onClick={(e) => { e.preventDefault(); setTab('login') }}
                  href="#login"
                >
                  Hier einloggen
                </a>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  )
}

/* ——— Kleine Hilfs-Komponenten & Styles ——— */

function LabeledInput(props: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  autoComplete?: string
  required?: boolean
  inputRef?: React.Ref<HTMLInputElement>
}) {
  const { label, value, onChange, placeholder, type = 'text', autoComplete, required, inputRef } = props
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}{required ? ' *' : ''}</span>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        style={styles.input}
      />
    </label>
  )
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(2px)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 10000,
  },
  panel: {
    width: 'min(92vw, 480px)',
    background: `linear-gradient(180deg, ${ZEN.sand} 0%, ${ZEN.sandDeep} 100%)`,
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 20,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  logo: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 36,
    height: 36,
    borderRadius: 10,
    background: ZEN.leaf,
    color: ZEN.white,
    fontWeight: 700,
    fontSize: 18,
  },
  title: { margin: 0, fontSize: 18, color: ZEN.ink },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'transparent',
    color: ZEN.ink,
    fontSize: 22,
    lineHeight: '22px',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'transparent',
    cursor: 'pointer',
  },
  tabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    margin: '8px 0 16px',
  },
  tab: {
    padding: '10px 12px',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.6)',
    color: ZEN.ink,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
  tabActive: {
    padding: '10px 12px',
    borderRadius: 10,
    background: ZEN.leaf,
    color: ZEN.white,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: ZEN.leafDark,
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
    cursor: 'pointer',
  },
  form: { display: 'grid', gap: 12 },
  field: { display: 'grid', gap: 6 },
  label: { fontSize: 13, color: ZEN.ink, opacity: 0.8 },
  input: {
    outline: 'none',
    padding: '12px 14px',
    borderRadius: 10,
    background: ZEN.white,
    color: ZEN.ink,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    fontSize: 14,
  },
  ctaBtn: {
    marginTop: 4,
    padding: '12px 16px',
    borderRadius: 12,
    background: ZEN.leaf,
    color: ZEN.white,
    fontWeight: 700,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: ZEN.leafDark,
    cursor: 'pointer',
  },
  ctaBtnDisabled: {
    marginTop: 4,
    padding: '12px 16px',
    borderRadius: 12,
    background: ZEN.dusk,
    color: ZEN.white,
    fontWeight: 700,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: ZEN.dusk,
    opacity: 0.8,
    cursor: 'not-allowed',
  },
  hint: { margin: '6px 2px 0', fontSize: 13, color: ZEN.ink, opacity: 0.8 },
  link: {
    color: ZEN.leafDark,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}
