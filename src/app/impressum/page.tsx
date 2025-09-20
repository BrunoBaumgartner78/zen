// src/app/impressum/page.tsx
export default function ImpressumPage() {
  return (
    <main style={{ maxWidth: 800, margin: "60px auto", padding: 20 }}>
      <h1>Impressum</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>Verantwortlich für den Inhalt</h2>
        <p>
          Bruno Baumgartner<br />
          Le pré-aux-Boufes 222<br />
          2615 Sonvilier<br />
          Schweiz
        </p>
        <p>
          E-Mail: <a href="mailto:bruno@brainbloom.ch">bruno@brainbloom.ch</a><br />
          Webseite: <a href="https://blue-lotos.ch" target="_blank" rel="noopener noreferrer">https://blue-lotos.ch</a>
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Haftungsausschluss</h2>
        <p>
          Die Inhalte dieser Website wurden mit grösstmöglicher Sorgfalt erstellt. 
          Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
        </p>
        <p>
          Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres Verantwortungsbereichs. 
          Es wird jegliche Verantwortung für solche Webseiten abgelehnt. 
          Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr des Nutzers.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Urheberrechte</h2>
        <p>
          Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien 
          auf dieser Website gehören ausschliesslich dem Betreiber oder den speziell genannten Rechteinhabern. 
          Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Kontakt</h2>
        <p>
          Bei Fragen zum Impressum wenden Sie sich bitte an:<br />
          E-Mail: <a href="mailto:bruno@brainbloom.ch">bruno@brainbloom.ch</a>
        </p>
      </section>
    </main>
  )
}
