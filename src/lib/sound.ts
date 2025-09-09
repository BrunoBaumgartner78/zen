// src/lib/sound.ts
// Web-Audio Sound-Engine als Factory (ohne externe Libraries), defensiv verdrahtet.

export type ThemeKey = 'morning' | 'day' | 'dusk' | 'night'

type Urls = {
  wind?: string; birds?: string; chimes?: string; water?: string; crickets?: string;
  rake?: string; gravel?: string; bamboo?: string; click?: string;
}

type LayerName = 'wind' | 'birds' | 'chimes' | 'water' | 'crickets'

export type Sound = {
  // Lifecycle
  start: () => Promise<void>
  // Mix
  applyTheme: (t: ThemeKey) => void
  setMasterVolume: (v: number) => void
  mute: (m: boolean) => void
  setChimeInterval: (sec: number) => void
  // One-shots
  playRake: () => void
  playDrop: () => void
  playBamboo: () => void
  clickUi: () => void
  // State (read-only)
  readonly started: boolean
}

export function createSound(urls: Urls): Sound {
  // ---- State / Defaults ----
  let started = false
  let muted = false
  let volume = 0.8
  let chimeInterval = 12
  const layerGains: Record<LayerName, number> = {
    wind: 0.6, birds: 0.35, chimes: 0.25, water: 0.25, crickets: 0.35,
  }
  const u = {
    wind: '/sounds/wind.mp3',
    birds: '/sounds/birds.mp3',
    chimes: '/sounds/chimes.mp3',
    water: '/sounds/water.mp3',
    crickets: '/sounds/crickets.mp3',
    rake: '/sounds/rake.mp3',
    gravel: '/sounds/gravel.mp3',
    bamboo: '/sounds/bamboo.mp3',
    click: '/sounds/click.mp3',
    ...urls,
  }

  // ---- WebAudio Graph ----
  let ctx: AudioContext | null = null
  let outGain: GainNode | null = null
  let hp: BiquadFilterNode | null = null
  let lp: BiquadFilterNode | null = null
  let convolver: ConvolverNode | null = null
  let revGain: GainNode | null = null

  type Layer = { buffer?: AudioBuffer; source?: AudioBufferSourceNode; gain: GainNode; send: GainNode }
  const L: Record<LayerName, Layer> = {} as any

  const oneShots: Record<'rake'|'gravel'|'bamboo'|'click', AudioBuffer | undefined> = {
    rake: undefined, gravel: undefined, bamboo: undefined, click: undefined
  }

  let chimeTimer: number | undefined

  // ---- Helpers ----
  const isNode = (n: any): n is AudioNode => !!n && typeof n.connect === 'function'
  const connect = (a: AudioNode | null, b: AudioNode | AudioParam | null) => {
    if (!a || !b) return
    try { (a as any).connect?.(b as any) } catch {}
  }

  const makeIR = (ctx: AudioContext, seconds = 2.0, decay = 0.5) => {
    const rate = ctx.sampleRate
    const length = Math.max(1, Math.floor(rate * seconds))
    const buf = ctx.createBuffer(2, length, rate)
    for (let ch=0; ch<2; ch++) {
      const data = buf.getChannelData(ch)
      for (let i=0; i<length; i++) {
        const n = Math.random()*2-1
        data[i] = n * Math.pow(1 - i/length, decay)
      }
    }
    return buf
  }

  const loadBuffer = async (url: string): Promise<AudioBuffer|undefined> => {
    try {
      const res = await fetch(url); if (!res.ok) return
      const arr = await res.arrayBuffer()
      return await ctx!.decodeAudioData(arr)
    } catch { return }
  }

  const startLoop = (name: LayerName) => {
    if (!ctx) return
    const lay = L[name]; if (!lay || !lay.buffer) return
    try { lay.source?.stop() } catch {}
    const src = ctx.createBufferSource()
    src.buffer = lay.buffer
    src.loop = true
    try { src.connect(lay.gain) } catch {}
    try { src.connect(lay.send) } catch {}
    try { src.start(0) } catch {}
    lay.source = src
  }

  const setLayer = (name: LayerName, v: number, time = 0.5) => {
    if (!ctx) return
    layerGains[name] = v
    const g = L[name]?.gain?.gain; if (!g) return
    const now = ctx.currentTime
    try {
      g.cancelScheduledValues(now)
      g.setValueAtTime(g.value as number, now)
      g.linearRampToValueAtTime(v, now + time)
    } catch { g.value = v }
  }

  const playOne = (key: keyof typeof oneShots, gainMul = 1) => {
    if (!ctx || !outGain || !convolver || !revGain) return
    const buf = oneShots[key]; if (!buf) return
    const src = ctx.createBufferSource(); src.buffer = buf
    const dry = ctx.createGain(); dry.gain.value = 0.6 * gainMul
    const wet = ctx.createGain(); wet.gain.value = 0.7 * gainMul
    try { src.connect(dry); dry.connect(outGain) } catch {}
    try { src.connect(wet); wet.connect(convolver); convolver.connect(revGain); revGain.connect(outGain) } catch {}
    try { src.start() } catch {}
  }

  const tickChimes = () => {
    if (!ctx) return
    const lay = L.chimes; if (!lay) return
    const g = lay.gain.gain
    const now = ctx.currentTime
    const base = layerGains.chimes || 0.2
    try {
      g.cancelScheduledValues(now)
      g.setValueAtTime(g.value as number, now)
      g.linearRampToValueAtTime(base + 0.12, now + 0.05)
      g.linearRampToValueAtTime(base, now + 0.45)
    } catch { g.value = base }
    const next = chimeInterval * (0.6 + Math.random()*0.8) * 1000
    chimeTimer = window.setTimeout(tickChimes, next) as unknown as number
  }

  // ---- Public API ----
  const start = async () => {
    if (started) return
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    try { await ctx.resume() } catch {}

    outGain = ctx.createGain(); outGain.gain.value = muted ? 0 : volume
    hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 120
    lp = ctx.createBiquadFilter(); lp.type = 'lowpass';  lp.frequency.value = 9500
    revGain = ctx.createGain();   revGain.gain.value = 0.22
    convolver = ctx.createConvolver(); convolver.buffer = makeIR(ctx, 2.4, 0.4)

    // Routing (einzeln & defensiv, keine Ketten)
    if (isNode(hp) && isNode(lp)) { connect(hp, lp) }
    if (isNode(lp) && isNode(outGain)) { connect(lp, outGain) }
    if (isNode(convolver) && isNode(revGain)) { connect(convolver, revGain) }
    if (isNode(revGain) && isNode(outGain)) { connect(revGain, outGain) }
    try { (outGain as any)?.connect?.((ctx as any).destination) } catch {}

    // Layers
    (['wind','birds','chimes','water','crickets'] as LayerName[]).forEach(name => {
      const gain = ctx!.createGain(); gain.gain.value = 0
      const send = ctx!.createGain(); send.gain.value = name === 'chimes' ? 0.35 : 0.15
      if (isNode(gain) && isNode(hp)) connect(gain, hp)
      if (isNode(send) && isNode(convolver)) connect(send, convolver)
      L[name] = { gain, send }
    })

    // Assets laden
    L.wind.buffer     = await loadBuffer(u.wind)
    L.birds.buffer    = await loadBuffer(u.birds)
    L.chimes.buffer   = await loadBuffer(u.chimes)
    L.water.buffer    = await loadBuffer(u.water)
    L.crickets.buffer = await loadBuffer(u.crickets)

    oneShots.rake   = await loadBuffer(u.rake)
    oneShots.gravel = await loadBuffer(u.gravel)
    oneShots.bamboo = await loadBuffer(u.bamboo)
    oneShots.click  = await loadBuffer(u.click)

    // Loops + Gains
    ;(Object.keys(L) as LayerName[]).forEach(name => {
      startLoop(name)
      setLayer(name, layerGains[name], 0)
    })

    // Chime-Scheduler
    chimeTimer = window.setTimeout(tickChimes, 3000) as unknown as number

    started = true
  }

  const applyTheme = (t: ThemeKey) => {
    const target: Record<LayerName, number> = ({
      morning: { wind: 0.55, birds: 0.4,  chimes: 0.12, water: 0.0,  crickets: 0.0 },
      day:     { wind: 0.6,  birds: 0.15, chimes: 0.25, water: 0.1,  crickets: 0.0 },
      dusk:    { wind: 0.5,  birds: 0.05, chimes: 0.2,  water: 0.22, crickets: 0.15 },
      night:   { wind: 0.45, birds: 0.0,  chimes: 0.08, water: 0.1,  crickets: 0.4  },
    } as any)[t]
    ;(Object.keys(target) as LayerName[]).forEach(k => setLayer(k, target[k], 1.2))
  }

  const setMasterVolume = (v: number) => {
    volume = v
    if (!ctx || !outGain) return
    const g = outGain.gain, now = ctx.currentTime
    try {
      g.cancelScheduledValues(now)
      g.setValueAtTime(g.value as number, now)
      g.linearRampToValueAtTime(muted ? 0 : v, now + 0.12)
    } catch {
      g.value = muted ? 0 : v
    }
  }

  const mute = (m: boolean) => {
    muted = m
    if (!ctx || !outGain) return
    const g = outGain.gain, now = ctx.currentTime
    try {
      g.cancelScheduledValues(now)
      g.setValueAtTime(g.value as number, now)
      g.linearRampToValueAtTime(m ? 0 : volume, now + 0.08)
    } catch {
      g.value = m ? 0 : volume
    }
  }

  const setChimeInterval = (sec: number) => { chimeInterval = Math.max(4, sec) }

  const playRake   = () => playOne('rake', 0.9)
  const playDrop   = () => playOne('gravel', 0.9)
  const playBamboo = () => playOne('bamboo', 0.9)
  const clickUi    = () => playOne('click', 0.6)

  return {
    get started() { return started },
    start, applyTheme, setMasterVolume, mute, setChimeInterval,
    playRake, playDrop, playBamboo, clickUi,
  }
}
