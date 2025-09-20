// src/components/ui/Paginator.tsx
import Link from "next/link"

type Props = {
  page: number
  totalPages: number
  basePath?: string // default: "/explore"
}

export default function Paginator({ page, totalPages, basePath = "/explore" }: Props) {
  const prev = Math.max(1, page - 1)
  const next = Math.min(totalPages, page + 1)

  return (
    <nav aria-label="Seiten-Navigation" style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", marginTop: 16 }}>
      <Link
        href={`${basePath}?page=${prev}`}
        aria-disabled={page <= 1}
        style={{
          pointerEvents: page <= 1 ? "none" : "auto",
          opacity: page <= 1 ? 0.5 : 1,
          padding: "8px 12px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,.15)",
          background: "white",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        ← Zurück
      </Link>

      <span style={{ fontSize: 13, opacity: 0.7 }}>
        Seite {page} / {totalPages || 1}
      </span>

      <Link
        href={`${basePath}?page=${next}`}
        aria-disabled={page >= totalPages}
        style={{
          pointerEvents: page >= totalPages ? "none" : "auto",
          opacity: page >= totalPages ? 0.5 : 1,
          padding: "8px 12px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,.15)",
          background: "white",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        Weiter →
      </Link>
    </nav>
  )
}
