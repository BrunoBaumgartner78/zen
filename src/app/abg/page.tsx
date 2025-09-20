// src/app/agb/page.tsx
export default function AgbPage() {
  return (
    <main style={{ maxWidth: 800, margin: "60px auto", padding: 20 }}>
      <h1>Allgemeine Geschäftsbedingungen (AGB)</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>1. Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der
          Online-Anwendung <strong>Zen Garden</strong> (nachfolgend „Anwendung“)
          sowie den Erwerb von kostenpflichtigen Premium-Leistungen. Mit der
          Registrierung oder Nutzung der Anwendung akzeptieren Sie diese AGB.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>2. Anbieter</h2>
        <p>
          Bruno Baumgartner <br />
          Le pré-aux-Boeufs <br />
          2615 Sonvilier, Schweiz <br />
          E-Mail:{" "}
          <a href="mailto:bruno@brainbloom.ch">bruno@brainbloom.ch</a>
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>3. Leistungen</h2>
        <ul>
          <li>
            Basisnutzung der Anwendung (kostenfrei, eingeschränkte Funktionen)
          </li>
          <li>
            Premium-Upgrade (kostenpflichtig, zusätzliche Funktionen wie
            Wintermodus, erweiterte Objekte, Teilen von Inhalten)
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>4. Registrierung & Benutzerkonto</h2>
        <p>
          Für die Nutzung der Premium-Funktionen ist eine Registrierung mit
          E-Mail und Passwort erforderlich. Die Zugangsdaten dürfen nicht an
          Dritte weitergegeben werden. Sie sind für alle Aktivitäten unter Ihrem
          Konto verantwortlich.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>5. Preise & Zahlung</h2>
        <p>
          Das Premium-Upgrade ist kostenpflichtig. Der aktuell gültige Preis
          wird vor Abschluss des Kaufvorgangs angezeigt. Die Abwicklung erfolgt
          über den Zahlungsanbieter <strong>Stripe</strong>. Alle Preise sind in
          Schweizer Franken (CHF) angegeben und beinhalten, soweit zutreffend,
          die gesetzliche Mehrwertsteuer.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>6. Widerrufsrecht</h2>
        <p>
          Da es sich um eine digitale Dienstleistung handelt, die unmittelbar
          nach Kauf bereitgestellt wird, erlischt das gesetzliche
          Widerrufsrecht mit Beginn der Ausführung. Durch den Kauf des
          Premium-Upgrades erklären Sie ausdrücklich Ihr Einverständnis, dass
          die Ausführung sofort beginnt.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>7. Verfügbarkeit</h2>
        <p>
          Wir bemühen uns, eine möglichst unterbrechungsfreie Verfügbarkeit der
          Anwendung sicherzustellen. Ein Anspruch auf ständige Verfügbarkeit
          besteht jedoch nicht.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>8. Haftung</h2>
        <p>
          Die Nutzung der Anwendung erfolgt auf eigene Gefahr. Der Anbieter
          übernimmt keine Haftung für Datenverluste, Ausfälle oder Schäden, die
          durch die Nutzung entstehen, ausser bei Vorsatz oder grober
          Fahrlässigkeit.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>9. Datenschutz</h2>
        <p>
          Es gilt die{" "}
          <a href="/datenschutz" style={{ textDecoration: "underline" }}>
            Datenschutzerklärung
          </a>
          . Personenbezogene Daten werden ausschliesslich zur Bereitstellung der
          Anwendung und zur Abwicklung des Premium-Upgrades verarbeitet.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>10. Änderungen der AGB</h2>
        <p>
          Der Anbieter behält sich vor, diese AGB jederzeit zu ändern. Die
          jeweils gültige Version wird auf dieser Seite veröffentlicht.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>11. Gerichtsstand & Anwendbares Recht</h2>
        <p>
          Es gilt ausschliesslich Schweizer Recht. Gerichtsstand ist Zürich,
          Schweiz, soweit zwingendes Recht nichts anderes vorsieht.
        </p>
      </section>
    </main>
  )
}
