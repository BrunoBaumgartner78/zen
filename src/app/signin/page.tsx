export const dynamic = "force-dynamic"

export default function SignInPage() {
  return (
    <div style={{ display:"grid", placeItems:"center", height:"100dvh", background:"#E9E3D5" }}>
      <div style={{ padding:20, borderRadius:14, background:"rgba(255,255,255,0.7)", backdropFilter:"blur(8px)" }}>
        <h1 style={{ marginTop:0 }}>Anmelden</h1>
        <p>Gib deine E-Mail auf der nächsten Seite ein, wir senden dir einen Login-Link.</p>
        <a
          href="/api/auth/signin"
          style={{ display:"inline-block", marginTop:8, padding:"8px 12px", borderRadius:10, background:"#1b1b1b", color:"#fff", textDecoration:"none" }}
        >
          Weiter zum Login
        </a>
      </div>
    </div>
  )
}
