// src/hooks/useHistory.ts
import { useRef } from "react"

export type HistorySnapshot<T> = T

export function useHistory<T>(initial: T, max = 80) {
  const undoRef = useRef<HistorySnapshot<T>[]>([structuredClone(initial)])
  const redoRef = useRef<HistorySnapshot<T>[]>([])

  function snapshot(curr: T, dedupe = true) {
    const last = undoRef.current[undoRef.current.length - 1]
    if (dedupe && last && JSON.stringify(last) === JSON.stringify(curr)) return
    undoRef.current.push(structuredClone(curr))
    if (undoRef.current.length > max) undoRef.current.shift()
    redoRef.current = []
  }

  function undo(apply: (s: T) => void) {
    if (undoRef.current.length <= 1) return
    const curr = undoRef.current.pop()!
    redoRef.current.push(curr)
    apply(structuredClone(undoRef.current[undoRef.current.length - 1]))
  }
  function redo(apply: (s: T) => void) {
    if (!redoRef.current.length) return
    const next = structuredClone(redoRef.current.pop()!)
    undoRef.current.push(structuredClone(next))
    apply(next)
  }

  return { snapshot, undo, redo }
}
