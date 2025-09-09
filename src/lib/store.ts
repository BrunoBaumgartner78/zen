import { create } from 'zustand'
export type Brush = { size: number; softness: number }
export type Theme = 'morning' | 'day' | 'dusk' | 'night'


export type Haiku = { id: string; text: string }


export type Scene = {
stones: Stone[]
paths: Array<Array<{ x: number; y: number }>> // drawn rake paths
theme: Theme
}


export type AudioState = { wind: number; water: number; bamboo: number; flute: number; started: boolean }


type Store = {
brush: Brush
scene: Scene
audio: AudioState
haikuIndex: number
setBrush: (p: Partial<Brush>) => void
addStone: (x?: number, y?: number) => void
moveStone: (id: string, x: number, y: number) => void
removeStone: (id: string) => void
startPath: (pt: { x: number; y: number }) => void
addPoint: (pt: { x: number; y: number }) => void
endPath: () => void
clearPaths: () => void
setTheme: (t: Theme) => void
setAudio: (p: Partial<AudioState>) => void
cycleHaiku: () => void
save: () => void
load: () => void
}


const defaultScene: Scene = { stones: [], paths: [], theme: 'day' }
const defaultAudio: AudioState = { wind: 0.2, water: 0.25, bamboo: 0.1, flute: 0.0, started: false }


export const useStore = create<Store>((set, get) => ({
brush: { size: 10, softness: 0.8 },
scene: defaultScene,
audio: defaultAudio,
haikuIndex: 0,
setBrush: (p) => set((s) => ({ brush: { ...s.brush, ...p } })),
addStone: (x, y) => set((s) => ({
scene: { ...s.scene, stones: [...s.scene.stones, { id: crypto.randomUUID(), x: x ?? 200, y: y ?? 200, r: 28 }] },
})),
moveStone: (id, x, y) => set((s) => ({
scene: { ...s.scene, stones: s.scene.stones.map(st => st.id === id ? { ...st, x, y } : st) },
})),
removeStone: (id) => set((s) => ({
scene: { ...s.scene, stones: s.scene.stones.filter(st => st.id !== id) },
})),
startPath: (pt) => set((s) => ({ scene: { ...s.scene, paths: [...s.scene.paths, [pt]] } })),
addPoint: (pt) => set((s) => ({ scene: { ...s.scene, paths: [...s.scene.paths.slice(0, -1), [...s.scene.paths[s.scene.paths.length - 1], pt]] } })),
endPath: () => set((s) => s),
clearPaths: () => set((s) => ({ scene: { ...s.scene, paths: [] } })),
setTheme: (t) => set((s) => ({ scene: { ...s.scene, theme: t } })),
setAudio: (p) => set((s) => ({ audio: { ...s.audio, ...p } })),
cycleHaiku: () => set((s) => ({ haikuIndex: (s.haikuIndex + 1) % HAIKUS.length })),
save: () => {
const { scene } = get()
localStorage.setItem('zen.scene', JSON.stringify(scene))
},
load: () => {
const raw = localStorage.getItem('zen.scene')
if (!raw) return
try { set({ scene: JSON.parse(raw) as Scene }) } catch {}
},
}))


export const HAIKUS: Haiku[] = [
{ id: 'h1', text: 'leiser Wind im Sand —\nSpuren kommen, gehen — still\nruht der weite Geist' },
{ id: 'h2', text: 'Mond über Kiefern —\nzwischen den Steinen atmet\nNacht die Zeit hinaus' },
{ id: 'h3', text: 'Wasser im Becken —\nKreise tragen mein Denken,\nalles wird leicht.' },
]