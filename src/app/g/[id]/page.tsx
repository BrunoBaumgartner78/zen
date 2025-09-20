import { notFound } from 'next/navigation'
import { db } from '@/db/db'
import { gardens } from '@/db/schema'
import { eq } from 'drizzle-orm'

type ParamsP = Promise<{ id: string }>

export default async function GardenPage({
  params,
}: {
  params: ParamsP
}) {
  // ⬅ Next 15: params ist ein Promise
  const { id } = await params
  if (!id || id.length < 8 || id.length > 64) notFound()

  // robust: plain select statt db.query.*
  const rows = await db.select().from(gardens).where(eq(gardens.id, id)).limit(1)
  const row = rows[0]
  if (!row) notFound()

  return (
    <main style={{maxWidth: 920, margin: '40px auto', padding: 16}}>
      <h1 style={{marginBottom: 12}}>{row.title}</h1>
      <img
        src={row.coverUrl}
        alt={row.title}
        style={{width: '100%', height: 'auto', borderRadius: 12}}
      />
      {/* falls du Daten rendern willst: */}
      {/* <pre>{JSON.stringify(row.dataJson, null, 2)}</pre> */}
    </main>
  )
}
