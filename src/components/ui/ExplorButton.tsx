'use client'
import Link from 'next/link'

export default function ExploreButton() {
  return (
    <Link
      href="/explore"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 10,
        background: '#fff',
        border: '1px solid rgba(0,0,0,.12)',
        textDecoration: 'none',
        color: 'inherit',
        fontSize: 13,
      }}
    >
      Galerie erkunden →
    </Link>
  )
}
