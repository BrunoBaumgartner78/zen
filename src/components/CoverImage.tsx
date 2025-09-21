// src/components/CoverImage.tsx
'use client'

import { useState } from 'react'

type Props = {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
}

export default function CoverImage({ src, alt, className, style }: Props) {
  const [broken, setBroken] = useState(false)

  if (!src || broken) {
    // neutraler Fallback
    return (
      <div
        className={className}
        style={{
          ...style,
          width: '100%',
          height: '100%',
          background:
            'repeating-conic-gradient(#f6f6f6 0 25%, #e9e9e9 0 50%) 50% / 24px 24px',
        }}
        aria-label={alt}
        role="img"
      />
    )
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className={className}
      style={{ ...style, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  )
}
