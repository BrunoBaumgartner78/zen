'use client'

/**
 * PixiGardenPlain – Vollständige, geprüfte Version
 * - Items setzen & draggen
 * - Winter/Theme + Sounds (applyTheme/applyWinter)
 * - Premium-Gating (Guest / Registered / Paid)
 * - Share (PNG → /api/upload → /api/gardens)
 * - Export PNG, Local Save/Load
 */

import { useEffect, useRef, useState } from 'react'
import {
  Application,
  Graphics,
  Sprite,
  Texture,
  Rectangle,
  Circle,
  FederatedPointerEvent,
} from 'pixi.js'
import { Extract } from '@pixi/extract'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import GardenToolbar from '../ui/GardenToolbar'
import { useHistory } from '@/hooks/useHistory'
import { createSound } from '@/lib/sound'
import AuthForm from '@/components/AuthForm'

// Limits & Items
const ITEM_LIMIT_GUEST = 12
const ITEM_LIMIT_PREMIUM = 64

const BASE_ITEMS = [
  'stoneFlat','stoneOval','stoneTall','leaf','lantern','rake','waveRing'
] as const

const PREMIUM_ITEMS = [
  'stoneBridge','zenBell',
  'bonsaiTree','bambooFence','toriiGate','kitsuneStatue','buddhaStatue',
  'koiPond','winterPond','snowman','autumnLeaves','mapleTree'
] as const

function isDecemberNow() { return new Date().getMonth() === 11 }

type Point = { x: number; y: number }
const THEMES = { morning: 0xf0ebdd, day: 0xe9e3d5, dusk: 0xe5ded7, night: 0xd8d3c6 } as const
const WINTER_SAND = 0xeaf3fb
type ThemeKey = keyof typeof THEMES

type ItemKind =
  | 'stoneFlat' | 'stoneOval' | 'stoneTall' | 'leaf' | 'lantern' | 'rake' | 'waveRing'
  | 'stoneBridge' | 'zenBell'
  | 'bonsaiTree' | 'bambooFence' | 'toriiGate' | 'kitsuneStatue' | 'buddhaStatue'
  | 'koiPond' | 'winterPond' | 'snowman' | 'autumnLeaves' | 'mapleTree'

type Item = { id: string; kind: ItemKind; x: number; y: number; r?: number; w?: number; h?: number }

type SceneState = {
  theme: ThemeKey
  winterMode: boolean
  brush: number
  paths: Point[][]
  items: Item[]
  selectedId: string | null
}

export default function PixiGardenPlain() {
  const { data: session, status } = useSession()
  const isAuthed = status === 'authenticated' && !!session?.user
  const hasPremium = Boolean((session?.user as any)?.hasPremium)
  const winterUnlocked = hasPremium || isDecemberNow()

  // PIXI refs
  const appRef = useRef<Application | null>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const sandRef = useRef<Graphics | null>(null)
  const grainRef = useRef<Sprite | null>(null)
  const vignetteRef = useRef<Graphics | null>(null)
  const pathsRef = useRef<Graphics | null>(null)
  const drawingRef = useRef(false)
  const itemNodesRef = useRef<Map<string, Graphics>>(new Map())

  // Scene
  const [scene, setScene] = useState<SceneState>({
    theme: 'day',
    winterMode: false,
    brush: 12,
    paths: [],
    items: [],
    selectedId: null,
  })
  const { snapshot } = useHistory<SceneState>(scene)

  // Sound
  const soundRef = useRef<ReturnType<typeof createSound> | null>(null)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [chimeRate, setChimeRate] = useState(12)
  const audioStartedRef = useRef(false)

  // Login Modal
  const [loginOpen, setLoginOpen] = useState(false)
  const openLogin = () => setLoginOpen(true)

  // Audio sicher starten (auch aus Handlers nutzbar)
  async function tryStartAudio() {
    if (audioStartedRef.current) return
    try {
      await soundRef.current?.start?.()
      soundRef.current?.setMasterVolume?.(volume)
      soundRef.current?.setChimeInterval?.(chimeRate)
      soundRef.current?.mute?.(muted)
      if (scene.winterMode) soundRef.current?.applyWinter?.(true)
      else soundRef.current?.applyTheme?.(scene.theme)
      audioStartedRef.current = true
    } catch { /* noop */ }
  }

  // ---------- PIXI Setup ----------
  useEffect(() => {
    if (!hostRef.current) return

    const app = new Application({
      backgroundColor: scene.winterMode ? WINTER_SAND : THEMES[scene.theme],
      resizeTo: window,
      antialias: true,
    } as any)

    // Extract sicher registrieren (HMR/StrictMode)
    const r: any = app.renderer
    try { if (!r.extract && typeof r.addSystem === 'function') r.addSystem(Extract, 'extract') } catch {}

    appRef.current = app
    hostRef.current.appendChild(app.view as HTMLCanvasElement)

    // Ebenen
    const sand = new Graphics()
    const grain = makeGrainSprite(app.renderer.width, app.renderer.height)
    const vignette = new Graphics()
    const pathsG = new Graphics()
    app.stage.addChild(sand, grain, vignette, pathsG)
    sandRef.current = sand
    grainRef.current = grain
    vignetteRef.current = vignette
    pathsRef.current = pathsG

    // Interaktion
    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen

    const onDown = async (e: FederatedPointerEvent) => {
      await tryStartAudio()
      // Nur Sand/Stage → zeichnen (Items stoppen Propagation)
      if (e.target !== app.stage) return
      drawingRef.current = true
      const p = e.global
      setScene(s => ({ ...s, selectedId: null, paths: [...s.paths, [{ x: p.x, y: p.y }]] }))
      soundRef.current?.playRake?.()
    }
    const onMove = (e: FederatedPointerEvent) => {
      if (!drawingRef.current) return
      const p = e.global
      setScene(s => {
        const prev = s.paths
        if (!prev.length) return s
        const last = prev[prev.length - 1]
        const lp = last[last.length - 1]
        if (lp && lp.x === p.x && lp.y === p.y) return s
        const next = prev.slice(0, -1).concat([[...last, { x: p.x, y: p.y }]])
        return { ...s, paths: next }
      })
    }
    const onUp = () => {
      if (drawingRef.current) snapshotCurrent(true)
      drawingRef.current = false
    }

    app.stage.on('pointerdown', onDown)
    app.stage.on('pointermove', onMove)
    app.stage.on('pointerup', onUp)
    app.stage.on('pointerupoutside', onUp)

    // Resize
    const onResize = () => {
      repaintSand()
      repaintGrain(true)
      repaintVignette()
      repaintPaths(scene.paths, scene.brush)
      drawOrSyncItems()
    }
    window.addEventListener('resize', onResize)

    repaintAll()

    return () => {
      window.removeEventListener('resize', onResize)
      app.destroy(true)
      appRef.current = null
      sandRef.current = null
      grainRef.current = null
      vignetteRef.current = null
      pathsRef.current = null
      // Items entsorgen
      itemNodesRef.current.forEach(g => g.destroy())
      itemNodesRef.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- Sound-Setup ----------
  useEffect(() => {
    soundRef.current = createSound({
      wind: '/sounds/wind.mp3',
      birds: '/sounds/birds.mp3',
      chimes: '/sounds/chimes.mp3',
      water: '/sounds/water.mp3',
      crickets: '/sounds/crickets.mp3',
      winterWind: '/sounds/winter-wind.mp3',
      snowChimes: '/sounds/snow-chime.mp3',
      rake: '/sounds/rake.mp3',
      gravel: '/sounds/gravel.mp3',
      bamboo: '/sounds/bamboo.mp3',
      click: '/sounds/click.mp3',
    })
  }, [])

  // Theme/Winter → Audio anpassen (wenn gestartet)
  useEffect(() => {
    if (!audioStartedRef.current) return
    if (scene.winterMode) soundRef.current?.applyWinter?.(true)
    else soundRef.current?.applyTheme?.(scene.theme)
  }, [scene.theme, scene.winterMode])

  // Volume/Mute/Chime (wenn gestartet)
  useEffect(() => { if (audioStartedRef.current) soundRef.current?.setMasterVolume?.(volume) }, [volume])
  useEffect(() => { if (audioStartedRef.current) soundRef.current?.mute?.(muted) }, [muted])
  useEffect(() => { if (audioStartedRef.current) soundRef.current?.setChimeInterval?.(chimeRate) }, [chimeRate])

  // ---------- Repaints ----------
  useEffect(() => { repaintAll() }, [scene.theme, scene.winterMode])
  useEffect(() => { repaintPaths(scene.paths, scene.brush) }, [scene.paths, scene.brush])

  function repaintAll() {
    repaintSand()
    repaintGrain()
    repaintVignette()
    repaintPaths(scene.paths, scene.brush)
    drawOrSyncItems()
  }
  function repaintSand() {
    const app = appRef.current, g = sandRef.current; if (!app || !g) return
    g.clear()
    g.beginFill(scene.winterMode ? WINTER_SAND : THEMES[scene.theme])
    g.drawRect(0, 0, app.renderer.width, app.renderer.height)
    g.endFill()
  }
  function repaintVignette() {
    const app = appRef.current, v = vignetteRef.current; if (!app || !v) return
    const w = app.renderer.width, h = app.renderer.height
    v.clear()
    for (let i = 0; i < 6; i++) {
      const pad = 20 + i * 18
      const alpha = 0.06 - i * 0.008
      if (alpha <= 0) break
      v.beginFill(0x000000, alpha)
      v.drawRoundedRect(pad, pad, w - pad * 2, h - pad * 2, 26)
      v.endFill()
    }
  }
  function repaintGrain(recreate = true) {
    const app = appRef.current; if (!app) return
    const w = app.renderer.width, h = app.renderer.height
    if (!grainRef.current || recreate) {
      const spr = makeGrainSprite(w, h)
      if (grainRef.current && app.stage.children.includes(grainRef.current)) {
        app.stage.removeChild(grainRef.current)
        grainRef.current.destroy({ texture: true, baseTexture: true })
      }
      grainRef.current = spr
      const sandIdx = app.stage.getChildIndex(sandRef.current!)
      app.stage.addChildAt(spr, sandIdx + 1)
    } else {
      const spr = grainRef.current
      spr.width = w
      spr.height = h
    }
  }
  function repaintPaths(all: Point[][], width = 12) {
    const g = pathsRef.current; if (!g) return
    g.clear()
    const groove = (path: Point[]) => {
      const shadowOffset = width * 0.35
      const highlightOffset = -width * 0.35
      g.lineStyle(width * 0.65, 0xaeaaa0, 0.75)
      path.forEach((p, i) => { const x = p.x + shadowOffset, y = p.y + shadowOffset; i ? g.lineTo(x, y) : g.moveTo(x, y) })
      g.lineStyle(width * 0.5, 0xc9c3b5, 0.9)
      path.forEach((p, i) => { i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y) })
      g.lineStyle(width * 0.35, 0xffffff, 0.25)
      path.forEach((p, i) => { const x = p.x + highlightOffset, y = p.y + highlightOffset; i ? g.lineTo(x, y) : g.moveTo(x, y) })
    }
    all.forEach(groove)
  }
  function makeGrainSprite(w: number, h: number): Sprite {
    const tile = 140
    const canvas = document.createElement('canvas')
    canvas.width = tile
    canvas.height = tile
    const ctx = canvas.getContext('2d')!
    const img = ctx.createImageData(tile, tile)
    for (let i = 0; i < img.data.length; i += 4) {
      const n = 220 + Math.floor(Math.random() * 35)
      img.data[i] = n; img.data[i + 1] = n; img.data[i + 2] = n; img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    const spr = new Sprite(Texture.from(canvas))
    spr.alpha = 0.06; spr.width = w; spr.height = h; spr.eventMode = 'none'
    return spr
  }

  // ---------- Items: Render + Interaktion ----------
  useEffect(() => {
    drawOrSyncItems()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.items, scene.selectedId])

  function drawOrSyncItems() {
    const app = appRef.current
    if (!app) return
    const map = itemNodesRef.current
    const existing = new Set(map.keys())

    for (const it of scene.items) {
      let g = map.get(it.id)
      if (!g) {
        g = new Graphics()
        g.eventMode = 'static'
        g.cursor = 'grab'

        // Drag-Logik
        g.on('pointerdown', (e: FederatedPointerEvent) => {
          e.stopPropagation()
          soundRef.current?.clickUi?.()

          const start = { x: e.global.x, y: e.global.y }
          const origin = { x: it.x, y: it.y }
          setScene(s => ({ ...s, selectedId: it.id }))

          const onMove = (ev: FederatedPointerEvent) => {
            const p = ev.global
            const dx = p.x - start.x
            const dy = p.y - start.y
            setScene(s => ({
              ...s,
              items: s.items.map(n => n.id === it.id ? { ...n, x: origin.x + dx, y: origin.y + dy } : n),
            }))
          }
          const onUp = () => {
            app.stage.off('pointermove', onMove)
            app.stage.off('pointerup', onUp)
            app.stage.off('pointerupoutside', onUp)
            soundRef.current?.playDrop?.()
            snapshotCurrent(true)
          }
          app.stage.on('pointermove', onMove)
          app.stage.on('pointerup', onUp)
          app.stage.on('pointerupoutside', onUp)
        })

        app.stage.addChild(g)
        map.set(it.id, g)
      }

      drawItem(g, it, scene.selectedId === it.id)
      setHitArea(g, it)
      existing.delete(it.id)
    }

    existing.forEach(id => {
      const g = map.get(id)
      if (g && app!.stage.children.includes(g)) {
        app!.stage.removeChild(g)
        g.destroy()
      }
      map.delete(id)
    })

    // Sicherstellen, dass Items über Paths liegen
    for (const [, g] of map) {
      app.stage.setChildIndex(g, app.stage.children.length - 1)
    }
  }

  function drawItem(g: Graphics, it: Item, selected: boolean) {
    g.clear()

    const outline = (x: number, y: number, rx: number, ry?: number) => {
      g.lineStyle(2, 0x111111, 0.65)
      if (ry == null) g.drawCircle(x, y, rx)
      else g.drawEllipse(x, y, rx, ry)
    }
    const shadow = (x: number, y: number, rx: number, ry: number, a = 0.12) => {
      g.beginFill(0x000000, a); g.drawEllipse(x, y, rx, ry); g.endFill()
    }

    switch (it.kind) {
      // ---- Basis
      case 'stoneFlat': {
        const r = it.r ?? 26
        shadow(it.x + r * 0.06, it.y + r * 0.1, r * 1.15, r * 0.8, 0.1)
        g.beginFill(0x7a8f76); g.drawEllipse(it.x, it.y, r * 1.15, r * 0.8); g.endFill()
        g.lineStyle(2, 0xffffff, 0.18); g.drawEllipse(it.x - r * 0.25, it.y - r * 0.25, r * 0.75, r * 0.5)
        if (selected) outline(it.x, it.y, r * 1.25, r * 0.9)
        break
      }
      case 'stoneOval': {
        const r = it.r ?? 28
        shadow(it.x + r * 0.08, it.y + r * 0.12, r, r * 0.9, 0.12)
        g.beginFill(0x78947e); g.drawEllipse(it.x, it.y, r, r * 0.9); g.endFill()
        g.lineStyle(2, 0xffffff, 0.2); g.drawEllipse(it.x - r * 0.2, it.y - r * 0.2, r * 0.65, r * 0.58)
        if (selected) outline(it.x, it.y, r * 1.1, r)
        break
      }
      case 'stoneTall': {
        const r = it.r ?? 30
        shadow(it.x + r * 0.1, it.y + r * 0.15, r * 1.05, r * 0.9, 0.14)
        g.beginFill(0x6f8c78); g.drawCircle(it.x, it.y, r); g.endFill()
        g.lineStyle(2, 0xffffff, 0.22); g.drawCircle(it.x - r * 0.2, it.y - r * 0.2, r * 0.7)
        if (selected) outline(it.x, it.y, r * 1.1)
        break
      }
      case 'leaf': {
        const w = it.w ?? 52, h = it.h ?? 28
        shadow(it.x + 4, it.y + 7, w * 0.6, h * 0.55, 0.1)
        g.beginFill(0x8fae6e)
        g.moveTo(it.x, it.y - h / 2)
        g.quadraticCurveTo(it.x + w / 2, it.y, it.x, it.y + h / 2)
        g.quadraticCurveTo(it.x - w / 2, it.y, it.x, it.y - h / 2)
        g.endFill()
        g.lineStyle(2, 0xdde8cf, 0.7)
        g.moveTo(it.x - w * 0.2, it.y)
        g.quadraticCurveTo(it.x, it.y - h * 0.1, it.x + w * 0.25, it.y - h * 0.2)
        if (selected) outline(it.x, it.y, w * 0.7, h * 0.7)
        break
      }
      case 'lantern': {
        const w = it.w ?? 44, h = it.h ?? 64, x = it.x, y = it.y
        shadow(x + 6, y + h * 0.15, w * 0.8, h * 0.25, 0.12)
        g.beginFill(0x7e7a70); g.drawRoundedRect(x - w * 0.35, y + h * 0.1, w * 0.7, h * 0.18, 4); g.endFill()
        g.beginFill(0x8d897e); g.drawRoundedRect(x - w * 0.3, y - h * 0.2, w * 0.6, h * 0.45, 6); g.endFill()
        g.beginFill(0xffe9b0, 0.6); g.drawRoundedRect(x - w * 0.22, y - h * 0.08, w * 0.44, h * 0.22, 4); g.endFill()
        g.beginFill(0x6f6a62); g.drawPolygon([x - w * 0.45, y - h * 0.22, x + w * 0.45, y - h * 0.22, x, y - h * 0.38]); g.endFill()
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawRoundedRect(x - w * 0.5, y - h * 0.42, w, h * 0.75, 6)
        break
      }
      case 'rake': {
        const w = it.w ?? 58, h = it.h ?? 10, x = it.x, y = it.y
        shadow(x + 5, y + 4, w * 0.6, h * 1.2, 0.1)
        g.lineStyle(4, 0x8b6e49, 1); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2 - 12, y)
        g.lineStyle(3, 0x8b6e49, 1)
        const bx = x + w / 2 - 12, by = y
        for (let i = 0; i < 5; i++) { g.moveTo(bx, by - 6 + i * 3); g.lineTo(bx + 12, by - 6 + i * 3) }
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawEllipse(x, y, w * 0.65, h * 2.2)
        break
      }
      case 'waveRing': {
        const r = it.r ?? 34, rings = [r * 0.9, r * 1.15, r * 1.4]
        ;[0.25, 0.18, 0.12].forEach((alpha, idx) => { g.lineStyle(4 - idx, 0xcfc9ba, alpha); g.drawCircle(it.x, it.y, rings[idx]) })
        if (selected) outline(it.x, it.y, r * 1.55)
        break
      }

      // ---- Bestehend Premium
      case 'stoneBridge': {
        const x = it.x, y = it.y, w = it.w ?? 140, h = it.h ?? 36
        shadow(x + 10, y + 10, w * 0.45, h * 0.6, 0.1)
        g.beginFill(0x7d868e)
        g.moveTo(x - w / 2, y)
        g.quadraticCurveTo(x, y - h * 0.85, x + w / 2, y)
        g.lineTo(x + w / 2, y + h * 0.25)
        g.quadraticCurveTo(x, y - h * 0.6, x - w / 2, y + h * 0.25)
        g.closePath()
        g.endFill()
        g.beginFill(0x6f7a82)
        const archR = h * 0.38
        g.drawEllipse(x - w * 0.18, y + h * 0.05, archR, archR * 0.65)
        g.drawEllipse(x + w * 0.18, y + h * 0.05, archR, archR * 0.65)
        g.endFill()
        g.lineStyle(5, 0x707b84, 1)
        g.moveTo(x - w / 2 + 8, y - h * 0.5)
        g.quadraticCurveTo(x, y - h * 0.95, x + w / 2 - 8, y - h * 0.5)
        g.lineStyle(2, 0xffffff, 0.18)
        g.moveTo(x - w / 2 + 8, y - h * 0.52)
        g.quadraticCurveTo(x, y - h * 0.98, x + w / 2 - 8, y - h * 0.52)
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawRoundedRect(x - w/2 - 6, y - h*1.1, w + 12, h*1.5, 8)
        break
      }
      case 'zenBell': {
        const x = it.x, y = it.y, w = it.w ?? 70, h = it.h ?? 80
        shadow(x + 8, y + h * 0.35, w * 0.45, h * 0.25, 0.1)
        g.beginFill(0x7a5a3a)
        g.drawRect(x - w * 0.45, y - h * 0.55, w * 0.12, h * 0.9)
        g.drawRect(x + w * 0.33, y - h * 0.55, w * 0.12, h * 0.9)
        g.drawRect(x - w * 0.45, y - h * 0.55, w * 0.9, h * 0.09)
        g.endFill()
        g.beginFill(0x6a5e4a)
        const bw = w * 0.36, bh = h * 0.5
        g.moveTo(x - bw * 0.45, y - bh * 0.3)
        g.quadraticCurveTo(x, y - bh * 0.65, x + bw * 0.45, y - bh * 0.3)
        g.lineTo(x + bw * 0.38, y + bh * 0.25)
        g.quadraticCurveTo(x, y + bh * 0.35, x - bw * 0.38, y + bh * 0.25)
        g.closePath()
        g.endFill()
        g.lineStyle(4, 0x5a4f3f, 1); g.moveTo(x, y - bh * 0.6); g.lineTo(x, y - bh * 0.32)
        g.lineStyle(0); g.beginFill(0x3b3a36); g.drawCircle(x, y + bh * 0.15, 5); g.endFill()
        g.lineStyle(2, 0xffffff, 0.15)
        g.moveTo(x - bw * 0.2, y - bh * 0.15)
        g.quadraticCurveTo(x, y - bh * 0.35, x + bw * 0.2, y - bh * 0.15)
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawRoundedRect(x - w * 0.5, y - h * 0.65, w, h * 1.2, 8)
        break
      }

      // ---- NEU (Premium)
      case 'bonsaiTree': {
        const r = it.r ?? 40
        shadow(it.x + 6, it.y + 16, r * 1.2, r * 0.6, 0.12)
        g.beginFill(0x6b4226) // Stamm
        g.drawRect(it.x - 6, it.y - 4, 12, 28)
        g.endFill()
        g.beginFill(0x3e6b2f) // Krone
        g.drawCircle(it.x - r * 0.3, it.y - r * 0.6, r * 0.6)
        g.drawCircle(it.x + r * 0.25, it.y - r * 0.55, r * 0.5)
        g.drawCircle(it.x, it.y - r * 0.25, r * 0.55)
        g.endFill()
        g.beginFill(0x5b3b23) // Schale
        g.drawRoundedRect(it.x - r * 0.6, it.y + 18, r * 1.2, 12, 6)
        g.endFill()
        if (selected) outline(it.x, it.y, r * 1.1)
        break
      }
      case 'bambooFence': {
        const w = it.w ?? 160, h = it.h ?? 60, x = it.x, y = it.y
        shadow(x + 8, y + 12, w * 0.55, h * 0.35, 0.12)
        // Pfosten
        g.beginFill(0x9bbf6b)
        const posts = 5
        for (let i = 0; i < posts; i++) {
          const px = x - w / 2 + (i * w) / (posts - 1)
          g.drawRoundedRect(px - 6, y - h / 2, 12, h, 6)
          // Knoten
          g.beginFill(0x7fa95a)
          g.drawRoundedRect(px - 8, y - h * 0.1, 16, 8, 4)
          g.endFill()
          g.beginFill(0x9bbf6b)
        }
        g.endFill()
        // Querstreben
        g.beginFill(0x86a95a)
        g.drawRoundedRect(x - w / 2, y - h * 0.25, w, 10, 5)
        g.drawRoundedRect(x - w / 2, y + h * 0.15, w, 10, 5)
        g.endFill()
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawRoundedRect(x - w/2 - 6, y - h/2 - 6, w + 12, h + 12, 8)
        break
      }
      case 'toriiGate': {
        const w = it.w ?? 160, h = it.h ?? 110, x = it.x, y = it.y
        shadow(x + 12, y + h * 0.25, w * 0.6, h * 0.3, 0.12)
        // Säulen
        g.beginFill(0x8b1a1a)
        g.drawRoundedRect(x - w * 0.35, y - h * 0.1, 16, h * 0.7, 6)
        g.drawRoundedRect(x + w * 0.35 - 16, y - h * 0.1, 16, h * 0.7, 6)
        // Querbalken
        g.drawRoundedRect(x - w * 0.5, y - h * 0.35, w, 16, 8)
        g.drawRoundedRect(x - w * 0.4, y - h * 0.2, w * 0.8, 12, 6)
        g.endFill()
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawRoundedRect(x - w/2 - 6, y - h*0.45, w + 12, h, 10)
        break
      }
      case 'kitsuneStatue': {
        const x = it.x, y = it.y, w = it.w ?? 70, h = it.h ?? 90
        shadow(x + 10, y + h * 0.3, w * 0.5, h * 0.3, 0.12)
        // Podest
        g.beginFill(0x9a9a9a); g.drawRoundedRect(x - w * 0.35, y + h * 0.15, w * 0.7, h * 0.18, 6); g.endFill()
        // Körper
        g.beginFill(0x9f9f9f)
        g.drawEllipse(x, y, w * 0.25, h * 0.35)
        g.endFill()
        // Kopf + Ohren
        g.beginFill(0xaaaaaa)
        g.drawCircle(x, y - h * 0.35, w * 0.18)
        g.drawPolygon([x - w*0.18, y - h*0.38, x - w*0.08, y - h*0.55, x - w*0.02, y - h*0.38])
        g.drawPolygon([x + w*0.18, y - h*0.38, x + w*0.08, y - h*0.55, x + w*0.02, y - h*0.38])
        g.endFill()
        // Schwanz
        g.beginFill(0xb0b0b0)
        g.drawEllipse(x + w * 0.22, y + h * 0.05, w * 0.18, h * 0.25)
        g.endFill()
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawRoundedRect(x - w*0.5, y - h*0.65, w, h*1.1, 8)
        break
      }
      case 'buddhaStatue': {
        const x = it.x, y = it.y, w = it.w ?? 80, h = it.h ?? 100
        shadow(x + 10, y + h * 0.35, w * 0.55, h * 0.3, 0.12)
        // Podest
        g.beginFill(0x8f8f8f); g.drawRoundedRect(x - w * 0.4, y + h * 0.2, w * 0.8, h * 0.2, 10); g.endFill()
        // Körper
        g.beginFill(0x9e9e9e)
        g.drawEllipse(x, y + h * 0.05, w * 0.35, h * 0.35)
        g.endFill()
        // Kopf
        g.beginFill(0xa8a8a8); g.drawCircle(x, y - h * 0.25, w * 0.18); g.endFill()
        // Schultern
        g.lineStyle(5, 0xb0b0b0, 0.6)
        g.moveTo(x - w * 0.35, y); g.quadraticCurveTo(x, y - h * 0.05, x + w * 0.35, y)
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawRoundedRect(x - w*0.5, y - h*0.55, w, h*1.1, 10)
        break
      }
      case 'koiPond': {
        const x = it.x, y = it.y, w = it.w ?? 180, h = it.h ?? 110
        shadow(x + 8, y + 10, w * 0.6, h * 0.35, 0.12)
        // Rand
        g.beginFill(0x7f7a70); g.drawEllipse(x, y, w * 0.55, h * 0.4); g.endFill()
        // Wasser
        g.beginFill(0x7cc6e6); g.drawEllipse(x, y, w * 0.48, h * 0.33); g.endFill()
        // Kois (bunte Bögen)
        g.lineStyle(4, 0xffffff, 0.9)
        g.moveTo(x - w * 0.15, y - h * 0.05); g.quadraticCurveTo(x - w * 0.05, y - h * 0.12, x + w * 0.02, y - h * 0.02)
        g.lineStyle(4, 0xff7043, 0.9)
        g.moveTo(x + w * 0.1, y + h * 0.02); g.quadraticCurveTo(x + w * 0.18, y + h * 0.07, x + w * 0.22, y - h * 0.02)
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawEllipse(x, y, w * 0.6, h * 0.45)
        break
      }
      case 'winterPond': {
        const x = it.x, y = it.y, w = it.w ?? 180, h = it.h ?? 110
        shadow(x + 8, y + 10, w * 0.6, h * 0.35, 0.12)
        g.beginFill(0x7f7a70); g.drawEllipse(x, y, w * 0.55, h * 0.4); g.endFill()
        g.beginFill(0xd6f0ff); g.drawEllipse(x, y, w * 0.48, h * 0.33); g.endFill() // Eis
        // Schneehaube
        g.beginFill(0xffffff, 0.85)
        g.drawEllipse(x - w * 0.02, y - h * 0.02, w * 0.42, h * 0.28)
        g.endFill()
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawEllipse(x, y, w * 0.6, h * 0.45)
        break
      }
      case 'snowman': {
        const x = it.x, y = it.y, r = it.r ?? 22
        shadow(x + 6, y + r * 2.2, r * 1.6, r * 0.9, 0.12)
        g.beginFill(0xffffff); g.drawCircle(x, y + r * 1.2, r * 1.1); g.drawCircle(x, y, r); g.endFill()
        g.beginFill(0x000000); g.drawCircle(x - r * 0.3, y - r * 0.15, 2.6); g.drawCircle(x + r * 0.3, y - r * 0.15, 2.6); g.endFill()
        g.beginFill(0xff8a00); g.drawPolygon([x, y + 2, x + r * 0.6, y + 4, x, y + 6]); g.endFill() // Nase
        // Hut
        g.beginFill(0x222222); g.drawRect(x - r * 0.6, y - r * 0.55, r * 1.2, 6); g.drawRect(x - r * 0.35, y - r, r * 0.7, r * 0.4); g.endFill()
        if (selected) outline(x, y + r * 0.6, r * 1.5)
        break
      }
      case 'autumnLeaves': {
        const x = it.x, y = it.y, w = it.w ?? 120, h = it.h ?? 70
        shadow(x + 6, y + 10, w * 0.5, h * 0.3, 0.09)
        const spots = 14
        for (let i = 0; i < spots; i++) {
          const px = x - w/2 + Math.random() * w
          const py = y - h/2 + Math.random() * h
          const col = [0xd35400, 0xe67e22, 0xc0392b, 0xb03a2e][i % 4]
          g.beginFill(col, 0.9)
          g.drawEllipse(px, py, 5 + Math.random()*6, 3 + Math.random()*4)
          g.endFill()
        }
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawRoundedRect(x - w/2 - 6, y - h/2 - 6, w + 12, h + 12, 8)
        break
      }
      case 'mapleTree': {
        const x = it.x, y = it.y, w = it.w ?? 100, h = it.h ?? 130
        shadow(x + 10, y + h * 0.35, w * 0.6, h * 0.35, 0.12)
        // Stamm
        g.beginFill(0x6b4226); g.drawRect(x - 8, y + h * 0.05, 16, h * 0.35); g.endFill()
        // Krone (Ahorn – rötlich)
        g.beginFill(0xb3392f)
        g.drawCircle(x, y - h * 0.15, h * 0.28)
        g.drawCircle(x - w * 0.25, y - h * 0.05, h * 0.22)
        g.drawCircle(x + w * 0.25, y - h * 0.05, h * 0.22)
        g.drawCircle(x, y - h * 0.35, h * 0.18)
        g.endFill()
        g.lineStyle(2, 0xffffff, 0.12)
        g.moveTo(x, y - h * 0.15); g.lineTo(x, y + h * 0.08)
        if (selected) g.lineStyle(2, 0x111111, 0.65), g.drawRoundedRect(x - w*0.5, y - h*0.55, w, h*1.1, 10)
        break
      }
    }
  }

  function setHitArea(g: Graphics, it: Item) {
    switch (it.kind) {
      case 'stoneFlat':
      case 'stoneOval':
      case 'stoneTall':
      case 'waveRing':
      case 'snowman':
        g.hitArea = new Circle(it.x, it.y, (it.r ?? 30) * 1.3)
        break
      case 'koiPond':
      case 'winterPond':
        g.hitArea = new Rectangle(it.x - (it.w ?? 180)*0.55, it.y - (it.h ?? 110)*0.4, (it.w ?? 180)*1.1, (it.h ?? 110)*0.8)
        break
      default: {
        const w = it.w ?? 120, h = it.h ?? 90
        g.hitArea = new Rectangle(it.x - w/2, it.y - h/2, w, h)
        break
      }
    }
  }

  // ---------- Items hinzufügen / löschen ----------
  function canAddMoreItems() {
    const limit = hasPremium ? ITEM_LIMIT_PREMIUM : ITEM_LIMIT_GUEST
    return scene.items.length < limit
  }

  function addItem(kind: ItemKind) {
    const allowed = hasPremium ? [...BASE_ITEMS, ...PREMIUM_ITEMS] : [...BASE_ITEMS]
    if (!allowed.includes(kind)) { toast.info('Dieses Objekt ist Premium.'); return }
    if (!canAddMoreItems()) { toast.info('Limit erreicht.'); return }

    const app = appRef.current, W = app?.renderer.width ?? 800, H = app?.renderer.height ?? 600
    const i = scene.items.length
    const phi = Math.PI * (3 - Math.sqrt(5))
    const r = 0.42 * Math.min(W, H) * Math.sqrt((i + 1) / 12)
    const a = i * phi
    const cx = W * 0.5, cy = H * 0.5
    let x = cx + r * Math.cos(a), y = cy + r * Math.sin(a)
    const pad = 28
    x = Math.max(pad, Math.min(W - pad, x))
    y = Math.max(pad, Math.min(H - pad, y))

    const base: Item = { id: crypto.randomUUID(), kind, x, y }
    switch (kind) {
      // Basisgrößen
      case 'stoneFlat': base.r = 26; break
      case 'stoneOval': base.r = 28; break
      case 'stoneTall': base.r = 30; break
      case 'leaf': base.w = 52; base.h = 28; break
      case 'lantern': base.w = 44; base.h = 64; break
      case 'rake': base.w = 58; base.h = 10; break
      case 'waveRing': base.r = 34; break
      // Bestehend Premium
      case 'stoneBridge': base.w = 140; base.h = 36; break
      case 'zenBell': base.w = 70; base.h = 80; break
      // Neu Premium
      case 'bonsaiTree': base.r = 40; break
      case 'bambooFence': base.w = 160; base.h = 60; break
      case 'toriiGate': base.w = 160; base.h = 110; break
      case 'kitsuneStatue': base.w = 70; base.h = 90; break
      case 'buddhaStatue': base.w = 80; base.h = 100; break
      case 'koiPond': base.w = 180; base.h = 110; break
      case 'winterPond': base.w = 180; base.h = 110; break
      case 'snowman': base.r = 22; break
      case 'autumnLeaves': base.w = 120; base.h = 70; break
      case 'mapleTree': base.w = 100; base.h = 130; break
    }

    setScene(s => {
      const n = { ...s, items: [...s.items, base], selectedId: base.id }
      snapshotCurrent(false, n)
      soundRef.current?.clickUi?.()
      return n
    })
  }

  function clearPaths() {
    setScene(s => { const n = { ...s, paths: [] }; snapshotCurrent(false, n); soundRef.current?.clickUi?.(); return n })
  }
  function removeSelected() {
    setScene(s => {
      if (!s.selectedId) return s
      const n = { ...s, items: s.items.filter(i => i.id !== s.selectedId), selectedId: null }
      snapshotCurrent(false, n)
      soundRef.current?.clickUi?.()
      return n
    })
  }

  // ---------- Local Save / Load / Export ----------
  function saveLocal() {
    localStorage.setItem('zen.scene', JSON.stringify(scene))
    soundRef.current?.clickUi?.()
    toast.success('Lokal gespeichert')
  }
  function loadLocal() {
    const raw = localStorage.getItem('zen.scene'); if (!raw) return
    try {
      const d = JSON.parse(raw) as SceneState
      setScene(d)
      snapshotCurrent(true, d)
      soundRef.current?.clickUi?.()
      toast.success('Lokal geladen')
    } catch {
      toast.error('Konnte lokalen Speicher nicht laden')
    }
  }
  function exportPNG() {
    const app = appRef.current; if (!app) return
    try {
      const canvas: HTMLCanvasElement = (app.renderer as any).extract.canvas(app.stage)
      canvas.toBlob((blob) => {
        if (!blob) { toast.error('Konnte PNG nicht erzeugen.'); return }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `zen-garden-${Date.now()}.png`
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
        soundRef.current?.clickUi?.()
        toast.success('PNG exportiert')
      }, 'image/png')
    } catch (e) {
      toast.error('Export fehlgeschlagen')
      console.error(e)
    }
  }

  // ---------- Upload + Persist ----------
  async function share() {
    const app = appRef.current
    if (!app) return toast.error('Kein Canvas')
    if (!isAuthed) { toast.info('Bitte zuerst einloggen'); openLogin(); return }

    const title = prompt('Titel für deinen Garden?') ?? 'Mein Zen Garden'

    const canvas: HTMLCanvasElement = (app.renderer as any).extract.canvas(app.stage)
    const blob: Blob = await new Promise((res, rej) =>
      canvas.toBlob(b => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png')
    )

    const up = await fetch('/api/upload?ct=image/png', { method: 'POST', body: blob })
    if (up.status === 401) { toast.info('Bitte zuerst einloggen'); openLogin(); return }
    if (!up.ok) { toast.error('Upload fehlgeschlagen'); return }
    const { url } = (await up.json()) as { url: string }

    const res = await fetch('/api/gardens', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title, coverUrl: url, dataJson: scene, isPublic: true }),
    })
    if (res.status === 401) { toast.info('Bitte zuerst einloggen'); openLogin(); return }
    if (!res.ok) { toast.error('Speichern fehlgeschlagen'); return }
    const { id } = (await res.json()) as { id: string }
    soundRef.current?.clickUi?.()
    toast.success('In die Galerie gespeichert ✨')
    location.href = `/g/${id}`
  }

  // ---------- Snapshot Helper ----------
  function snapshotCurrent(dedupe = true, forced?: SceneState) {
    snapshot(forced ?? scene, dedupe)
  }

  // --- robustes Winter-Toggle ---
  function toggleWinter() {
    if (!winterUnlocked) {
      toast.info('Winter ist nur mit Premium (im Dezember gratis).')
      return
    }
    tryStartAudio()
    setScene(s => {
      const next = { ...s, winterMode: !s.winterMode }
      if (audioStartedRef.current) {
        if (next.winterMode) soundRef.current?.applyWinter?.(true)
        else soundRef.current?.applyTheme?.(next.theme)
      }
      return next
    })
  }

  // ---------- Render ----------
  const rootStyle: React.CSSProperties = { position: 'relative', width: '100dvw', height: '100dvh', overflow: 'hidden' }

  return (
    <div style={rootStyle}>
      <AuthForm open={loginOpen} onClose={() => setLoginOpen(false)} />
      <div ref={hostRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      <GardenToolbar
        theme={scene.theme}
        setTheme={(t) => setScene(s => {
          const n = { ...s, theme: t }
          if (audioStartedRef.current && !s.winterMode) {
            soundRef.current?.applyTheme?.(t)
          }
          repaintSand()
          return n
        })}
        winterMode={scene.winterMode}
        toggleWinter={toggleWinter}
        addItem={addItem}
        clearPaths={clearPaths}
        saveLocal={saveLocal}
        loadLocal={loadLocal}
        exportPNG={exportPNG}
        removeSelected={removeSelected}
        selectedId={scene.selectedId}
        share={share}
        isAuthed={isAuthed}
        hasPremium={hasPremium}
        openLogin={openLogin}
        volume={volume}
        onVolumeChange={(v) => { setVolume(v); if (audioStartedRef.current) soundRef.current?.setMasterVolume?.(v) }}
        muted={muted}
        onMuteToggle={() => { const m = !muted; setMuted(m); if (audioStartedRef.current) soundRef.current?.mute?.(m) }}
        chimeRate={chimeRate}
        onChimeRateChange={(v) => { setChimeRate(v); if (audioStartedRef.current) soundRef.current?.setChimeInterval?.(v) }}
      />
    </div>
  )
}
