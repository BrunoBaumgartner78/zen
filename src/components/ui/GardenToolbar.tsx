'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

type Props = {
  theme: 'morning' | 'day' | 'dusk' | 'night'
  setTheme: (t: Props['theme']) => void
  winterMode: boolean
  toggleWinter: () => void
  addItem: (kind: string) => void
  clearPaths: () => void
  removeSelected: () => void
  saveLocal: () => void
  loadLocal: () => void
  exportPNG: () => void
  share: () => void
  selectedId: string | null
  isAuthed: boolean
  hasPremium: boolean
  openLogin: () => void
  volume: number
  onVolumeChange: (v: number) => void
  muted: boolean
  onMuteToggle: () => void
  chimeRate: number
  onChimeRateChange: (v: number) => void
}

const BASE_ITEMS = [
  { key: 'stoneFlat',  label: 'Stein flach' },
  { key: 'stoneOval',  label: 'Stein oval'  },
  { key: 'stoneTall',  label: 'Stein hoch'  },
  { key: 'leaf',       label: 'Blatt'       },
  { key: 'lantern',    label: 'Laterne'     },
  { key: 'rake',       label: 'Rechen'      },
  { key: 'waveRing',   label: 'Wellenkreis' },
]

const PREMIUM_ITEMS = [
  { key: 'stoneBridge',   label: 'Steinbrücke' },
  { key: 'zenBell',       label: 'Zen-Glocke'  },
  { key: 'bonsaiTree',    label: 'Bonsai'      },
  { key: 'bambooFence',   label: 'Bambuszaun'  },
  { key: 'toriiGate',     label: 'Shintō-Torii'},
  { key: 'kitsuneStatue', label: 'Kitsune'     },
  { key: 'buddhaStatue',  label: 'Buddha'      },
  { key: 'koiPond',       label: 'Koi-Teich'   },
  { key: 'winterPond',    label: 'Winterteich' },
  { key: 'snowman',       label: 'Schneemann'  },
  { key: 'autumnLeaves',  label: 'Herbstlaub'  },
  { key: 'mapleTree',     label: 'Ahornbaum'   },
]

function isDecemberNow() { return new Date().getMonth() === 11 }

export default function GardenToolbar(p: Props) {
  const winterUnlocked = p.hasPremium || isDecemberNow()

  const bar: React.CSSProperties = {
    position: 'relative',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(8px)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(0,0,0,0.06)',
  }

  const chipBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 36,
    padding: '0 14px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    background: '#fff',
    cursor: 'pointer',
    userSelect: 'none',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
  }

  const chip = (disabled = false): React.CSSProperties => ({
    ...chipBase,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })

  const chipDark: React.CSSProperties = {
    ...chipBase,
    background: '#111',
    color: '#fff',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
  }

  const groupSep: React.CSSProperties = { width: 10 }

  return (
    <div style={bar}>
      {/* Teilen */}
      <button
        type="button"
        style={chip(!p.isAuthed)}
        onClick={p.isAuthed ? p.share : p.openLogin}
        title={p.isAuthed ? 'In Galerie teilen' : 'Bitte zuerst anmelden'}
      >
        ✨ Teilen
      </button>

      <Link href="/explore" style={{ textDecoration: 'none' }}>
        <span style={chip(false as any)}>🧭 Explore</span>
      </Link>

      {/* Winter */}
      <button
        type="button"
        style={chip(!winterUnlocked)}
        onClick={winterUnlocked ? p.toggleWinter : () => (window.location.href = '/upgrade')}
        disabled={!winterUnlocked}
        title={winterUnlocked ? 'Winter an/aus' : 'Nur Premium (im Dezember gratis)'}
      >
        ❄️ {p.winterMode ? 'Winter aktiv' : 'Winter OFF'}
      </button>

      {/* Themes */}
      {(['morning','day','dusk','night'] as const).map(t => (
        <button
          type="button"
          key={t}
          style={p.theme === t ? chipDark : chip()}
          onClick={() => p.setTheme(t)}
          title={`Theme: ${t}`}
        >
          {t}
        </button>
      ))}

      {/* Basis-Items */}
      {BASE_ITEMS.map(it => (
        <button key={it.key} type="button" style={chip()} onClick={() => p.addItem(it.key)}>
          {it.label}
        </button>
      ))}

      {/* Premium-Items – nur bei Premium */}
      {p.hasPremium && (
        <>
          <div style={groupSep} />
          {PREMIUM_ITEMS.map(it => (
            <button key={it.key} type="button" style={chip()} onClick={() => p.addItem(it.key)}>
              {it.label}
            </button>
          ))}
        </>
      )}

      <div style={{ flex: 1, minWidth: 12 }} />

      {/* Rillen / Auswahl / Dateien */}
      <button type="button" style={chip()} onClick={p.clearPaths}>Rillen löschen</button>
      <button type="button" style={chip(!p.selectedId)} onClick={p.selectedId ? p.removeSelected : undefined} disabled={!p.selectedId}>
        Ausgewähltes löschen
      </button>
      <button type="button" style={chip()} onClick={p.saveLocal}>Speichern</button>
      <button type="button" style={chip()} onClick={p.loadLocal}>Laden</button>
      <button type="button" style={chip()} onClick={p.exportPNG}>PNG</button>

      {/* Audio */}
      <div style={groupSep} />
      <button type="button" style={chip()} onClick={p.onMuteToggle}>{p.muted ? '🔇' : '🔊'}</button>
      <input aria-label="Lautstärke" type="range" min={0} max={1} step={0.01} value={p.volume}
             onChange={(e) => p.onVolumeChange(Number(e.target.value))} style={{ width: 90 }} />
      <span style={{ fontSize: 12, opacity: .7 }}>Chimes</span>
      <input aria-label="Chime Rate" type="range" min={4} max={30} step={1} value={p.chimeRate}
             onChange={(e) => p.onChimeRateChange(Number(e.target.value))} style={{ width: 80 }} />

      {/* Auth rechts */}
      <div style={groupSep} />
      {p.isAuthed ? (
        <button type="button" style={chip()} onClick={() => signOut({ callbackUrl: '/' })}>Abmelden</button>
      ) : (
        <button type="button" style={chip()} onClick={p.openLogin}>Anmelden</button>
      )}

      {!p.hasPremium && p.isAuthed && (
        <>
          <div style={groupSep} />
          <button
            type="button"
            style={{ ...chipDark, background: '#1a1a1a' }}
            onClick={() => (window.location.href = '/upgrade')}
            title="Premium freischalten"
          >
            ★ Upgrade
          </button>
        </>
      )}
    </div>
  )
}
