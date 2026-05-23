import { useState, useEffect } from "react";
import { Badge, LiveDot, Btn, Card } from "../components/UI.jsx";

const FEATURES = [
  { icon: "📱", color: "#1D9E75", title: "App Mobile Offline-first",       desc: "Fonctionne en 2G. Interface Français et Wolof. Fallback USSD pour téléphones basiques sans internet." },
  { icon: "⚡", color: "#EF9F27", title: "Paiement Instantané",            desc: "Wave & Orange Money. Moins de 10 secondes entre le dépôt et la réception de l'argent. Zéro paperasse." },
  { icon: "🤖", color: "#7F77DD", title: "IA de Classification",           desc: "TensorFlow Lite on-device. 4 types de déchets. 87% de précision. Fonctionne sans connexion internet." },
  { icon: "📊", color: "#D85A30", title: "Dashboard Mairie Temps Réel",    desc: "Suivi des collectes, alertes IoT, rapports automatiques pour les collectivités et municipalités." },
  { icon: "🌍", color: "#5DCAA5", title: "Traçabilité RSE Certifiée",      desc: "Rapport CO₂, bilan ESG, conformité GRI. Les entreprises achètent ces données pour leurs investisseurs." },
  { icon: "⚖",  color: "#888780", title: "Balances IoT Connectées",       desc: "Raspberry Pi + MQTT. Pesée automatique certifiée. Synchronisation en temps réel avec le backend." },
];

const HOW_STEPS = [
  { n: "01", title: "Trie & Scanne",    desc: "Le citoyen trie ses déchets à la maison et scanne avec l'app. L'IA identifie le type en temps réel.",          icon: "📷" },
  { n: "02", title: "Dépose & Pèse",    desc: "Dépôt au point de collecte le plus proche. La balance IoT pèse automatiquement et valide le lot.",             icon: "⚖" },
  { n: "03", title: "Encaisse",         desc: "En moins de 10 secondes, le montant est viré sur Wave ou Orange Money. Sans banque. Sans intermédiaire.",       icon: "💸" },
  { n: "04", title: "Impact mesuré",    desc: "Chaque dépôt génère des données RSE certifiées vendues aux entreprises — c'est notre modèle économique.",      icon: "🌱" },
];

const STATS_NUMBERS = [
  { value: "12M",  label: "Personnes ciblées",  sub: "Afrique de l'Ouest an 5",  color: "#1D9E75" },
  { value: "50K",  label: "Tonnes/an recyclées", sub: "Objectif an 2",            color: "#EF9F27" },
  { value: "87%",  label: "Précision IA",        sub: "Classification déchets",   color: "#5DCAA5" },
  { value: "3×",   label: "Revenus familles",    sub: "Ramasseurs informels",     color: "#7F77DD" },
];

export default function LandingPage({ onNavigate }) {
  const [hov, setHov] = useState(null);
  const [counter, setCounter] = useState({ kg: 0, users: 0, fcfa: 0 });

  // Animated counters on mount
  useEffect(() => {
    const targets = { kg: 527, users: 1284, fcfa: 63240 };
    const duration = 1800, steps = 60;
    let step = 0;
    const t = setInterval(() => {
      step++;
      const pct = step / steps;
      const ease = 1 - Math.pow(1 - pct, 3);
      setCounter({
        kg:    Math.round(targets.kg    * ease),
        users: Math.round(targets.users * ease),
        fcfa:  Math.round(targets.fcfa  * ease),
      });
      if (step >= steps) clearInterval(t);
    }, duration / steps);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: "#0A0A08", minHeight: "100vh" }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 64px", position: "relative", overflow: "hidden" }}>
        {/* Ghost bg letter */}
        <div style={{ position: "absolute", right: -60, top: "50%", transform: "translateY(-55%)", fontSize: 480, fontWeight: 900, color: "#111", fontFamily: "'Syne',sans-serif", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>W</div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 700 }}>
          <div style={{ marginBottom: 28 }}>
            <Badge color="#5DCAA5" bg="#085041" style={{ fontSize: 9 }}>
              <LiveDot size={6} color="#5DCAA5" /> Hackathon 2026 · Prototype Fonctionnel
            </Badge>
          </div>

          <h1 style={{ fontSize: "clamp(64px,9vw,108px)", fontWeight: 900, lineHeight: .9, letterSpacing: -4, margin: "0 0 20px" }}>
            <span style={{ color: "#1D9E75" }}>Waste</span><br />
            <span style={{ color: "#EF9F27" }}>Bank.</span>
          </h1>

          <p style={{ fontSize: 18, color: "#888780", lineHeight: 1.7, maxWidth: 520, margin: "0 0 40px" }}>
            La plateforme qui transforme vos déchets en revenus immédiats via mobile money — pour des millions de personnes invisibles en Afrique de l'Ouest.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
            <Btn size="lg" onClick={() => onNavigate("citizen")}>♻️ Démo App Citoyen</Btn>
            <Btn size="lg" variant="outline" onClick={() => onNavigate("mairie")}>🏛 Dashboard Mairie</Btn>
            <Btn size="lg" variant="ghost" onClick={() => onNavigate("rse")}>📊 Rapport RSE</Btn>
          </div>

          {/* Live stats row */}
          <div style={{ display: "flex", gap: 0, borderTop: "1px solid #2C2C2A", paddingTop: 32 }}>
            {[
              { label: "Kg collectés aujourd'hui", value: counter.kg.toLocaleString("fr-FR"), unit: "kg", color: "#1D9E75" },
              { label: "Utilisateurs actifs",      value: counter.users.toLocaleString("fr-FR"), unit: "citoyens", color: "#EF9F27" },
              { label: "FCFA versés ce jour",      value: counter.fcfa.toLocaleString("fr-FR"), unit: "FCFA", color: "#5DCAA5" },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: 40, marginRight: 40, borderRight: i < 2 ? "1px solid #2C2C2A" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <LiveDot size={5} color={s.color} />
                  <span style={{ fontSize: 9, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, textTransform: "uppercase" }}>LIVE</span>
                </div>
                <div style={{ fontSize: 30, fontWeight: 900, color: s.color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#888780", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT NUMBERS ───────────────────────────────────────────── */}
      <section style={{ background: "#0F0F0C", padding: "80px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#1D9E75", letterSpacing: 4, marginBottom: 12 }}>IMPACT À GRANDE ÉCHELLE</div>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: -1.5 }}>Des chiffres qui parlent.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "#2C2C2A" }}>
            {STATS_NUMBERS.map((s, i) => (
              <div key={i} style={{ background: "#0F0F0C", padding: "40px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: s.color, fontFamily: "'Syne',sans-serif", lineHeight: 1, marginBottom: 10 }}>{s.value}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FFF", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 1 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section style={{ padding: "80px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#EF9F27", letterSpacing: 4, marginBottom: 12 }}>COMMENT ÇA MARCHE</div>
            <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5 }}>Simple comme bonjour.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, position: "relative" }}>
            {/* connecting line */}
            <div style={{ position: "absolute", top: 28, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,#1D9E7500,#1D9E75,#1D9E7500)", zIndex: 0 }} />
            {HOW_STEPS.map((st, i) => (
              <div key={i} style={{ padding: "0 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#1A1A18", border: "2px solid #1D9E75", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 22 }}>
                  {st.icon}
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#1D9E75", letterSpacing: 2, marginBottom: 8 }}>ÉTAPE {st.n}</div>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{st.title}</div>
                <div style={{ fontSize: 12, color: "#888780", lineHeight: 1.7 }}>{st.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────── */}
      <section style={{ background: "#0F0F0C", padding: "80px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#7F77DD", letterSpacing: 4, marginBottom: 12 }}>TECHNOLOGIE</div>
            <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5 }}>Pensé pour l'Afrique.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i}
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                style={{ background: "#1A1A18", border: `1px solid ${hov === i ? f.color : "#2C2C2A"}`, borderRadius: 14, padding: "28px 24px", cursor: "default", transition: "border-color .2s, transform .2s", transform: hov === i ? "translateY(-3px)" : "none" }}>
                <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: "#FFF" }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#888780", lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 THEMES ─────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#1D9E75", letterSpacing: 4, marginBottom: 12 }}>3 THÈMES · 1 PLATEFORME</div>
            <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5 }}>L'intersection parfaite.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { color: "#1D9E75", icon: "🌿", theme: "Environnement", points: ["Réduction 40% déchets plastiques dans les quartiers pilotes", "Moins d'incinérations = moins de maladies respiratoires", "Traçabilité certifiée des matériaux recyclés", "Données en temps réel pour les politiques publiques"] },
              { color: "#D85A30", icon: "🏥", theme: "Santé",          points: ["Moins de déchets = moins de moustiques et maladies vectorielles", "Amélioration qualité de l'air dans les quartiers", "Données de collecte corrélées avec épidémiologie", "Réduction des maladies respiratoires de 30% estimée"] },
              { color: "#7F77DD", icon: "💳", theme: "Fintech",         points: ["Premier compte mobile pour personnes non-bancarisées", "Paiement instantané Wave & Orange Money", "Historique de transactions = score de crédit", "Accès aux microprêts via partenaires financiers"] },
            ].map((t, i) => (
              <div key={i} style={{ background: "#1A1A18", border: `1px solid ${t.color}33`, borderRadius: 14, padding: "28px 24px", borderTop: `4px solid ${t.color}` }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{t.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: t.color, marginBottom: 20 }}>{t.theme}</div>
                {t.points.map((p, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                    <span style={{ color: t.color, fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 12, color: "#888780", lineHeight: 1.6 }}>{p}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section style={{ background: "#0F0F0C", padding: "100px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#1D9E75", letterSpacing: 4, marginBottom: 20 }}>EXPLOREZ LA PLATEFORME</div>
          <h2 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, letterSpacing: -2, marginBottom: 16 }}>
            Les déchets sont<br /><span style={{ color: "#1D9E75" }}>notre or.</span>
          </h2>
          <p style={{ color: "#888780", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            Chaque section est interactive et fonctionnelle. Découvrez l'app citoyen, le dashboard mairie et les rapports RSE.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn size="lg" onClick={() => onNavigate("citizen")}>📱 App Citoyen</Btn>
            <Btn size="lg" variant="outline" onClick={() => onNavigate("mairie")}>🏛 Dashboard Mairie</Btn>
            <Btn size="lg" variant="ghost" onClick={() => onNavigate("rse")}>📊 Rapport RSE</Btn>
            <Btn size="lg" variant="ghost" onClick={() => onNavigate("admin")}>⚙️ Admin</Btn>
          </div>
        </div>
      </section>

    </div>
  );
}
