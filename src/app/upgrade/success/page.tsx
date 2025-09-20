// src/app/upgrade/success/page.tsx
import Link from "next/link"

export const dynamic = "force-dynamic" // verhindert SSG, falls gewünscht

type SP = Promise<Record<string, string | string[] | undefined>>

export default async function SuccessPage({
  searchParams,
}: { searchParams: SP }) {
  const sp = await searchParams
  const sessionId = (Array.isArray(sp.session_id) ? sp.session_id[0] : sp.session_id) ?? ""
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? "success"

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Upgrade erfolgreich 🎉</h1>
      <p style={{ opacity: 0.8 }}>
        Danke dir! Dein Kauf wurde abgeschlossen.
      </p>

      <div style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,.1)",
        background: "#fff"
      }}>
        <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 6 }}>
          Status:
        </div>
        <div style={{ fontWeight: 600 }}>{status}</div>

        {sessionId ? (
          <>
            <div style={{ fontSize: 14, opacity: 0.8, marginTop: 12 }}>
              Stripe Session ID:
            </div>
            <code style={{
              display: "block",
              fontSize: 13,
              background: "#f6f6f6",
              padding: "8px 10px",
              borderRadius: 8,
              overflowX: "auto"
            }}>
              {sessionId}
            </code>
          </>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <Link href="/" style={{
          padding: "8px 14px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,.12)",
          background: "#fff",
          color: "#111",
          textDecoration: "none"
        }}>
          ⌂ Zur Startseite
        </Link>
        <Link href="/explore" style={{
          padding: "8px 14px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,.12)",
          background: "#fff",
          color: "#111",
          textDecoration: "none"
        }}>
          Gärten entdecken
        </Link>
      </div>
    </main>
  )
}
