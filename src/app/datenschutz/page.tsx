// src/app/datenschutz/page.tsx
export default function DatenschutzPage() {
  return (
    <main style={{ maxWidth: 800, margin: "60px auto", padding: 20 }}>
      <h1>Datenschutzerklärung</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>1. Allgemeine Hinweise</h2>
        <p>
          Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. 
          Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend 
          den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>2. Verantwortliche Stelle</h2>
        <p>
          Bruno Baumgartner<br />
          Le pré-aux-Boeufs<br />
          2615 Sonvileir, Schweiz<br />
          E-Mail: <a href="mailto:bruno@brainbloom.ch">bruno@brainbloom.ch</a>
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>3. Erhebung und Speicherung personenbezogener Daten</h2>
        <p>
          Wir erheben personenbezogene Daten, wenn Sie unsere Website nutzen, 
          sich registrieren oder Käufe tätigen. Dazu gehören insbesondere Name, 
          E-Mail-Adresse, Zahlungsinformationen und Nutzungsdaten.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>4. Verwendung der Daten</h2>
        <ul>
          <li>Zur Bereitstellung unserer Online-Dienste</li>
          <li>Zur Abwicklung von Bestellungen und Zahlungen</li>
          <li>Zur Verbesserung unseres Angebots</li>
          <li>Zur Erfüllung gesetzlicher Verpflichtungen</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>5. Weitergabe an Dritte</h2>
        <p>
          Eine Weitergabe Ihrer Daten an Dritte erfolgt ausschliesslich zur 
          Vertragserfüllung (z.B. Zahlungsdienstleister wie Stripe) oder wenn wir 
          gesetzlich dazu verpflichtet sind.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>6. Speicherung und Löschung</h2>
        <p>
          Wir speichern personenbezogene Daten nur so lange, wie dies für die 
          Erfüllung der genannten Zwecke notwendig ist oder wir gesetzlich dazu 
          verpflichtet sind. Anschliessend werden die Daten gelöscht.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>7. Cookies & Tracking</h2>
        <p>
          Unsere Website verwendet Cookies und vergleichbare Technologien, um die 
          Nutzung zu analysieren und bestimmte Funktionen bereitzustellen. Sie 
          können dem Einsatz von Cookies über Ihren Browser widersprechen.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>8. Ihre Rechte</h2>
        <p>
          Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und 
          Einschränkung der Verarbeitung Ihrer Daten. Ausserdem können Sie der 
          Verarbeitung widersprechen und haben das Recht auf Datenübertragbarkeit.
        </p>
        <p>
          Bitte wenden Sie sich dazu an:{" "}
          <a href="mailto:bruno@brainbloom.ch">bruno@brainbloom.ch</a>
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>9. Änderungen</h2>
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung jederzeit zu ändern. 
          Es gilt jeweils die aktuelle Version auf dieser Website.
        </p>
      </section>
    </main>
  )
}
