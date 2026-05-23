import { useState } from "react";
import { Badge, Btn, Card, StatBox, ProgressBar, DataTable, SectionHeader, Modal, Toast } from "../components/UI.jsx";
import { RSE_REPORT, WASTE_TYPES, getWasteType } from "../data/index.js";

/* ── Certificate header ──────────────────────────────────────────────────── */
function CertHeader() {
  return (
    <div style={{ background: "linear-gradient(135deg,#085041,#0D6040)", borderRadius: 16, padding: "28px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 10, color: "#5DCAA5", fontFamily: "'Space Mono',monospace", letterSpacing: 3, marginBottom: 8 }}>RAPPORT RSE CERTIFIÉ</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 6px" }}>{RSE_REPORT.company}</h2>
        <div style={{ fontSize: 14, color: "#5DCAA5aa" }}>Bilan Environnemental · {RSE_REPORT.period}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <Badge color="#5DCAA5" bg="#08504140" style={{ fontSize: 10, padding: "4px 14px", marginBottom: 8 }}>✓ CERTIFIÉ WASTEBANK</Badge>
        <div style={{ fontSize: 10, color: "#5DCAA5aa", fontFamily: "'Space Mono',monospace" }}>#{RSE_REPORT.certId}</div>
        <div style={{ fontSize: 10, color: "#5DCAA5aa", fontFamily: "'Space Mono',monospace", marginTop: 2 }}>Émis le {RSE_REPORT.issued}</div>
      </div>
    </div>
  );
}

/* ── KPI Cards ───────────────────────────────────────────────────────────── */
function RSEKPIs() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
      <Card style={{ textAlign: "center", border: "1px solid #1D9E7530" }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>♻️</div>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 8 }}>DÉCHETS COLLECTÉS</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#1D9E75" }}>{(RSE_REPORT.totalKg/1000).toFixed(1)}</div>
        <div style={{ fontSize: 12, color: "#888780" }}>tonnes</div>
      </Card>
      <Card style={{ textAlign: "center", border: "1px solid #5DCAA530" }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🌿</div>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 8 }}>CO₂ ÉVITÉ</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#5DCAA5" }}>{RSE_REPORT.co2Saved}</div>
        <div style={{ fontSize: 12, color: "#888780" }}>tCO₂eq estimées</div>
      </Card>
      <Card style={{ textAlign: "center", border: "1px solid #EF9F2730" }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>👨‍👩‍👧</div>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 8 }}>FAMILLES BÉNÉFICIAIRES</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#EF9F27" }}>{RSE_REPORT.families}</div>
        <div style={{ fontSize: 12, color: "#888780" }}>foyers impactés</div>
      </Card>
      <Card style={{ textAlign: "center", border: "1px solid #7F77DD30" }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>💸</div>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 8 }}>FCFA VERSÉS</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#7F77DD" }}>{(RSE_REPORT.fcfaPaid/1000).toFixed(0)}k</div>
        <div style={{ fontSize: 12, color: "#888780" }}>FCFA aux collecteurs</div>
      </Card>
    </div>
  );
}

/* ── Detailed breakdown table ────────────────────────────────────────────── */
function BreakdownTable() {
  return (
    <Card style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>DÉTAIL PAR TYPE DE DÉCHET</div>
      <DataTable
        columns={[
          { label: "Type de déchet", render: r => {
            const wt = getWasteType(r.id);
            return <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span>{wt.emoji}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{wt.label}</div>
                <div style={{ fontSize: 10, color: "#888780" }}>{wt.pricePerKg} FCFA/kg</div>
              </div>
            </div>;
          }},
          { label: "Kg collectés", align: "right", render: r => <span style={{ fontFamily: "'Space Mono',monospace", color: "#1D9E75", fontWeight: 700 }}>{r.kg.toLocaleString("fr-FR")} kg</span> },
          { label: "FCFA versés", align: "right", render: r => <span style={{ fontFamily: "'Space Mono',monospace", color: "#EF9F27" }}>{r.fcfa.toLocaleString("fr-FR")} F</span> },
          { label: "CO₂ évité", align: "right", render: r => <span style={{ fontFamily: "'Space Mono',monospace", color: "#5DCAA5" }}>{r.co2} tCO₂</span> },
          { label: "% du total", align: "right", render: r => {
            const pct = Math.round(r.kg / RSE_REPORT.totalKg * 100);
            return <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
              <div style={{ width: 60 }}><ProgressBar value={pct} max={100} color={getWasteType(r.id).color} showPct={false} /></div>
              <span style={{ fontSize: 11, color: "#888780", minWidth: 30, textAlign: "right" }}>{pct}%</span>
            </div>;
          }},
        ]}
        rows={RSE_REPORT.byType}
      />
      {/* Totals row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderTop: "2px solid #2C2C2A", marginTop: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 800 }}>TOTAL</span>
        <div style={{ display: "flex", gap: 48 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", color: "#1D9E75", fontWeight: 700, fontSize: 13 }}>{RSE_REPORT.totalKg.toLocaleString("fr-FR")} kg</span>
          <span style={{ fontFamily: "'Space Mono',monospace", color: "#EF9F27", fontSize: 13 }}>{RSE_REPORT.fcfaPaid.toLocaleString("fr-FR")} F</span>
          <span style={{ fontFamily: "'Space Mono',monospace", color: "#5DCAA5", fontSize: 13 }}>{RSE_REPORT.co2Saved} tCO₂</span>
          <span style={{ minWidth: 90 }} />
        </div>
      </div>
    </Card>
  );
}

/* ── ODD Alignment ───────────────────────────────────────────────────────── */
function ODDAlignment() {
  const odds = [
    { num: "ODD 1",  icon: "🏠", label: "Pas de pauvreté",            color: "#D85A30", desc: "Revenus directs pour les collecteurs les plus précaires via paiement mobile instantané." },
    { num: "ODD 3",  icon: "🏥", label: "Bonne santé",                color: "#1D9E75", desc: "Réduction des maladies liées aux déchets dans les quartiers couverts par WasteBank." },
    { num: "ODD 10", icon: "⚖", label: "Inégalités réduites",        color: "#7F77DD", desc: "Inclusion financière pour les non-bancarisés grâce au wallet mobile intégré." },
    { num: "ODD 11", icon: "🏙", label: "Villes durables",            color: "#EF9F27", desc: "Collecte organisée des déchets urbains et amélioration du cadre de vie municipal." },
    { num: "ODD 12", icon: "♻️", label: "Consommation responsable",  color: "#5DCAA5", desc: "Traçabilité de la chaîne de recyclage et économie circulaire certifiée." },
    { num: "ODD 13", icon: "🌍", label: "Action pour le climat",      color: "#085041", desc: "Réduction des émissions de CO₂ liées à l'incinération et la décomposition des déchets." },
  ];
  return (
    <Card style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 20 }}>ALIGNEMENT ODD — OBJECTIFS DE DÉVELOPPEMENT DURABLE (ONU)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {odds.map((o, i) => (
          <div key={i} style={{ background: o.color + "15", border: `1px solid ${o.color}30`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{o.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: o.color }}>{o.num}</div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{o.label}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#888780", lineHeight: 1.6 }}>{o.desc}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Timeline activity ───────────────────────────────────────────────────── */
function ActivityTimeline() {
  const events = [
    { date: "15 jan 2026", icon: "🚀", title: "Démarrage du partenariat",      desc: "Signature du contrat RSE entre Entreprise Partenaire SA et WasteBank." },
    { date: "1 fév 2026",  icon: "📍", title: "Activation 2 points de collecte", desc: "Points Médina et Plateau activés avec balances IoT certifiées." },
    { date: "1 mar 2026",  icon: "📍", title: "Activation 2 points supplémentaires", desc: "Points Pikine et Yoff ajoutés au réseau partenaire." },
    { date: "21 mai 2026", icon: "📊", title: "Rapport Q1 certifié",            desc: "Génération et certification du premier bilan trimestriel RSE." },
    { date: "Juin 2026",   icon: "🎯", title: "Objectif Q2: 4 tonnes",          desc: "Doublement de l'objectif de collecte avec 3 nouveaux points planifiés." },
  ];
  return (
    <Card style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 20 }}>CHRONOLOGIE DU PARTENARIAT</div>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 18, top: 0, bottom: 0, width: 1, background: "#2C2C2A" }} />
        {events.map((e, i) => (
          <div key={i} style={{ display: "flex", gap: 20, marginBottom: 20, paddingLeft: 8, position: "relative" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: i === events.length - 1 ? "#1A1A18" : "#1D9E7520", border: `2px solid ${i === events.length - 1 ? "#2C2C2A" : "#1D9E75"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, zIndex: 1 }}>{e.icon}</div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", marginBottom: 3 }}>{e.date}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{e.title}</div>
              <div style={{ fontSize: 11, color: "#888780", lineHeight: 1.6 }}>{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Download & Verification ─────────────────────────────────────────────── */
function DownloadSection() {
  const [state, setState] = useState("idle"); // idle | loading | done
  const [showVerify, setShowVerify] = useState(false);

  const handleDownload = () => {
    setState("loading");
    setTimeout(() => setState("done"), 2000);
  };

  return (
    <Card>
      <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 20 }}>TÉLÉCHARGEMENT & VÉRIFICATION</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Download */}
        <div style={{ background: "#0F0F0C", borderRadius: 12, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>Rapport PDF Certifié</div>
          <div style={{ fontSize: 11, color: "#888780", marginBottom: 20, lineHeight: 1.6 }}>Format PDF · Signé numériquement<br />Conforme normes GRI Standards 2021</div>
          {state === "idle" && <Btn variant="amber" style={{ width: "100%", justifyContent: "center" }} onClick={handleDownload}>📥 Télécharger le rapport</Btn>}
          {state === "loading" && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: 24, height: 24, border: "3px solid #EF9F27", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
            </div>
          )}
          {state === "done" && (
            <div style={{ background: "#08504140", borderRadius: 8, padding: 12 }}>
              <div style={{ color: "#5DCAA5", fontWeight: 800, marginBottom: 4 }}>✓ Téléchargement réussi</div>
              <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace" }}>WasteBank_RSE_Q1_2026.pdf</div>
            </div>
          )}
        </div>
        {/* Verification */}
        <div style={{ background: "#0F0F0C", borderRadius: 12, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>Vérification Blockchain</div>
          <div style={{ fontSize: 11, color: "#888780", marginBottom: 20, lineHeight: 1.6 }}>Hash SHA-256 enregistré<br />sur la chaîne de traçabilité WasteBank</div>
          <Btn variant="outline" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowVerify(true)}>🔍 Vérifier l'authenticité</Btn>
        </div>
      </div>

      <Modal open={showVerify} onClose={() => setShowVerify(false)} title="Vérification du certificat">
        <div>
          <div style={{ background: "#0F0F0C", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#5DCAA5", wordBreak: "break-all", lineHeight: 1.8 }}>
            SHA-256:<br />
            a4f3c2b1e8d7f6a5b4c3d2e1f0a9b8c7<br />
            d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Certificat ID",    value: RSE_REPORT.certId },
              { label: "Émetteur",         value: "WasteBank Platform v1.0" },
              { label: "Date d'émission",  value: RSE_REPORT.issued },
              { label: "Statut",           value: "✓ VALIDE", color: "#5DCAA5" },
              { label: "Conforme GRI",     value: "GRI Standards 2021", color: "#5DCAA5" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "1px solid #2C2C2A" : "none" }}>
                <span style={{ fontSize: 12, color: "#888780" }}>{r.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: r.color || "#fff", fontFamily: "'Space Mono',monospace" }}>{r.value}</span>
              </div>
            ))}
          </div>
          <Btn style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={() => setShowVerify(false)}>Fermer</Btn>
        </div>
      </Modal>
    </Card>
  );
}

/* ── ROOT RSE PAGE ───────────────────────────────────────────────────────── */
export default function RSEPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview",  label: "Vue générale" },
    { id: "detail",    label: "Détail collectes" },
    { id: "odd",       label: "Alignement ODD" },
    { id: "timeline",  label: "Chronologie" },
    { id: "download",  label: "Téléchargement" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px" }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#D85A30", letterSpacing: 4, marginBottom: 8 }}>RAPPORT RSE</div>
      <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 28px" }}>📊 Bilan ESG Certifié</h2>

      <CertHeader />

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid #2C2C2A", paddingBottom: 0, overflowX: "auto" }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ background: "transparent", border: "none", padding: "10px 18px", fontSize: 13, fontWeight: activeSection === s.id ? 800 : 400, color: activeSection === s.id ? "#1D9E75" : "#888780", cursor: "pointer", fontFamily: "'Syne',sans-serif", borderBottom: `2px solid ${activeSection === s.id ? "#1D9E75" : "transparent"}`, transition: "all .2s", whiteSpace: "nowrap", marginBottom: -1 }}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "overview"  && <><RSEKPIs /></>}
      {activeSection === "detail"    && <BreakdownTable />}
      {activeSection === "odd"       && <ODDAlignment />}
      {activeSection === "timeline"  && <ActivityTimeline />}
      {activeSection === "download"  && <DownloadSection />}
    </div>
  );
}
