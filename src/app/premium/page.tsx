import Link from "next/link";
import PremiumCheckoutButton from "@/components/ui/PremiumCheckoutButton";

export const dynamic = "force-dynamic";

export default async function PremiumPage() {
  return (
    <main style={{ padding: 24, display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0 }}>Premium freischalten</h1>
      <p style={{ maxWidth: 640 }}>
        Unterstütze die Entwicklung eines Buches über die biologische Ursache Psychischer- Krankheiten und 
        schalte zusätzliche Gegenstände,
        exklusive Soundscapes und die Winter-Edition frei. (Hinweis: Im Dezember
        ist die Winter-Edition für alle gratis.)
      </p>

      {/* Wichtig: KEINE onClick-Props von Server nach Client durchreichen */}
      <PremiumCheckoutButton />

      <div>
        <Link href="/" style={{ textDecoration: "none" }}>
          ← Zur Startseite
        </Link>
      </div>
    </main>
  );
}
