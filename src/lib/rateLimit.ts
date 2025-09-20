// src/lib/rateLimit.ts
// Simple in-memory rate limiter (pro Instanz/Region – nicht global!)
// Für Production → besser Redis, Upstash, etc. verwenden

type Bucket = { ts: number; count: number }
const store = new Map<string, Bucket>()

/**
 * Gibt die Client-IP zurück (X-Forwarded-For oder RemoteAddr).
 */
export function getIP(req: Request): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0].trim()
  // fallback: nextjs node runtime
  return (req as any)?.ip ?? 'local'
}

/**
 * Einfacher Token-Bucket-Limiter.
 * @param key eindeutiger Schlüssel, z.B. `route:/api/upload:${ip}`
 * @param limit Anzahl erlaubte Requests pro Fenster
 * @param windowMs Fenster in Millisekunden (z. B. 60_000 = 1 Minute)
 * @returns true wenn erlaubt, false wenn rate-limited
 */
export function limit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = store.get(key)

  if (!bucket || now - bucket.ts > windowMs) {
    store.set(key, { ts: now, count: 1 })
    return true
  }

  if (bucket.count < limit) {
    bucket.count++
    return true
  }

  return false
}
