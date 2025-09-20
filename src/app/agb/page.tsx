// src/app/agb/page.tsx
import Link from "next/link"

export const dynamic = "force-static" // optional: hilft Vercel beim Prerendern

export default function AGBPage() {
  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: "0 16px" }}>
      <h1>Allgemeine Geschäftsbedingungen (AGB)</h1>
      <p style={{ opacity: 0.8 }}>
        Gültig für die Nutzung von <strong>Zen Garden</strong>. Ergänzend verweisen wir auf{" "}
        <Link href="/datenschutz">Datenschutz</Link> und <Link href="/impressum">Impressum</Link>.
      </p>

      <h2>1. Geltungsbereich</h2>
      <p>
        Diese AGB regeln Nutzung der Web-App (inkl. optionalem Upgrade). Abweichende Bedingungen
        gelten nur bei schriftlicher Zustimmung.
      </p>

      <h2>2. Leistungen & Konto</h2>
      <ul>
        <li>Basisfunktionen kostenlos; Upgrade gegen Entgelt.</li>
        <li>Registrierte Nutzer sind verantwortlich für die Sicherung ihrer Zugangsdaten.</li>
      </ul>

      <h2>3. Preise & Zahlung</h2>
      <ul>
        <li>Preise inkl. gesetzlicher Abgaben, sofern anwendbar.</li>
        <li>Zahlung über Stripe; es gelten die Stripe-Bedingungen.</li>
      </ul>

      <h2>4. Kündigung / Widerruf</h2>
      <p>
        Das Upgrade kann jederzeit zum nächsten Abrechnungszeitraum gekündigt werden. Gesetzliche
        Widerrufsrechte bleiben unberührt.
      </p>

      <h2>5. Nutzungsrechte & Inhalte</h2>
      <ul>
        <li>Du erhältst ein einfaches, nicht übertragbares Nutzungsrecht an der App.</li>
        <li>Unzulässige Inhalte (rechtswidrig, verletzend) sind verboten.</li>
      </ul>

      <h2>6. Verfügbarkeit & Wartung</h2>
      <p>
        Wir bemühen uns um hohe Verfügbarkeit; es kann zu Wartungsfenstern kommen. Es besteht kein
        Anspruch auf permanente Verfügbarkeit.
      </p>

      <h2>7. Haftung</h2>
      <p>
        Haftung für Vorsatz und grobe Fahrlässigkeit; im Übrigen nur bei Verletzung
        wesentlicher Vertragspflichten, beschränkt auf den typischen vorhersehbaren Schaden.
      </p>

      <h2>8. Datenschutz</h2>
      <p>
        Verarbeitung personenbezogener Daten gemäß unserer{" "}
        <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>

      <h2>9. Schlussbestimmungen</h2>
      <ul>
        <li>Es gilt schweizerisches Recht, zwingende Vorschriften bleiben vorbehalten.</li>
        <li>Gerichtsstand nach gesetzlichen Regeln.</li>
      </ul>

      <p style={{ opacity: 0.7, marginTop: 32 }}>
        Stand: {new Date().toISOString().slice(0, 10)}
      </p>

      <div style={{ marginTop: 24 }}>
        <Link href="/" style={{ textDecoration: "none" }}>← Zur Startseite</Link>
      </div>
    </main>
  )
}
