import { useState } from "react";
import { Ticker, LiveDot, Badge, Btn } from "./components/UI.jsx";
import LandingPage    from "./pages/Landing.jsx";
import CitizenPage    from "./pages/Citizen.jsx";
import MairiePage     from "./pages/Mairie.jsx";
import RSEPage        from "./pages/RSE.jsx";
import AdminPage      from "./pages/Admin.jsx";

const ROUTES = [
  { id: "landing",  label: "Accueil",        icon: "🌍", color: "#1D9E75" },
  { id: "citizen",  label: "App Citoyen",    icon: "📱", color: "#1D9E75" },
  { id: "mairie",   label: "Mairie",         icon: "🏛",  color: "#EF9F27" },
  { id: "rse",      label: "Rapport RSE",    icon: "📊", color: "#7F77DD" },
  { id: "admin",    label: "Admin",          icon: "⚙️",  color: "#D85A30" },
];

/* ── Top navigation bar ──────────────────────────────────────────────────── */
function Navbar({ current, navigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav style={{ background: "#0F0F0C", borderBottom: "1px solid #2C2C2A", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 100 }}>
      {/* Logo */}
      <button onClick={() => navigate("landing")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1D9E7520", border: "1px solid #1D9E7540", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>♻</div>
        <span style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>
          <span style={{ color: "#1D9E75" }}>Waste</span><span style={{ color: "#EF9F27" }}>Bank</span>
        </span>
      </button>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 2 }}>
        {ROUTES.slice(1).map(r => (
          <button key={r.id} onClick={() => navigate(r.id)}
            style={{ background: current === r.id ? r.color + "20" : "transparent", border: "none", borderRadius: 7, padding: "6px 14px", color: current === r.id ? r.color : "#888780", fontSize: 12, fontWeight: current === r.id ? 700 : 400, cursor: "pointer", fontFamily: "'Syne',sans-serif", transition: "all .15s", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13 }}>{r.icon}</span>
            <span>{r.label}</span>
          </button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Badge color="#5DCAA5" bg="#08504120" style={{ fontSize: 8 }}>
          <LiveDot size={5} /> v1.0.0 PROTOTYPE
        </Badge>
      </div>
    </nav>
  );
}

/* ── Progress bar at top ─────────────────────────────────────────────────── */
function PageProgress({ current }) {
  const idx = ROUTES.findIndex(r => r.id === current);
  const pct = ((idx) / (ROUTES.length - 1)) * 100;
  const color = ROUTES[idx]?.color || "#1D9E75";
  return (
    <div style={{ height: 2, background: "#2C2C2A", position: "sticky", top: 52, zIndex: 99 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width .4s ease, background .3s ease" }} />
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
function Footer({ navigate }) {
  return (
    <footer style={{ background: "#0F0F0C", borderTop: "1px solid #2C2C2A", padding: "32px 48px", marginTop: 60 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Syne',sans-serif", marginBottom: 8 }}>
            <span style={{ color: "#1D9E75" }}>Waste</span><span style={{ color: "#EF9F27" }}>Bank</span>
          </div>
          <div style={{ fontSize: 11, color: "#888780", lineHeight: 1.7, maxWidth: 280 }}>
            La plateforme qui transforme les déchets en revenus immédiats via mobile money en Afrique de l'Ouest.
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
            <Badge color="#1D9E75">Env</Badge>
            <Badge color="#D85A30">Santé</Badge>
            <Badge color="#7F77DD">Fintech</Badge>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 12 }}>NAVIGATION</div>
          {ROUTES.map(r => (
            <button key={r.id} onClick={() => navigate(r.id)}
              style={{ display: "block", background: "none", border: "none", color: "#888780", fontSize: 12, cursor: "pointer", padding: "3px 0", fontFamily: "'Syne',sans-serif", textAlign: "left" }}>
              {r.icon} {r.label}
            </button>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 12 }}>TECHNOLOGIE</div>
          {["React Native","FastAPI","TensorFlow Lite","Apache Kafka","PostgreSQL","Docker","Raspberry Pi IoT","Wave API","Orange Money API"].map(t => (
            <div key={t} style={{ fontSize: 11, color: "#888780", padding: "2px 0" }}>{t}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 12 }}>CONTACT</div>
          <div style={{ fontSize: 12, color: "#888780", lineHeight: 2 }}>
            <div>wastebank.africa</div>
            <div>contact@wastebank.africa</div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 1, marginBottom: 6 }}>HACKATHON 2026</div>
              <Badge color="#1D9E75" bg="#08504120">Environnement · Santé · Fintech</Badge>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "24px auto 0", paddingTop: 20, borderTop: "1px solid #2C2C2A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace" }}>© 2026 WasteBank · Tous droits réservés · Prototype Hackathon</div>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", display: "flex", alignItems: "center", gap: 6 }}>
          <LiveDot size={5} /> Système opérationnel
        </div>
      </div>
    </footer>
  );
}

/* ── ROOT APP ────────────────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("landing");

  const navigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A08", color: "#FFFFFF", fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A08; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #0A0A08; }
        ::-webkit-scrollbar-thumb { background: #2C2C2A; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #1D9E75; }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes scanline{ 0%{top:8%} 100%{top:86%} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        button:focus-visible { outline: 2px solid #1D9E75; outline-offset: 2px; }
        input:focus { border-color: #1D9E75 !important; }
      `}</style>

      <Ticker />
      <Navbar current={page} navigate={navigate} />
      <PageProgress current={page} />

      <main>
        {page === "landing" && <LandingPage onNavigate={navigate} />}
        {page === "citizen" && <CitizenPage />}
        {page === "mairie"  && <MairiePage />}
        {page === "rse"     && <RSEPage />}
        {page === "admin"   && <AdminPage />}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}
