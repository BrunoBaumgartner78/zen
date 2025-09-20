// src/app/gallery/page.tsx
export const dynamic = "force-dynamic"

type Garden = {
  id: string
  title: string | null
  coverUrl: string
  createdAt: string | null
}

export default async function GalleryPage() {
  const res = await fetch(`${process.env.AUTH_URL ?? ''}/api/gardens`, { cache: "no-store" })
  const { items } = await res.json() as { items: Garden[] }

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ marginTop: 0 }}>Galerie</h1>
      <div style={{ display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {items.map(g => (
          <a key={g.id} href={`/g/${g.id}`} style={{ textDecoration:'none', color:'inherit' }}>
            <div style={{ borderRadius:16, overflow:'hidden', background:'#fff', boxShadow:'0 6px 18px rgba(0,0,0,0.08)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.coverUrl} alt={g.title ?? 'Zen Garden'} style={{ width:'100%', height:180, objectFit:'cover' }} />
              <div style={{ padding:12 }}>
                <div style={{ fontWeight:700 }}>{g.title ?? 'Zen Garden'}</div>
                <div style={{ fontSize:12, opacity:0.7 }}>{new Date(g.createdAt ?? '').toLocaleString('de-CH')}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}
