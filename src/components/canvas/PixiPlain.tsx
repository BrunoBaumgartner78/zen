'use client'
import { useEffect, useRef } from 'react'
import { Application, Graphics } from 'pixi.js'

export default function PixiPlain() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const app = new Application({
      backgroundColor: 0xe9e3d5,
      resizeTo: window,
      antialias: true,
    } as any)
    ref.current.appendChild(app.view as HTMLCanvasElement)

    const g = new Graphics()
    g.beginFill(0x7a8f76).drawRoundedRect(100, 100, 220, 140, 18).endFill()
    app.stage.addChild(g)

    return () => { app.destroy(true) }
  }, [])

  return <div ref={ref} className="w-screen h-screen" />
}
