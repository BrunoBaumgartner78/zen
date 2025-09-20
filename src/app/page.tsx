// src/app/page.tsx
import { Suspense } from 'react'
import HomeClient from '@/components/HomeClient'

// optional, falls du auf der Startseite dynamisch sein willst
export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  )
}
