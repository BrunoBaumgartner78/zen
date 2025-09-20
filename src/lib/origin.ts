// src/lib/origin.ts
const ALLOWED_ORIGINS = [process.env.NEXTAUTH_URL!, 'http://localhost:3000', 'https://blue-lotos.ch']
export function assertAllowedOrigin(req: Request) {
  const origin = req.headers.get('origin') || ''
  if (!ALLOWED_ORIGINS.includes(origin)) {
    throw new Error('Forbidden origin')
  }
}

// in Route:
try {
  assertAllowedOrigin(req)
} catch {
  return NextResponse.json({ error: 'forbidden' }, { status: 403 })
}
