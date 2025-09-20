'use client'
import Link from 'next/link'

export default function ExploreButton() {
  return (
    <Link
      href="/explore"
      style={{
        textDecoration:'none', color:'inherit',
        display:'inline-flex', alignItems:'center', gap:8,
        padding:'8px 12px', border:'1px solid rgba(0,0,0,.12)',
        borderRadius:10, background:'#fff', fontSize:13
      }}
      title="Galerie erkunden"
    >
      Galerie →
    </Link>
  )
}
