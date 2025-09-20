// src/lib/base-url.ts
import { headers } from "next/headers"

export async function getBaseUrl() {
  const h = await headers() // <- await
  const proto = h.get("x-forwarded-proto") ?? "http"
  const host  = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  return `${proto}://${host}`
}
