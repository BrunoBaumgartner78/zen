// src/components/ui/PremiumCheckoutClient.tsx
'use client'

import { signIn } from 'next-auth/react'
import PremiumCheckoutButton from './PremiumCheckoutButton'

export default function PremiumCheckoutClient() {
  const onRequireLogin = () => {
    // Öffnet NextAuth Sign-in und kommt danach zurück auf /upgrade
    signIn(undefined, { callbackUrl: '/upgrade' })
  }

  return <PremiumCheckoutButton onRequireLogin={onRequireLogin} />
}
