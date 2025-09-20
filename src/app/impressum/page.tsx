// src/app/impressum/page.tsx
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum für blue-lotos.ch (Zen Garden).",
}

// explizit statisch rendern
export const dynamic = "force-static"

export default function ImpressumPage() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Impressum</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>
        Angaben gemäß schweizerischem Recht für die Website <strong>blue-lotos.ch</strong> („Zen Garden“).
      </p>

      <h2 style={{ marginTop: 28 }}>Verantwortlich</h2>
      <p>
        Bruno Baumgartner<br />
        c/o Baumgartner Development<br />
        8000 Zürich, Schweiz<br />
        E-Mail:{" "}
        <a href="mailto:info@baumgartner-development.ch">
          info@baumgartner-development.ch
        </a>
      </p>

      <h2 style={{ marginTop: 28 }}>Haftungsausschluss</h2>
      <p>
        Inhalte wurden sorgfältig erstellt. Für Richtigkeit, Vollständigkeit und Aktualität übernehmen wir keine Gewähr.
        Verlinkte externe Inhalte liegen außerhalb unseres Verantwortungsbereichs.
      </p>

      <h2 style={{ marginTop: 28 }}>Urheberrecht</h2>
      <p>
        Inhalte und Werke auf dieser Website unterliegen dem Urheberrecht. Vervielfältigung, Bearbeitung und Verbreitung
        bedürfen unserer vorherigen Zustimmung, soweit nicht gesetzlich anders erlaubt.
      </p>

      <h2 style={{ marginTop: 28 }}>Kontakt bei Rechtsanfragen</h2>
      <p>
        Bitte richten Sie Anfragen an{" "}
        <a href="mailto:legal@blue-lotos.ch">legal@blue-lotos.ch</a>.
      </p>

      <p style={{ marginTop: 28, fontSize: 13, opacity: 0.7 }}>
        Zuletzt aktualisiert: {new Date().toISOString().slice(0, 10)}
      </p>

      <hr style={{ margin: "24px 0", opacity: 0.15 }} />

      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          href="/"
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,.12)",
            background: "#fff",
            color: "#111",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ⌂ Home
        </Link>
        <Link href="/datenschutz" style={{ textDecoration: "underline", fontSize: 14 }}>
          Datenschutzerklärung
        </Link>
        <Link href="/agb" style={{ textDecoration: "underline", fontSize: 14 }}>
          AGB
        </Link>
      </nav>
    </main>
  )
}
