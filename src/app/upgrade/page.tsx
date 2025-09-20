// src/app/upgrade/page.tsx
import { Suspense } from 'react'
import UpgradeClient from './UpgradeClient'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <UpgradeClient />
    </Suspense>
  )
}
