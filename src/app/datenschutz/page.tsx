// src/app/datenschutz/page.tsx
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten auf blue-lotos.ch (Zen Garden).",
}

// explizit statisch rendern
export const dynamic = "force-static"

export default function DatenschutzPage() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Datenschutzerklärung</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>
        Gültig für die Website <strong>blue-lotos.ch</strong> („Zen Garden“).
      </p>

      <h2 style={{ marginTop: 28 }}>1. Verantwortliche Stelle</h2>
      <p>
        Bruno Baumgartner, c/o Baumgartner Development, 2615 Sonvilier, Schweiz ·{" "}
        <a href="mailto:bruno@brainbloom.ch">
          bruno@brainbloom.ch
        </a>
      </p>

      <h2 style={{ marginTop: 28 }}>2. Verarbeitete Daten</h2>
      <ul>
        <li>Accountdaten (E-Mail, Name – optional)</li>
        <li>Authentifizierung (gehashte Passwörter)</li>
        <li>„Gärten“ (Titel, Cover-Bild-URL, JSON-Daten)</li>
        <li>Abrechnungsstatus (Premium-Flag)</li>
        <li>Protokolldaten (z. B. IP in Server-Logs)</li>
      </ul>

      <h2 style={{ marginTop: 28 }}>3. Zwecke</h2>
      <ul>
        <li>Bereitstellung und Betrieb der App</li>
        <li>Anmeldung/Authentifizierung</li>
        <li>Speichern/Teilen von Gärten</li>
        <li>Zahlung & Abrechnung (Stripe)</li>
        <li>Sicherheit, Missbrauchsvermeidung, Fehleranalyse</li>
      </ul>

      <h2 style={{ marginTop: 28 }}>4. Rechtsgrundlagen</h2>
      <p>
        Vertragserfüllung; berechtigte Interessen (Betrieb/Sicherheit); Einwilligung für
        optionale Cookies/Analytics (falls aktiv).
      </p>

      <h2 style={{ marginTop: 28 }}>5. Empfänger / Auftragsverarbeiter</h2>
      <ul>
        <li>Vercel (Hosting/Blob/CDN)</li>
        <li>Stripe (Zahlungsabwicklung)</li>
        <li>Neon/PG (Datenbank, falls eingesetzt)</li>
        <li>Analytics (falls aktiviert, z. B. Vercel Analytics/GA)</li>
      </ul>

      <h2 style={{ marginTop: 28 }}>6. Drittlandtransfer</h2>
      <p>
        Dienste außerhalb CH/EU möglich; Schutzmechanismen (z. B. Standardvertragsklauseln)
        werden verwendet, soweit erforderlich.
      </p>

      <h2 style={{ marginTop: 28 }}>7. Speicherfristen</h2>
      <ul>
        <li>Accounts/Daten bis zur Löschung oder gesetzlichen Pflicht</li>
        <li>Temporäre Dateien (Cover-Bilder) werden regelmäßig bereinigt</li>
        <li>Logs gemäß technischen Erfordernissen</li>
      </ul>

      <h2 style={{ marginTop: 28 }}>8. Cookies</h2>
      <p>
        Technisch notwendige Cookies sind erforderlich. Optionale Cookies (z. B. Analytics)
        werden nur mit Einwilligung gesetzt (siehe Cookie-Banner).
      </p>

      <h2 style={{ marginTop: 28 }}>9. Betroffenenrechte</h2>
      <ul>
        <li>Auskunft, Berichtigung, Löschung, Einschränkung</li>
        <li>Datenübertragbarkeit (soweit anwendbar)</li>
        <li>Widerruf von Einwilligungen mit Wirkung für die Zukunft</li>
        <li>Beschwerde bei einer Aufsichtsbehörde</li>
      </ul>

      <h2 style={{ marginTop: 28 }}>10. Sicherheit</h2>
      <p>Angemessene technische und organisatorische Maßnahmen (z. B. Verschlüsselung).</p>

      <h2 style={{ marginTop: 28 }}>11. Kontakt</h2>
      <p>
        Datenschutz: <a href="mailto:bruno@brainbloom.ch">bruno@brainbloom.ch</a>
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
        <Link href="/impressum" style={{ textDecoration: "underline", fontSize: 14 }}>
          Impressum
        </Link>
        <Link href="/agb" style={{ textDecoration: "underline", fontSize: 14 }}>
          AGB
        </Link>
      </nav>
    </main>
  )
}
