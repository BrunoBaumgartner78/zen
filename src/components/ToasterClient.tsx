'use client'
import { Toaster } from 'sonner'

export default function ToasterClient() {
  return (
    <Toaster
      richColors
      position="top-right"
      toastOptions={{ duration: 2800 }}
    />
  )
}
