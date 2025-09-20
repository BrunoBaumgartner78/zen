'use client'

import { useEffect } from 'react'

export default function BrandConsole() {
  useEffect(() => {
    // Einmaliger Hinweis in der Dev-Console
    // (läuft nur im Browser, nicht auf dem Server)
    // Passe hier gern Name/URL an.
    const name = 'Baumgartner Development'
    const url  = 'https://baumgartner-development.ch'

    // kleines, dezentes Banner
    const msg = `%c${name}%c  ${url}`
    const s1  = 'font-weight:700;font-size:12px;color:#334155'
    const s2  = 'font-weight:500;font-size:12px;color:#0ea5e9'
    console.log(msg, s1, s2)
  }, [])

  return null
}
