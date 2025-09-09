// src/components/canvas/PixiGardenPlain.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Application,
  Graphics,
  Sprite,
  Texture,
  Circle,
  Rectangle,
  FederatedPointerEvent,
} from 'pixi.js'

import { createSound } from '../../lib/sound'
import DailyCard from '../ui/DailyCard'

type Point = { x: number; y: number }
type ThemeKey = keyof typeof THEMES

type ItemKind =
  | 'stoneFlat'
  | 'stoneOval'
  | 'stoneTall'
  | 'leaf'
  | 'lantern'
  | 'rake'
  | 'waveRing'

type Item = {
  id: string
  kind: ItemKind
  x: number
  y: number
  r?: number
  w?: number
  h?: number
  angle?: number
}

type SceneState = {
  theme: ThemeKey
  brush: number
  paths: Point[][]
  items: Item[]
  selectedId: string | null
}

const THEMES = {
  morning: 0xf0ebdd,
  day: 0xe9e3d5,
  dusk: 0xe5ded7,
  night: 0xd8d3c6,
} as const

export default function PixiGardenPlain() {
  const hostRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)

  const sandRef = useRef<Graphics | null>(null)
  const grainRef = useRef<Sprite | null>(null)
  const vignetteRef = useRef<Graphics | null>(null)
  const pathsRef = useRef<Graphics | null>(null)
  const itemNodesRef = useRef<Map<string, Graphics>>(new Map())

  const [theme, setTheme] = useState<ThemeKey>('day')
  const [brush, setBrush] = useState<number>(12)
  const [paths, setPaths] = useState<Point[][]>([])
  const [items, setItems] = useState<Item[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [menuOpen, setMenuOpen] = useState<boolean>(true)
  const drawingRef = useRef(false)

  const [dailyOpen, setDailyOpen] = useState<boolean>(true)

  const soundRef = useRef<ReturnType<typeof createSound> | null>(null)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [chimeRate, setChimeRate] = useState(12)

  const undoRef = useRef<SceneState[]>([])
  const redoRef = useRef<SceneState[]>([])
  const HISTORY_MAX = 80

  useEffect(() => {
    if (!hostRef.current) return

    const app = new Application({
      backgroundColor: THEMES[theme],
      resizeTo: window,
      antialias: true,
    } as unknown as Partial<Application>) as Application
    appRef.current = app
    hostRef.current.appendChild(app.view as HTMLCanvasElement)

    const sand = new Graphics()
    const grain = makeGrainSprite(app.renderer.width, app.renderer.height)
    const vignette = new Graphics()
    const pathsG = new Graphics()
    app.stage.addChild(sand, grain, vignette, pathsG)
    sandRef.current = sand
    grainRef.current = grain
    vignetteRef.current = vignette
    pathsRef.current = pathsG
    grain.eventMode = 'none'
    vignette.eventMode = 'none'

    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen

    const onDown = (e: FederatedPointerEvent) => {
      if (e.target !== app.stage) return
      const p = e.global
      drawingRef.current = true
      setPaths(prev => [...prev, [{ x: p.x, y: p.y }]])
      setSelectedId(null)
      soundRef.current?.playRake()
    }
    const onMove = (e: FederatedPointerEvent) => {
      if (!drawingRef.current) return
      const p = e.global
      setPaths(prev => {
        if (!prev.length) return prev
        const last = prev[prev.length - 1]
        const lp = last[last.length - 1]
        if (!lp || lp.x !== p.x || lp.y !== p.y) {
          return prev.slice(0, -1).concat([[...last, { x: p.x, y: p.y }]])
        }
        return prev
      })
    }
    const onUp = () => {
      if (drawingRef.current) pushHistory()
      drawingRef.current = false
    }

    app.stage.on('pointerdown', onDown)
    app.stage.on('pointermove', onMove)
    app.stage.on('pointerup', onUp)
    app.stage.on('pointerupoutside', onUp)

    const onKey = (ev: KeyboardEvent) => {
      const mod = ev.metaKey || ev.ctrlKey
      const key = ev.key.toLowerCase()
      if (mod && key === 'z') {
        ev.preventDefault()
        undo()
        return
      }
      if (mod && key === 'y') {
        ev.preventDefault()
        redo()
        return
      }
      if (ev.key === 'Delete' || ev.key === 'Backspace') {
        ev.preventDefault()
        removeSelected()
        return
      }
      if (mod && key === 's') {
        ev.preventDefault()
        exportPNG()
        return
      }
      if (key === 'm') {
        ev.preventDefault()
        setMenuOpen(v => !v)
        return
      }
      if (ev.key === 'Escape') {
        setMenuOpen(false)
        return
      }
    }
    window.addEventListener('keydown', onKey)

    soundRef.current = createSound({
      wind: '/sounds/wind.mp3',
      birds: '/sounds/birds.mp3',
      chimes: '/sounds/chimes.mp3',
      water: '/sounds/water.mp3',
      crickets: '/sounds/crickets.mp3',
      rake: '/sounds/rake.mp3',
      gravel: '/sounds/gravel.mp3',
      bamboo: '/sounds/bamboo.mp3',
      click: '/sounds/click.mp3',
    })

    app.stage.once('pointerdown', async () => {
      try {
        await soundRef.current?.start()
        soundRef.current?.setMasterVolume(volume)
        soundRef.current?.setChimeInterval(chimeRate)
        soundRef.current?.applyTheme(theme)
      } catch {}
    })

    repaintSand()
    repaintGrain()
    repaintVignette()
    repaintPaths(paths)
    pushHistory(true)

    return () => {
      window.removeEventListener('keydown', onKey)
      app.destroy(true)
      appRef.current = null
      sandRef.current = null
      pathsRef.current = null
      grainRef.current = null
      vignetteRef.current = null
      itemNodesRef.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    repaintSand()
    repaintVignette()
    soundRef.current?.applyTheme(theme)
  }, [theme])
  useEffect(() => {
    repaintPaths(paths, brush)
  }, [paths, brush])
  useEffect(() => {
    const on = () => {
      repaintSand()
      repaintGrain(true)
      repaintVignette()
      repaintPaths(paths, brush)
    }
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paths, brush, theme])

  useEffect(() => {
    const app = appRef.current
    if (!app) return
    const map = itemNodesRef.current
    const existing = new Set(map.keys())

    items.forEach(it => {
      let g = map.get(it.id)
      if (!g) {
        g = new Graphics()
        g.eventMode = 'static'
        g.cursor = 'grab'
        g.on('pointerdown', (e: FederatedPointerEvent) => {
          e.stopPropagation()
          setSelectedId(it.id)
          g!.cursor = 'grabbing'
          const start = { x: e.global.x, y: e.global.y }
          const origin = { x: it.x, y: it.y }
          const onMove = (ev: FederatedPointerEvent) => {
            const p = ev.global
            const dx = p.x - start.x
            const dy = p.y - start.y
            setItems(prev =>
              prev.map(s => (s.id === it.id ? { ...s, x: origin.x + dx, y: origin.y + dy } : s)),
            )
          }
          const onUp = () => {
            g!.cursor = 'grab'
            app.stage.off('pointermove', onMove)
            app.stage.off('pointerup', onUp)
            app.stage.off('pointerupoutside', onUp)
            soundRef.current?.playDrop()
            pushHistory()
          }
          app.stage.on('pointermove', onMove)
          app.stage.on('pointerup', onUp)
          app.stage.on('pointerupoutside', onUp)
        })
        app.stage.addChild(g)
        map.set(it.id, g)
      }

      drawItem(g, it, selectedId === it.id)
      setHitArea(g, it)
      existing.delete(it.id)
    })

    existing.forEach(id => {
      const g = map.get(id)
      if (g && app.stage.children.includes(g)) {
        app.stage.removeChild(g)
        g.destroy()
      }
      map.delete(id)
    })
  }, [items, selectedId])

  function repaintSand() {
    const app = appRef.current
    const sand = sandRef.current
    if (!app || !sand) return
    sand.clear()
    sand.beginFill(THEMES[theme])
    sand.drawRect(0, 0, app.renderer.width, app.renderer.height)
    sand.endFill()
  }
  function repaintVignette() {
    const app = appRef.current
    const v = vignetteRef.current
    if (!app || !v) return
    const w = app.renderer.width
    const h = app.renderer.height
    v.clear()
    const steps = 6
    for (let i = 0; i < steps; i++) {
      const pad = 20 + i * 18
      const alpha = 0.06 - i * 0.008
      if (alpha <= 0) break
      v.beginFill(0x000000, alpha)
      v.drawRoundedRect(pad, pad, w - pad * 2, h - pad * 2, 26)
      v.endFill()
    }
  }
  function repaintGrain(recreate = false) {
    const app = appRef.current
    if (!app) return
    const w = app.renderer.width
    const h = app.renderer.height
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
    const g = pathsRef.current
    if (!g) return
    g.clear()
    const groove = (path: Point[]) => {
      const shadowOffset = width * 0.35
      const highlightOffset = -width * 0.35

      // Schatten (unten rechts)
      g.lineStyle(width * 0.65, 0xaeaaa0, 0.75)
      path.forEach((p, i) => {
        const x = p.x + shadowOffset
        const y = p.y + shadowOffset
        if (i === 0) g.moveTo(x, y)
        else g.lineTo(x, y)
      })

      // Mittelton
      g.lineStyle(width * 0.5, 0xc9c3b5, 0.9)
      path.forEach((p, i) => {
        if (i === 0) g.moveTo(p.x, p.y)
        else g.lineTo(p.x, p.y)
      })

      // Highlight (oben links)
      g.lineStyle(width * 0.35, 0xffffff, 0.25)
      path.forEach((p, i) => {
        const x = p.x + highlightOffset
        const y = p.y + highlightOffset
        if (i === 0) g.moveTo(x, y)
        else g.lineTo(x, y)
      })
    }
    all.forEach(groove)
  }

  function drawItem(g: Graphics, it: Item, selected: boolean) {
    g.clear()
    const shadow = (ox = 0, oy = 0, a = 0.12) => {
      g.beginFill(0x000000, a)
      g.drawEllipse(it.x + ox, it.y + oy, (it.r ?? 28) * 1.05, (it.r ?? 28) * 0.85)
      g.endFill()
    }
    switch (it.kind) {
      case 'stoneFlat': {
        const r = it.r ?? 26
        shadow(r * 0.06, r * 0.1, 0.1)
        g.beginFill(0x7a8f76)
        g.drawEllipse(it.x, it.y, r * 1.15, r * 0.8)
        g.endFill()
        g.lineStyle({ width: 2, color: 0xffffff, alpha: 0.18 } as any) // nur für Outline: TS erlaubt hier Objekt
        g.drawEllipse(it.x - r * 0.25, it.y - r * 0.25, r * 0.75, r * 0.5)
        if (selected) outline(g, it.x, it.y, r * 1.25, r * 0.9)
        break
      }
      case 'stoneOval': {
        const r = it.r ?? 28
        shadow(r * 0.08, r * 0.12, 0.12)
        g.beginFill(0x78947e)
        g.drawEllipse(it.x, it.y, r, r * 0.9)
        g.endFill()
        g.lineStyle({ width: 2, color: 0xffffff, alpha: 0.2 } as any)
        g.drawEllipse(it.x - r * 0.2, it.y - r * 0.2, r * 0.65, r * 0.58)
        if (selected) outline(g, it.x, it.y, r * 1.1, r)
        break
      }
      case 'stoneTall': {
        const r = it.r ?? 30
        shadow(r * 0.1, r * 0.15, 0.14)
        g.beginFill(0x6f8c78)
        g.drawCircle(it.x, it.y, r)
        g.endFill()
        g.lineStyle({ width: 2, color: 0xffffff, alpha: 0.22 } as any)
        g.drawCircle(it.x - r * 0.2, it.y - r * 0.2, r * 0.7)
        if (selected) outline(g, it.x, it.y, r * 1.1, r * 1.1, true)
        break
      }
      case 'leaf': {
        const w = it.w ?? 52
        const h = it.h ?? 28
        g.beginFill(0x000000, 0.1)
        g.drawEllipse(it.x + 4, it.y + 7, w * 0.6, h * 0.55)
        g.endFill()
        g.beginFill(0x8fae6e)
        g.moveTo(it.x, it.y - h / 2)
        g.quadraticCurveTo(it.x + w / 2, it.y, it.x, it.y + h / 2)
        g.quadraticCurveTo(it.x - w / 2, it.y, it.x, it.y - h / 2)
        g.endFill()
        g.lineStyle({ width: 2, color: 0xdde8cf, alpha: 0.7 } as any)
        g.moveTo(it.x - w * 0.2, it.y)
        g.quadraticCurveTo(it.x, it.y - h * 0.1, it.x + w * 0.25, it.y - h * 0.2)
        if (selected) outline(g, it.x, it.y, w * 0.7, h * 0.7)
        break
      }
      case 'lantern': {
        const w = it.w ?? 44
        const h = it.h ?? 64
        const x = it.x
        const y = it.y
        g.beginFill(0x000000, 0.12)
        g.drawEllipse(x + 6, y + h * 0.15, w * 0.8, h * 0.25)
        g.endFill()
        g.beginFill(0x7e7a70)
        g.drawRoundedRect(x - w * 0.35, y + h * 0.1, w * 0.7, h * 0.18, 4)
        g.endFill()
        g.beginFill(0x8d897e)
        g.drawRoundedRect(x - w * 0.3, y - h * 0.2, w * 0.6, h * 0.45, 6)
        g.endFill()
        g.beginFill(0xffe9b0, 0.6)
        g.drawRoundedRect(x - w * 0.22, y - h * 0.08, w * 0.44, h * 0.22, 4)
        g.endFill()
        g.beginFill(0x6f6a62)
        g.drawPolygon([x - w * 0.45, y - h * 0.22, x + w * 0.45, y - h * 0.22, x, y - h * 0.38])
        g.endFill()
        if (selected) outlineRect(g, x - w * 0.5, y - h * 0.42, w, h * 0.75)
        break
      }
      case 'rake': {
        const w = it.w ?? 58
        const h = it.h ?? 10
        const x = it.x
        const y = it.y
        g.beginFill(0x000000, 0.1)
        g.drawEllipse(x + 5, y + 4, w * 0.6, h * 1.2)
        g.endFill()
        g.lineStyle(4, 0x8b6e49, 1)
        g.moveTo(x - w / 2, y)
        g.lineTo(x + w / 2 - 12, y)
        g.lineStyle(3, 0x8b6e49, 1)
        const bx = x + w / 2 - 12
        const by = y
        for (let i = 0; i < 5; i++) {
          g.moveTo(bx, by - 6 + i * 3)
          g.lineTo(bx + 12, by - 6 + i * 3)
        }
        if (selected) outline(g, x, y, w * 0.65, h * 2.2)
        break
      }
      case 'waveRing': {
        const r = it.r ?? 34
        const rings = [r * 0.9, r * 1.15, r * 1.4]
        ;[0.25, 0.18, 0.12].forEach((alpha, idx) => {
          g.lineStyle(4 - idx, 0xcfc9ba, alpha)
          g.drawCircle(it.x, it.y, rings[idx])
        })
        if (selected) outline(g, it.x, it.y, r * 1.55, r * 1.55, true)
        break
      }
    }
  }

  function outline(g: Graphics, x: number, y: number, rx: number, ry: number, circle = false) {
    g.lineStyle(2, 0x111111, 0.7)
    if (circle) g.drawCircle(x, y, rx)
    else g.drawEllipse(x, y, rx, ry)
  }
  function outlineRect(g: Graphics, x: number, y: number, w: number, h: number) {
    g.lineStyle(2, 0x111111, 0.7)
    g.drawRoundedRect(x, y, w, h, 6)
  }

  function setHitArea(g: Graphics, it: Item) {
    switch (it.kind) {
      case 'stoneFlat':
      case 'stoneOval':
      case 'stoneTall':
      case 'waveRing':
        g.hitArea = new Circle(it.x, it.y, (it.r ?? 28) * 1.2)
        break
      case 'leaf':
        g.hitArea = new Rectangle(
          it.x - (it.w ?? 48) / 2,
          it.y - (it.h ?? 26) / 2,
          it.w ?? 48,
          it.h ?? 26,
        )
        break
      case 'lantern':
        g.hitArea = new Rectangle(
          it.x - (it.w ?? 42) / 2,
          it.y - (it.h ?? 60) / 2,
          it.w ?? 42,
          it.h ?? 60,
        )
        break
      case 'rake':
        g.hitArea = new Rectangle(it.x - (it.w ?? 54) / 2, it.y - 12, it.w ?? 54, 24)
        break
    }
  }

  function addItem(kind: ItemKind) {
    const app = appRef.current
    const w = app?.renderer.width ?? 800
    const h = app?.renderer.height ?? 600
    const i = items.length
    const phi = Math.PI * (3 - Math.sqrt(5))
    const r = 0.42 * Math.min(w, h) * Math.sqrt((i + 1) / 12)
    const a = i * phi
    const cx = w * 0.5
    const cy = h * 0.5
    let x = cx + r * Math.cos(a)
    let y = cy + r * Math.sin(a)
    const pad = 28
    x = Math.max(pad, Math.min(w - pad, x))
    y = Math.max(pad, Math.min(h - pad, y))
    const base: Item = { id: crypto.randomUUID(), kind, x, y }
    switch (kind) {
      case 'stoneFlat':
        base.r = 26
        break
      case 'stoneOval':
        base.r = 28
        break
      case 'stoneTall':
        base.r = 30
        break
      case 'leaf':
        base.w = 52
        base.h = 28
        base.angle = (Math.random() - 0.5) * 0.6
        break
      case 'lantern':
        base.w = 44
        base.h = 64
        break
      case 'rake':
        base.w = 58
        base.h = 10
        base.angle = (Math.random() - 0.5) * 0.3
        break
      case 'waveRing':
        base.r = 34
        break
    }
    setItems(s => {
      const next = [...s, base]
      queueMicrotask(pushHistory)
      return next
    })
    setSelectedId(base.id)
    soundRef.current?.clickUi()
  }

  function removeSelected() {
    if (!selectedId) return
    setItems(s => {
      const next = s.filter(i => i.id !== selectedId)
      queueMicrotask(pushHistory)
      return next
    })
    setSelectedId(null)
    soundRef.current?.clickUi()
  }

  function clearRidges() {
    setPaths([])
    pushHistory()
    soundRef.current?.clickUi()
  }

  function saveScene() {
    const data: SceneState = { theme, brush, paths, items, selectedId }
    localStorage.setItem('zen.scene', JSON.stringify(data))
    soundRef.current?.clickUi()
  }
  function loadScene() {
    const raw = localStorage.getItem('zen.scene')
    if (!raw) return
    try {
      const d = JSON.parse(raw) as SceneState
      setTheme(d.theme)
      setBrush(d.brush)
      setPaths(d.paths)
      setItems(d.items)
      setSelectedId(d.selectedId ?? null)
      queueMicrotask(() => pushHistory(true))
      soundRef.current?.clickUi()
    } catch {}
  }

  function exportPNG() {
    const app = appRef.current
    if (!app) return
    // @ts-expect-error: pixi v7 stellt renderer.extract.canvas zur Laufzeit bereit
    const canvas: HTMLCanvasElement = app.renderer.extract.canvas(app.stage)
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `zen-garden-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    soundRef.current?.clickUi()
  }

  function pushHistory(initial = false) {
    const snapshot: SceneState = { theme, brush, paths, items, selectedId }
    if (!initial) {
      const last = undoRef.current[undoRef.current.length - 1]
      if (last && JSON.stringify(last) === JSON.stringify(snapshot)) return
    }
    undoRef.current.push(structuredClone(snapshot))
    if (undoRef.current.length > HISTORY_MAX) undoRef.current.shift()
    redoRef.current = []
  }
  function undo() {
    const u = undoRef.current
    if (u.length <= 1) return
    const curr = u.pop()!
    redoRef.current.push(curr)
    const prev = structuredClone(u[u.length - 1])
    setTheme(prev.theme)
    setBrush(prev.brush)
    setPaths(prev.paths)
    setItems(prev.items)
    setSelectedId(prev.selectedId)
    soundRef.current?.clickUi()
  }
  function redo() {
    if (!redoRef.current.length) return
    const next = structuredClone(redoRef.current.pop()!)
    undoRef.current.push(structuredClone(next))
    setTheme(next.theme)
    setBrush(next.brush)
    setPaths(next.paths)
    setItems(next.items)
    setSelectedId(next.selectedId)
    soundRef.current?.clickUi()
  }

  const rootStyle: React.CSSProperties = {
    position: 'relative',
    width: '100dvw',
    height: '100dvh',
    overflow: 'hidden',
  }
  const hostStyle: React.CSSProperties = { position: 'absolute', inset: 0, zIndex: 0 }

  const hbWrap: React.CSSProperties = { position: 'absolute', top: 16, left: 16, zIndex: 20 }
  const hbBtn: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.15)',
    background: 'rgba(255,255,255,0.65)',
    backdropFilter: 'blur(8px)',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
  }
  const barCommon: React.CSSProperties = {
    width: 20,
    height: 2,
    background: '#111',
    borderRadius: 2,
    transition: 'transform .25s ease, opacity .25s ease',
  }
  const barTop: React.CSSProperties = {
    ...barCommon,
    transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'translateY(-4px) rotate(0deg)',
  }
  const barMid: React.CSSProperties = { ...barCommon, opacity: menuOpen ? 0 : 1 }
  const barBot: React.CSSProperties = {
    ...barCommon,
    transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'translateY(4px) rotate(0deg)',
  }

  const dockBase: React.CSSProperties = {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 280,
    zIndex: 10,
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(8px)',
    borderRadius: 16,
    boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
    padding: 14,
    fontFamily: 'system-ui, sans-serif',
    transition: 'transform .28s ease, opacity .28s ease',
    opacity: 1,
    willChange: 'transform',
  }
  const dockStyle: React.CSSProperties = menuOpen
    ? { ...dockBase, transform: 'translateY(-50%) translateX(0)', opacity: 1, pointerEvents: 'auto' }
    : {
        ...dockBase,
        transform: 'translateY(-50%) translateX(-320px)',
        opacity: 0,
        pointerEvents: 'none',
      }

  const titleStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    margin: 0,
    marginBottom: 8,
  }
  const small: React.CSSProperties = { fontSize: 12 }
  const row: React.CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }
  const btn: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.15)',
    cursor: 'pointer',
    background: 'white',
  }
  const btnDark: React.CSSProperties = { ...btn, background: '#1b1b1b', color: 'white', border: 'none' }
  const btnDark2: React.CSSProperties = { ...btn, background: 'rgba(27,27,27,0.85)', color: 'white', border: 'none' }
  const btnGreen: React.CSSProperties = { ...btn, background: '#7a8f76', color: 'white', border: 'none' }
  const btnWarn: React.CSSProperties = { ...btn, background: '#ef4444', color: 'white', border: 'none' }

  return (
    <div style={rootStyle}>
      <div ref={hostRef} style={hostStyle} />

      <div style={hbWrap}>
        <button
          aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          onClick={() => {
            setMenuOpen(v => !v)
            soundRef.current?.clickUi()
          }}
          style={hbBtn}
        >
          <div style={{ display: 'grid', gap: 4 }}>
            <div style={barTop} />
            <div style={barMid} />
            <div style={barBot} />
          </div>
        </button>
      </div>

      <div style={dockStyle}>
        <h2 style={titleStyle}>Werkzeuge</h2>

        <label style={{ display: 'block', ...small }}>
          Harke-Größe
          <input
            type="range"
            min={4}
            max={40}
            value={brush}
            onChange={e => setBrush(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>

        <div style={row}>
          <button onClick={() => addItem('stoneFlat')} style={btnDark}>
            Stein flach
          </button>
          <button onClick={() => addItem('stoneOval')} style={btnDark}>
            Stein oval
          </button>
          <button onClick={() => addItem('stoneTall')} style={btnDark}>
            Stein hoch
          </button>
        </div>

        <div style={row}>
          <button onClick={() => addItem('leaf')} style={btn}>
            Blatt
          </button>
          <button onClick={() => addItem('lantern')} style={btn}>
            Laterne
          </button>
          <button onClick={() => addItem('rake')} style={btn}>
            Rechen
          </button>
          <button onClick={() => addItem('waveRing')} style={btn}>
            Wellenkreis
          </button>
        </div>

        <div style={row}>
          <button onClick={clearRidges} style={btnDark2}>
            Rillen löschen
          </button>
          <button onClick={saveScene} style={btnGreen}>
            Speichern
          </button>
          <button onClick={loadScene} style={btnGreen}>
            Laden
          </button>
          <button onClick={exportPNG} style={btn}>
            PNG-Export
          </button>
          <button onClick={removeSelected} style={btnWarn} disabled={!selectedId}>
            Ausgewähltes löschen
          </button>
        </div>

        <div style={row}>
          <button onClick={undo} style={btn}>
            Undo
          </button>
          <button onClick={redo} style={btn}>
            Redo
          </button>
          <button onClick={() => setDailyOpen(v => !v)} style={btn}>
            {dailyOpen ? 'Tageskarte ausblenden' : 'Tageskarte anzeigen'}
          </button>
        </div>

        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          <label style={{ fontSize: 12 }}>
            Lautstärke
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={async e => {
                const v = Number(e.target.value)
                setVolume(v)
                try {
                  await soundRef.current?.start()
                  soundRef.current?.setMasterVolume(v)
                } catch {}
              }}
              style={{ width: '100%' }}
            />
          </label>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={async () => {
                try {
                  await soundRef.current?.start()
                  const m = !muted
                  setMuted(m)
                  soundRef.current?.mute(m)
                } catch {}
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.15)',
                background: muted ? '#eee' : '#1b1b1b',
                color: muted ? '#111' : '#fff',
                cursor: 'pointer',
              }}
            >
              {muted ? 'Unmute' : 'Mute'}
            </button>

            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              Chime-Rate (s)
              <input
                type="range"
                min={4}
                max={30}
                step={1}
                value={chimeRate}
                onChange={e => {
                  const v = Number(e.target.value)
                  setChimeRate(v)
                  soundRef.current?.setChimeInterval(v)
                }}
              />
            </label>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <p style={{ ...small, fontWeight: 600, margin: '6px 0' }}>Thema</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['morning', 'day', 'dusk', 'night'] as ThemeKey[]).map(t => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t)
                  pushHistory()
                  soundRef.current?.clickUi()
                }}
                style={theme === t ? btnDark : btn}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DailyCard open={dailyOpen} onClose={() => setDailyOpen(false)} />
    </div>
  )
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
    img.data[i] = n
    img.data[i + 1] = n
    img.data[i + 2] = n
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const tex = Texture.from(canvas)
  const spr = new Sprite(tex)
  spr.alpha = 0.06
  spr.width = w
  spr.height = h
  spr.eventMode = 'none'
  return spr
}
