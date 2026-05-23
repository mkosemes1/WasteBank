import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// WasteBank — Central Data Store
// ─────────────────────────────────────────────────────────────────────────────

export const WASTE_TYPES = [
  { id: "pet",    label: "Plastique PET",  emoji: "🧴", pricePerKg: 120, color: "#5DCAA5", co2PerKg: 0.7  },
  { id: "alu",    label: "Aluminium",      emoji: "🥫", pricePerKg: 380, color: "#EF9F27", co2PerKg: 0.6  },
  { id: "paper",  label: "Papier/Carton",  emoji: "📦", pricePerKg: 45,  color: "#7F77DD", co2PerKg: 0.45 },
  { id: "glass",  label: "Verre",          emoji: "🍾", pricePerKg: 30,  color: "#D85A30", co2PerKg: 0.3  },
];

export const COLLECTION_POINTS = [
  { id: "cp1", name: "WasteBank Médina",   address: "Rue 23, Médina, Dakar",          hours: "07:00–19:00", lat: 14.692,  lng: -17.447, kgToday: 142, capacity: 500, online: true,  rating: 4.8, operator: "Moussa Diallo"   },
  { id: "cp2", name: "WasteBank Plateau",  address: "Av. Pompidou, Plateau, Dakar",   hours: "08:00–20:00", lat: 14.668,  lng: -17.432, kgToday: 98,  capacity: 400, online: true,  rating: 4.6, operator: "Fatou Ndiaye"    },
  { id: "cp3", name: "WasteBank Yoff",     address: "Route de l'aéroport, Yoff",      hours: "07:30–18:30", lat: 14.741,  lng: -17.490, kgToday: 76,  capacity: 350, online: false, rating: 4.7, operator: "Ibrahima Sow"    },
  { id: "cp4", name: "WasteBank Pikine",   address: "Marché Thiaroye, Pikine",        hours: "06:00–18:00", lat: 14.741,  lng: -17.397, kgToday: 211, capacity: 600, online: true,  rating: 4.5, operator: "Aissatou Balde"  },
];

export const TRANSACTIONS = [
  { id: "WB-2841", date: "2026-05-21T09:12:00", type: "pet",   kg: 2.4, fcfa: 288,  point: "cp1", userId: "u1", status: "paid" },
  { id: "WB-2840", date: "2026-05-20T16:45:00", type: "alu",   kg: 0.8, fcfa: 304,  point: "cp2", userId: "u1", status: "paid" },
  { id: "WB-2838", date: "2026-05-20T11:22:00", type: "paper", kg: 3.1, fcfa: 139,  point: "cp1", userId: "u1", status: "paid" },
  { id: "WB-2835", date: "2026-05-18T14:05:00", type: "glass", kg: 4.0, fcfa: 120,  point: "cp3", userId: "u1", status: "paid" },
  { id: "WB-2831", date: "2026-05-15T08:33:00", type: "pet",   kg: 1.9, fcfa: 228,  point: "cp2", userId: "u1", status: "paid" },
  { id: "WB-2830", date: "2026-05-14T17:20:00", type: "alu",   kg: 1.2, fcfa: 456,  point: "cp1", userId: "u1", status: "paid" },
  { id: "WB-2828", date: "2026-05-13T10:11:00", type: "paper", kg: 5.5, fcfa: 247,  point: "cp4", userId: "u1", status: "paid" },
];

export const CITIZEN_USER = {
  id: "u1", name: "Amadou Diallo", phone: "+221 77 123 45 67",
  balance: 4750, totalEarned: 38420, totalKg: 47.2,
  level: "Collecteur Bronze", points: 340, joinedDate: "2026-01-15",
  wallet: "Wave",
};

export const MAIRIE_STATS = {
  kgToday: 527, kgMonth: 8400, kgYear: 41200,
  usersActive: 1284, totalUsers: 3870,
  fcfaToday: 63240, fcfaMonth: 948000,
  co2Avoided: 28.4,
  monthlyData: [
    { month: "Jan", kg: 5200, users: 620  },
    { month: "Fév", kg: 6800, users: 780  },
    { month: "Mar", kg: 7400, users: 940  },
    { month: "Avr", kg: 6900, users: 1100 },
    { month: "Mai", kg: 8400, users: 1284 },
  ],
  byType: [
    { id: "pet",   pct: 52, kg: 4368 },
    { id: "alu",   pct: 22, kg: 1848 },
    { id: "paper", pct: 16, kg: 1344 },
    { id: "glass", pct: 10, kg: 840  },
  ],
};

export const RSE_REPORT = {
  company: "Entreprise Partenaire SA",
  period: "Q1 2026",
  certId: "WB-RSE-2026-001",
  issued: "21 mai 2026",
  totalKg: 2400, co2Saved: 1.8, families: 47, fcfaPaid: 406300,
  byType: [
    { id: "pet",   kg: 1240, fcfa: 148800, co2: 0.87 },
    { id: "alu",   kg: 620,  fcfa: 235600, co2: 0.52 },
    { id: "paper", kg: 380,  fcfa: 17100,  co2: 0.27 },
    { id: "glass", kg: 160,  fcfa: 4800,   co2: 0.14 },
  ],
};

export const ALERTS_DATA = [
  { id: 1, level: "warning", msg: "Collecte Pikine — Capacité 92%",        time: "Il y a 3 min",  point: "cp4" },
  { id: 2, level: "info",    msg: "Pic dépôts Médina +40% vs hier",         time: "Il y a 12 min", point: "cp1" },
  { id: 3, level: "error",   msg: "Balance IoT hors ligne — Yoff",          time: "Il y a 34 min", point: "cp3" },
  { id: 4, level: "info",    msg: "Nouveau collecteur enregistré × 14",     time: "Il y a 1h",     point: null  },
];

// Helper formatters
export const formatFcfa = n => n.toLocaleString("fr-FR") + " FCFA";
export const formatKg   = n => n.toLocaleString("fr-FR") + " kg";
export const formatDate = iso => {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)  return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff/3600)}h`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};
export const getWasteType = id => WASTE_TYPES.find(w => w.id === id);
export const getPoint     = id => COLLECTION_POINTS.find(p => p.id === id);


/* ── Live Ticker ─────────────────────────────────────────────────────────── */
export function Ticker() {
  const items = [
    "WasteBank · Dakar", "527 kg collectés aujourd'hui",
    "Plastique PET: 120 FCFA/kg", "Aluminium: 380 FCFA/kg",
    "Papier/Carton: 45 FCFA/kg", "Verre: 30 FCFA/kg",
    "3/4 points actifs", "1 284 utilisateurs en ligne",
    "87% précision IA", "1.8 tCO₂eq évitées ce mois",
  ];
  const all = [...items, ...items];
  return (
    <div style={{ background: "#085041", height: 30, overflow: "hidden", display: "flex", alignItems: "center", position: "relative", zIndex: 200 }}>
      <div style={{ display: "flex", gap: 56, animation: "ticker 22s linear infinite", whiteSpace: "nowrap" }}>
        {all.map((it, i) => (
          <span key={i} style={{ fontSize: 9.5, color: "#5DCAA5", fontFamily: "'Space Mono', monospace", letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <LiveDot size={5} /> {it}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Live Dot ────────────────────────────────────────────────────────────── */
export function LiveDot({ color = "#5DCAA5", size = 7 }) {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setInterval(() => setOn(v => !v), 950); return () => clearInterval(t); }, []);
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: color, opacity: on ? 1 : .3, transition: "opacity .35s", flexShrink: 0 }} />;
}

/* ── Badge ───────────────────────────────────────────────────────────────── */
export function Badge({ children, color = "#5DCAA5", bg, style = {} }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: bg || color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 10px", fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap", ...style }}>
      {children}
    </span>
  );
}

/* ── Card ────────────────────────────────────────────────────────────────── */
export function Card({ children, style = {}, onClick, hover = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{ background: "#1A1A18", border: `1px solid ${hov ? "#1D9E75" : "#2C2C2A"}`, borderRadius: 12, padding: 24, cursor: onClick ? "pointer" : "default", transition: "border-color .2s, transform .2s", transform: hov ? "translateY(-2px)" : "none", ...style }}>
      {children}
    </div>
  );
}

/* ── Button ──────────────────────────────────────────────────────────────── */
export function Btn({ children, variant = "primary", onClick, style = {}, disabled = false, size = "md" }) {
  const sizes = { sm: "7px 14px", md: "11px 22px", lg: "14px 32px" };
  const fontSizes = { sm: 11, md: 13, lg: 15 };
  const variants = {
    primary:  { background: "#1D9E75", color: "#000" },
    amber:    { background: "#EF9F27", color: "#000" },
    outline:  { background: "transparent", border: "1px solid #1D9E75", color: "#1D9E75" },
    ghost:    { background: "#2C2C2A", color: "#888780" },
    danger:   { background: "#D85A30", color: "#fff" },
    purple:   { background: "#7F77DD", color: "#fff" },
  };
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", borderRadius: 7, padding: sizes[size], fontSize: fontSizes[size], fontWeight: 700, fontFamily: "'Syne', sans-serif", transition: "all .18s", opacity: disabled ? .5 : 1, cursor: disabled ? "not-allowed" : "pointer", whiteSpace: "nowrap", ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

/* ── Stat box ────────────────────────────────────────────────────────────── */
export function StatBox({ label, value, unit, color = "#1D9E75", icon, delta }) {
  return (
    <Card style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono', monospace", letterSpacing: 2, lineHeight: 1.5 }}>{label.toUpperCase()}</div>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>{value}</div>
      {unit && <div style={{ fontSize: 10, color: "#888780", marginTop: 3, fontFamily: "'Space Mono', monospace" }}>{unit}</div>}
      {delta && <div style={{ fontSize: 10, color: delta > 0 ? "#5DCAA5" : "#D85A30", marginTop: 6 }}>{delta > 0 ? "▲" : "▼"} {Math.abs(delta)}% vs hier</div>}
    </Card>
  );
}

/* ── Mini bar chart ──────────────────────────────────────────────────────── */
export function BarChart({ data, valueKey = "kg", labelKey = "month", color = "#1D9E75", height = 100 }) {
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 8, color: "#888780", textAlign: "center", marginBottom: 3, fontFamily: "'Space Mono', monospace" }}>
              {(d[valueKey] / 1000).toFixed(1)}t
            </div>
            <div style={{ width: "100%", borderRadius: "3px 3px 0 0", height: `${(d[valueKey] / max) * 65}%`, background: i === data.length - 1 ? color : "#2C2C2A", transition: "height .5s ease", minHeight: 4 }} />
          </div>
          <div style={{ fontSize: 9, color: "#888780", fontFamily: "'Space Mono', monospace", letterSpacing: .5 }}>{d[labelKey]}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Donut chart (CSS) ───────────────────────────────────────────────────── */
export function DonutChart({ segments, size = 100 }) {
  let offset = 0;
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#2C2C2A" strokeWidth="18" />
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circ;
        const el = (
          <circle key={i} cx="50" cy="50" r={r} fill="none"
            stroke={s.color} strokeWidth="18"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-(offset / 100) * circ}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px", transition: "stroke-dasharray .6s ease" }}
          />
        );
        offset += s.pct;
        return el;
      })}
      <text x="50" y="54" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="Syne, sans-serif">
        {segments.reduce((a, s) => a + s.pct, 0)}%
      </text>
    </svg>
  );
}

/* ── Progress bar ────────────────────────────────────────────────────────── */
export function ProgressBar({ value, max, color = "#1D9E75", label, showPct = true }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 12, color: "#C8C6BF" }}>{label}</span>
          {showPct && <span style={{ fontSize: 11, color, fontFamily: "'Space Mono', monospace" }}>{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div style={{ height: 5, background: "#2C2C2A", borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width .6s ease" }} />
      </div>
    </div>
  );
}

/* ── Alert banner ────────────────────────────────────────────────────────── */
export function AlertBanner({ level = "info", message, time, onDismiss }) {
  const styles = {
    info:    { bg: "#1D9E7522", border: "#1D9E7544", dot: "#5DCAA5", icon: "ℹ" },
    warning: { bg: "#EF9F2722", border: "#EF9F2744", dot: "#EF9F27", icon: "⚠" },
    error:   { bg: "#D85A3022", border: "#D85A3044", dot: "#D85A30", icon: "✕" },
  };
  const s = styles[level];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 13, color: s.dot }}>{s.icon}</span>
        <span style={{ fontSize: 12, color: "#C8C6BF" }}>{message}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {time && <span style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono', monospace" }}>{time}</span>}
        {onDismiss && (
          <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#888780", cursor: "pointer", fontSize: 14, padding: 2, lineHeight: 1 }}>×</button>
        )}
      </div>
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#1A1A18", border: "1px solid #2C2C2A", borderRadius: 16, width, maxWidth: "100%", maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #2C2C2A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888780", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Loader ──────────────────────────────────────────────────────────────── */
export function Loader({ size = 20, color = "#1D9E75" }) {
  return (
    <div style={{ width: size, height: size, border: `2px solid ${color}30`, borderTopColor: color, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
  );
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
export function Toast({ message, type = "success", visible }) {
  const colors = { success: "#1D9E75", error: "#D85A30", info: "#7F77DD" };
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 2000,
      background: "#1A1A18", border: `1px solid ${colors[type]}`, borderRadius: 10,
      padding: "12px 20px", display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 8px 32px rgba(0,0,0,.5)",
      transition: "all .35s", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
      pointerEvents: visible ? "auto" : "none",
    }}>
      <span style={{ color: colors[type], fontSize: 16 }}>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
      <span style={{ fontSize: 13, color: "#C8C6BF" }}>{message}</span>
    </div>
  );
}

/* ── Section header ──────────────────────────────────────────────────────── */
export function SectionHeader({ tag, title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {tag && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#1D9E75", letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>{tag}</div>}
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>{title}</h2>
      {sub && <p style={{ color: "#888780", marginTop: 6, fontSize: 13, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

/* ── Table ───────────────────────────────────────────────────────────────── */
export function DataTable({ columns, rows, emptyMsg = "Aucune donnée" }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2, color: "#888780", textTransform: "uppercase", padding: "10px 14px", textAlign: c.align || "left", borderBottom: "1px solid #2C2C2A", whiteSpace: "nowrap" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: "#888780", fontSize: 13 }}>{emptyMsg}</td></tr>
            : rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #1A1A18" }}>
                {columns.map((c, j) => (
                  <td key={j} style={{ padding: "12px 14px", fontSize: 13, color: "#C8C6BF", textAlign: c.align || "left" }}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

/* ── Nav sidebar item ────────────────────────────────────────────────────── */
export function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: active ? "#1D9E7520" : "transparent", border: "none", borderRadius: 8, color: active ? "#5DCAA5" : "#888780", fontSize: 13, fontWeight: active ? 700 : 400, cursor: "pointer", fontFamily: "'Syne', sans-serif", transition: "all .15s", borderLeft: `2px solid ${active ? "#1D9E75" : "transparent"}`, position: "relative" }}>
      <span style={{ fontSize: 17, minWidth: 20 }}>{icon}</span>
      <span>{label}</span>
      {badge && <span style={{ marginLeft: "auto", background: "#D85A30", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{badge}</span>}
    </button>
  );
}

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

/* ── Mini phone shell wrapper ────────────────────────────────────────────── */
function PhoneShell({ children }) {
  return (
    <div style={{ maxWidth: 390, margin: "0 auto", background: "#0F0F0C", borderRadius: 36, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,.8), 0 0 0 1px #2C2C2A", border: "8px solid #1A1A18", minHeight: 780 }}>
      {/* Notch */}
      <div style={{ background: "#0A0A08", height: 36, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <div style={{ width: 60, height: 5, background: "#2C2C2A", borderRadius: 10 }} />
      </div>
      {children}
      {/* Home bar */}
      <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "#0F0F0C" }}>
        <div style={{ width: 80, height: 4, background: "#2C2C2A", borderRadius: 10 }} />
      </div>
    </div>
  );
}

/* ── HOME tab ────────────────────────────────────────────────────────────── */
function HomeTab({ user, balance, txList, onNavigate }) {
  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(160deg,#085041,#0D6040)", padding: "20px 20px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: "#5DCAA5", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 4 }}>BONJOUR 👋</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{user.name}</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1D9E7540", border: "2px solid #5DCAA5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>AD</div>
        </div>
        {/* Balance card */}
        <div style={{ background: "rgba(0,0,0,.25)", borderRadius: 16, padding: "18px 20px", backdropFilter: "blur(10px)" }}>
          <div style={{ fontSize: 10, color: "#5DCAA5aa", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 6 }}>MON SOLDE WAVE</div>
          <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>{balance.toLocaleString("fr-FR")}</div>
          <div style={{ fontSize: 12, color: "#5DCAA5", marginBottom: 16 }}>FCFA</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="amber" style={{ flex: 1, padding: "8px 0", fontSize: 11, justifyContent: "center" }}>💸 Retirer</Btn>
            <Btn variant="outline" style={{ flex: 1, padding: "8px 0", fontSize: 11, justifyContent: "center" }}>📤 Partager</Btn>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Level + progress */}
        <div style={{ background: "#1A1A18", border: "1px solid #2C2C2A", borderRadius: 12, padding: "14px 16px", margin: "16px 0", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 28 }}>🥉</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{user.level}</div>
            <div style={{ marginBottom: 4 }}>
              <ProgressBar value={user.points} max={500} color="#EF9F27" />
            </div>
            <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace" }}>{user.points}/500 pts · Prochain: Collecteur Argent</div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, margin: "16px 0 10px" }}>ACTIONS RAPIDES</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[
            { icon: "📷", label: "Scanner",   action: "scan",    color: "#1D9E75" },
            { icon: "📍", label: "Dépôts",    action: "points",  color: "#EF9F27" },
            { icon: "📋", label: "Historique", action: "history", color: "#7F77DD" },
            { icon: "🤝", label: "Parrainer",  action: null,      color: "#D85A30" },
          ].map((a, i) => (
            <button key={i} onClick={() => a.action && onNavigate(a.action)}
              style={{ background: "#1A1A18", border: `1px solid ${a.color}30`, borderRadius: 10, padding: "14px 12px", cursor: a.action ? "pointer" : "default", display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: a.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{a.icon}</div>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Prices */}
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, margin: "0 0 10px" }}>PRIX DU JOUR</div>
        {WASTE_TYPES.map((w, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: "#1A1A18", borderRadius: 9, marginBottom: 6, border: "1px solid #2C2C2A" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span>{w.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{w.label}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: w.color, fontFamily: "'Space Mono',monospace" }}>{w.pricePerKg} F/kg</span>
          </div>
        ))}

        {/* Recent transactions */}
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, margin: "20px 0 10px" }}>DERNIÈRES TRANSACTIONS</div>
        {txList.slice(0, 3).map((tx, i) => {
          const wt = getWasteType(tx.type);
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: "#1A1A18", borderRadius: 9, marginBottom: 6, border: "1px solid #2C2C2A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: wt.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{wt.emoji}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{wt.label}</div>
                  <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace" }}>{tx.kg} kg · {formatDate(tx.date)}</div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#1D9E75", fontFamily: "'Space Mono',monospace" }}>+{tx.fcfa}</span>
            </div>
          );
        })}
        <button onClick={() => onNavigate("history")} style={{ width: "100%", background: "transparent", border: "1px solid #2C2C2A", borderRadius: 9, padding: "10px 0", color: "#888780", fontSize: 12, cursor: "pointer", marginTop: 4 }}>
          Voir tout l'historique →
        </button>
      </div>
    </div>
  );
}

/* ── SCAN tab ────────────────────────────────────────────────────────────── */
function ScanTab({ onDeposit }) {
  const [phase, setPhase] = useState("idle"); // idle | scanning | result | confirm | done
  const [detected, setDetected] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [kg, setKg] = useState("1.5");
  const [selectedPoint, setSelectedPoint] = useState("cp1");

  const handleScan = () => {
    setPhase("scanning");
    setConfidence(0);
    const waste = WASTE_TYPES[Math.floor(Math.random() * WASTE_TYPES.length)];
    let c = 0;
    const interval = setInterval(() => {
      c += Math.random() * 15;
      if (c >= 100) { c = 87 + Math.random() * 10; clearInterval(interval); setDetected(waste); setPhase("result"); }
      setConfidence(Math.min(c, 97));
    }, 120);
  };

  const handleConfirm = () => {
    setPhase("confirm");
    setTimeout(() => {
      onDeposit({ waste: detected, kg: parseFloat(kg), point: selectedPoint });
      setPhase("done");
    }, 1800);
  };

  const reset = () => { setPhase("idle"); setDetected(null); setKg("1.5"); };
  const earned = detected ? Math.round(detected.pricePerKg * parseFloat(kg || 0)) : 0;

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Scanner mes déchets</div>
      <div style={{ fontSize: 11, color: "#888780", marginBottom: 20 }}>L'IA identifie le type de déchet en temps réel</div>

      {/* Camera frame */}
      <div style={{ width: "100%", aspectRatio: "4/3", background: "#050505", borderRadius: 16, border: `2px solid ${phase === "scanning" ? "#1D9E75" : phase === "result" ? "#5DCAA5" : "#2C2C2A"}`, overflow: "hidden", position: "relative", marginBottom: 16, transition: "border-color .3s" }}>

        {phase === "idle" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ fontSize: 48 }}>📷</div>
            <div style={{ fontSize: 12, color: "#888780" }}>Caméra inactive</div>
            {/* Corner markers */}
            {["top:16px;left:16px;border-top:2px solid #2C2C2A;border-left:2px solid #2C2C2A", "top:16px;right:16px;border-top:2px solid #2C2C2A;border-right:2px solid #2C2C2A", "bottom:16px;left:16px;border-bottom:2px solid #2C2C2A;border-left:2px solid #2C2C2A", "bottom:16px;right:16px;border-bottom:2px solid #2C2C2A;border-right:2px solid #2C2C2A"].map((s, i) => {
              const parts = Object.fromEntries(s.split(";").map(p => p.split(":")));
              return <div key={i} style={{ position: "absolute", width: 24, height: 24, ...Object.fromEntries(s.split(";").map(p => { const [k,...v] = p.split(":"); return [k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()), v.join(":").trim()]; })) }} />;
            })}
          </div>
        )}

        {phase === "scanning" && (
          <div style={{ position: "absolute", inset: 0 }}>
            {/* Scanline */}
            <div style={{ position: "absolute", left: 20, right: 20, height: 2, background: "linear-gradient(90deg,transparent,#1D9E75,transparent)", animation: "scanline 1.1s ease-in-out infinite", zIndex: 2 }} />
            {/* Grid pattern */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#1D9E7508 1px, transparent 1px),linear-gradient(90deg,#1D9E7508 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
            <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#1D9E75", fontFamily: "'Space Mono',monospace", letterSpacing: 2 }}>ANALYSE EN COURS... {confidence.toFixed(0)}%</div>
              <div style={{ width: "60%", margin: "8px auto 0", height: 3, background: "#2C2C2A", borderRadius: 2 }}>
                <div style={{ width: `${confidence}%`, height: "100%", background: "#1D9E75", borderRadius: 2, transition: "width .1s" }} />
              </div>
            </div>
          </div>
        )}

        {(phase === "result" || phase === "confirm" || phase === "done") && detected && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#050505" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{detected.emoji}</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{detected.label}</div>
            <Badge color={detected.color} bg={detected.color + "20"}>
              ✓ Identifié · {confidence.toFixed(0)}% confiance
            </Badge>
          </div>
        )}
      </div>

      {/* Actions */}
      {phase === "idle" && <Btn style={{ width: "100%", justifyContent: "center", padding: "14px 0", fontSize: 14 }} onClick={handleScan}>📷 Lancer le scan IA</Btn>}

      {phase === "scanning" && (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 13, color: "#888780" }}>Analyse en cours, ne bougez pas...</div>
        </div>
      )}

      {phase === "result" && detected && (
        <div style={{ background: "#1A1A18", border: "1px solid #2C2C2A", borderRadius: 12, padding: 16, marginTop: 4 }}>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 14 }}>CONFIGURER LE DÉPÔT</div>

          {/* Kg input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 6 }}>QUANTITÉ (KG)</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => setKg(v => Math.max(0.1, parseFloat(v)-0.1).toFixed(1))} style={{ width: 36, height: 36, background: "#2C2C2A", border: "none", borderRadius: 6, color: "#fff", fontSize: 18, cursor: "pointer" }}>−</button>
              <input value={kg} onChange={e => setKg(e.target.value)} style={{ flex: 1, background: "#2C2C2A", border: "none", borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 15, fontFamily: "'Syne',sans-serif", textAlign: "center" }} />
              <button onClick={() => setKg(v => (parseFloat(v)+0.1).toFixed(1))} style={{ width: 36, height: 36, background: "#2C2C2A", border: "none", borderRadius: 6, color: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
            </div>
          </div>

          {/* Point selection */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 6 }}>POINT DE DÉPÔT</label>
            <select value={selectedPoint} onChange={e => setSelectedPoint(e.target.value)}
              style={{ width: "100%", background: "#2C2C2A", border: "none", borderRadius: 6, padding: "9px 12px", color: "#fff", fontSize: 12, fontFamily: "'Syne',sans-serif", outline: "none" }}>
              {COLLECTION_POINTS.filter(p => p.online).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Estimate */}
          <div style={{ background: "#2C2C2A", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: "#888780" }}>Estimation</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#EF9F27", fontFamily: "'Space Mono',monospace" }}>{earned.toLocaleString("fr-FR")} FCFA</span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: "center", padding: "11px 0" }} onClick={reset}>Annuler</Btn>
            <Btn variant="amber" style={{ flex: 2, justifyContent: "center", padding: "11px 0" }} onClick={handleConfirm}>💸 Confirmer le dépôt</Btn>
          </div>
        </div>
      )}

      {phase === "confirm" && (
        <div style={{ background: "#1D9E7520", border: "1px solid #1D9E7544", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: "3px solid #1D9E75", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 13, color: "#5DCAA5" }}>Transaction Wave en cours...</div>
        </div>
      )}

      {phase === "done" && (
        <div style={{ background: "#085041", border: "1px solid #1D9E75", borderRadius: 12, padding: "24px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#5DCAA5", marginBottom: 4 }}>Paiement reçu!</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#EF9F27", fontFamily: "'Space Mono',monospace", marginBottom: 12 }}>{earned.toLocaleString("fr-FR")} FCFA</div>
          <div style={{ fontSize: 11, color: "#5DCAA5aa", marginBottom: 16 }}>Versé sur votre compte Wave</div>
          <Btn onClick={reset} style={{ justifyContent: "center", padding: "10px 24px" }}>Nouveau scan</Btn>
        </div>
      )}
    </div>
  );
}

/* ── POINTS tab ──────────────────────────────────────────────────────────── */
function PointsTab() {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Points de collecte</div>
      <div style={{ fontSize: 11, color: "#888780", marginBottom: 16 }}>4 points à Dakar</div>

      {COLLECTION_POINTS.map((p, i) => (
        <div key={i} onClick={() => setSelected(selected === p.id ? null : p.id)}
          style={{ background: "#1A1A18", border: `1px solid ${selected === p.id ? "#1D9E75" : "#2C2C2A"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer", transition: "border-color .2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{p.name}</div>
            <Badge color={p.online ? "#5DCAA5" : "#D85A30"} bg={p.online ? "#08504120" : "#D85A3020"}>
              {p.online ? <><LiveDot size={5} /> Ouvert</> : "⚠ IoT hors ligne"}
            </Badge>
          </div>
          <div style={{ fontSize: 11, color: "#888780", marginBottom: 4 }}>📍 {p.address}</div>
          <div style={{ fontSize: 11, color: "#888780", marginBottom: 8 }}>🕐 {p.hours}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ fontSize: 11, color: "#5DCAA5", fontFamily: "'Space Mono',monospace" }}>{p.kgToday} kg auj.</span>
              <span style={{ fontSize: 11, color: "#EF9F27" }}>⭐ {p.rating}</span>
            </div>
            <div style={{ fontSize: 10, color: "#888780" }}>Opérateur: {p.operator}</div>
          </div>

          {selected === p.id && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #2C2C2A" }}>
              <ProgressBar value={p.kgToday} max={p.capacity} color={p.kgToday / p.capacity > 0.8 ? "#EF9F27" : "#1D9E75"} label={`Capacité: ${p.kgToday}/${p.capacity} kg`} />
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <Btn size="sm" style={{ flex: 1, justifyContent: "center" }}>🗺 Naviguer</Btn>
                <Btn size="sm" variant="ghost" style={{ flex: 1, justifyContent: "center" }}>📞 Appeler</Btn>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── HISTORY tab ─────────────────────────────────────────────────────────── */
function HistoryTab({ txList }) {
  const total = txList.reduce((a, t) => a + t.fcfa, 0);
  const totalKg = txList.reduce((a, t) => a + t.kg, 0);
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Historique</div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ background: "#1A1A18", border: "1px solid #1D9E7530", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 1, marginBottom: 4 }}>TOTAL GAGNÉ</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#1D9E75" }}>{total.toLocaleString("fr-FR")}</div>
          <div style={{ fontSize: 10, color: "#888780" }}>FCFA</div>
        </div>
        <div style={{ background: "#1A1A18", border: "1px solid #EF9F2730", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 1, marginBottom: 4 }}>TOTAL RECYCLÉ</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#EF9F27" }}>{totalKg.toFixed(1)}</div>
          <div style={{ fontSize: 10, color: "#888780" }}>kg</div>
        </div>
      </div>

      {/* Transactions */}
      {txList.map((tx, i) => {
        const wt = getWasteType(tx.type);
        const pt = getPoint(tx.point);
        return (
          <div key={i} style={{ background: "#1A1A18", border: `1px solid ${i === 0 && tx.date === "just_now" ? "#1D9E7566" : "#2C2C2A"}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: wt.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{wt.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{wt.label}</div>
              <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {tx.kg} kg · {pt?.name || tx.point}
              </div>
              <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace" }}>{formatDate(tx.date)}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1D9E75", fontFamily: "'Space Mono',monospace" }}>+{tx.fcfa}</div>
              <div style={{ fontSize: 9, color: "#888780" }}>FCFA</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── PROFILE tab ─────────────────────────────────────────────────────────── */
function ProfileTab({ user, balance }) {
  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(160deg,#085041,#0D6040)", padding: "28px 20px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#1D9E7540", border: "3px solid #5DCAA5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 12px", fontWeight: 900 }}>AD</div>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: "#5DCAA5", fontFamily: "'Space Mono',monospace", marginBottom: 12 }}>{user.phone}</div>
        <Badge color="#EF9F27" bg="#EF9F2720">🥉 {user.level}</Badge>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Solde", value: (balance / 1000).toFixed(1) + "k", unit: "FCFA", color: "#1D9E75" },
            { label: "Recyclé", value: user.totalKg, unit: "kg", color: "#EF9F27" },
            { label: "Points", value: user.points, unit: "pts", color: "#7F77DD" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#1A1A18", border: "1px solid #2C2C2A", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#888780" }}>{s.unit}</div>
              <div style={{ fontSize: 9, color: "#888780", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Menu items */}
        {[
          { icon: "💳", label: "Méthodes de paiement", sub: "Wave principal" },
          { icon: "🔔", label: "Notifications",         sub: "Activées" },
          { icon: "🌍", label: "Langue",                sub: "Français" },
          { icon: "🔒", label: "Sécurité",              sub: "PIN activé" },
          { icon: "📞", label: "Support",               sub: "Chat & appel" },
        ].map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 14px", background: "#1A1A18", border: "1px solid #2C2C2A", borderRadius: 10, marginBottom: 8, cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>{m.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontSize: 10, color: "#888780" }}>{m.sub}</div>
            </div>
            <span style={{ color: "#2C2C2A", fontSize: 16 }}>›</span>
          </div>
        ))}

        <Btn variant="danger" style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>Déconnexion</Btn>
      </div>
    </div>
  );
}

/* ── ROOT CITIZEN APP ────────────────────────────────────────────────────── */
export default function CitizenPage() {
  const [tab, setTab] = useState("home");
  const [balance, setBalance] = useState(CITIZEN_USER.balance);
  const [txList, setTxList] = useState(TRANSACTIONS);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const handleDeposit = ({ waste, kg, point }) => {
    const fcfa = Math.round(waste.pricePerKg * kg);
    const tx = { id: `WB-${2842 + txList.length}`, date: new Date().toISOString(), type: waste.id, kg, fcfa, point, userId: "u1", status: "paid" };
    setBalance(b => b + fcfa);
    setTxList(old => [tx, ...old]);
    showToast(`+${fcfa.toLocaleString("fr-FR")} FCFA reçus sur Wave!`);
    setTimeout(() => setTab("history"), 2200);
  };

  const tabs = [
    { id: "home",    icon: "🏠", label: "Accueil" },
    { id: "scan",    icon: "📷", label: "Scanner" },
    { id: "points",  icon: "📍", label: "Dépôts"  },
    { id: "history", icon: "📋", label: "Historique" },
    { id: "profile", icon: "👤", label: "Profil"  },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#1D9E75", letterSpacing: 4, marginBottom: 10 }}>APPLICATION MOBILE</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>📱 App Citoyen WasteBank</h2>
        <p style={{ color: "#888780", fontSize: 13 }}>Simulateur interactif complet — Scannez, déposez, encaissez en temps réel</p>
      </div>

      <PhoneShell>
        {/* Status bar */}
        <div style={{ background: "#0A0A08", padding: "4px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace" }}>09:41</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "#888780" }}>📶 2G</span>
            <span style={{ fontSize: 9, color: "#888780" }}>🔋80%</span>
          </div>
        </div>

        {/* App bar */}
        <div style={{ background: "#0F0F0C", borderBottom: "1px solid #2C2C2A", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#1D9E75" }}>
            <span style={{ color: "#1D9E75" }}>Waste</span><span style={{ color: "#EF9F27" }}>Bank</span>
          </div>
          <Badge color="#5DCAA5" bg="#08504120"><LiveDot size={5} /> EN LIGNE</Badge>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", maxHeight: 620 }}>
          {tab === "home"    && <HomeTab user={CITIZEN_USER} balance={balance} txList={txList} onNavigate={setTab} />}
          {tab === "scan"    && <ScanTab onDeposit={handleDeposit} />}
          {tab === "points"  && <PointsTab />}
          {tab === "history" && <HistoryTab txList={txList} />}
          {tab === "profile" && <ProfileTab user={CITIZEN_USER} balance={balance} />}
        </div>

        {/* Bottom nav */}
        <div style={{ borderTop: "1px solid #2C2C2A", background: "#0F0F0C", display: "flex" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, border: "none", background: "transparent", padding: "8px 0 6px", cursor: "pointer", borderTop: `2px solid ${tab === t.id ? "#1D9E75" : "transparent"}`, transition: "border-color .2s" }}>
              <div style={{ fontSize: 16 }}>{t.icon}</div>
              <div style={{ fontSize: 9, color: tab === t.id ? "#1D9E75" : "#888780", fontFamily: "'Space Mono',monospace", marginTop: 2 }}>{t.label}</div>
            </button>
          ))}
        </div>
      </PhoneShell>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
function Sidebar({ tab, setTab, alertCount }) {
  const items = [
    { id: "overview",    icon: "📊", label: "Vue d'ensemble" },
    { id: "points",      icon: "📍", label: "Points de collecte" },
    { id: "analytics",   icon: "📈", label: "Analytiques" },
    { id: "alerts",      icon: "🔔", label: "Alertes", badge: alertCount },
    { id: "operators",   icon: "👷", label: "Opérateurs" },
    { id: "settings",    icon: "⚙️",  label: "Paramètres" },
  ];
  return (
    <div style={{ width: 220, background: "#0F0F0C", borderRight: "1px solid #2C2C2A", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "20px 16px", borderBottom: "1px solid #2C2C2A" }}>
        <div style={{ fontSize: 14, fontWeight: 900 }}>
          <span style={{ color: "#1D9E75" }}>Waste</span><span style={{ color: "#EF9F27" }}>Bank</span>
        </div>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", marginTop: 2 }}>PORTAIL MAIRIE</div>
      </div>
      <nav style={{ padding: "12px 8px", flex: 1 }}>
        {items.map(it => (
          <button key={it.id} onClick={() => setTab(it.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: tab === it.id ? "#1D9E7520" : "transparent", border: "none", borderRadius: 8, color: tab === it.id ? "#5DCAA5" : "#888780", fontSize: 12, fontWeight: tab === it.id ? 700 : 400, cursor: "pointer", fontFamily: "'Syne',sans-serif", transition: "all .15s", borderLeft: `2px solid ${tab === it.id ? "#1D9E75" : "transparent"}`, marginBottom: 2, position: "relative" }}>
            <span style={{ fontSize: 15 }}>{it.icon}</span>
            <span>{it.label}</span>
            {it.badge > 0 && <span style={{ marginLeft: "auto", background: "#D85A30", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{it.badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding: "14px 16px", borderTop: "1px solid #2C2C2A" }}>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", marginBottom: 4 }}>MAIRIE DE DAKAR</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <LiveDot size={6} />
          <span style={{ fontSize: 10, color: "#5DCAA5", fontFamily: "'Space Mono',monospace" }}>SYSTÈME OPÉRATIONNEL</span>
        </div>
      </div>
    </div>
  );
}

/* ── Overview tab ────────────────────────────────────────────────────────── */
function Overview({ alerts, dismissAlert }) {
  const [liveKg, setLiveKg] = useState(MAIRIE_STATS.kgToday);
  const [liveUsers, setLiveUsers] = useState(MAIRIE_STATS.usersActive);

  // simulate live data
  useEffect(() => {
    const t = setInterval(() => {
      setLiveKg(k => k + Math.floor(Math.random() * 3));
      setLiveUsers(u => u + (Math.random() > 0.7 ? 1 : 0));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <SectionHeader tag="TABLEAU DE BORD" title="Vue d'ensemble" sub="Données collectées en temps réel sur les 4 points actifs" />
        <div style={{ display: "flex", gap: 10 }}>
          <Badge color="#5DCAA5" bg="#08504120"><LiveDot size={5} /> LIVE</Badge>
          <Btn size="sm" variant="outline">📥 Exporter CSV</Btn>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatBox label="Kg collectés aujourd'hui" value={liveKg.toLocaleString("fr-FR")} unit="kg" color="#1D9E75" icon="♻️" delta={12} />
        <StatBox label="Utilisateurs actifs" value={liveUsers.toLocaleString("fr-FR")} unit="citoyens" color="#EF9F27" icon="👥" delta={8} />
        <StatBox label="FCFA versés aujourd'hui" value={(MAIRIE_STATS.fcfaToday/1000).toFixed(0)+"k"} unit="FCFA" color="#7F77DD" icon="💸" delta={15} />
        <StatBox label="CO₂ évité ce mois" value={MAIRIE_STATS.co2Avoided} unit="tCO₂eq" color="#5DCAA5" icon="🌿" delta={22} />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 10 }}>ALERTES ACTIVES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.slice(0, 2).map(a => (
              <AlertBanner key={a.id} level={a.level} message={a.msg} time={a.time} onDismiss={() => dismissAlert(a.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>COLLECTE MENSUELLE (kg)</div>
          <BarChart data={MAIRIE_STATS.monthlyData} valueKey="kg" labelKey="month" height={120} />
        </Card>
        <Card>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>RÉPARTITION PAR TYPE</div>
          {MAIRIE_STATS.byType.map((b, i) => {
            const wt = getWasteType(b.id);
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12 }}>{wt.emoji} {wt.label}</span>
                  <span style={{ fontSize: 11, color: wt.color, fontFamily: "'Space Mono',monospace" }}>{b.pct}% · {(b.kg/1000).toFixed(1)}t</span>
                </div>
                <ProgressBar value={b.pct} max={100} color={wt.color} />
              </div>
            );
          })}
        </Card>
      </div>

      {/* Points status table */}
      <Card>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>ÉTAT DES POINTS EN TEMPS RÉEL</div>
        <DataTable
          columns={[
            { label: "Point", key: "name" },
            { label: "Statut", render: r => <Badge color={r.online ? "#5DCAA5" : "#D85A30"} bg={r.online ? "#08504120" : "#D85A3020"}>{r.online ? <><LiveDot size={5}/> Actif</> : "⚠ Hors ligne"}</Badge> },
            { label: "Collecte auj.", render: r => <span style={{ color: "#1D9E75", fontFamily: "'Space Mono',monospace" }}>{r.kgToday} kg</span> },
            { label: "Capacité", render: r => <div style={{ width: 80 }}><ProgressBar value={r.kgToday} max={r.capacity} color={r.kgToday/r.capacity > .8 ? "#EF9F27" : "#1D9E75"} showPct={false} /></div> },
            { label: "Note", render: r => <span style={{ color: "#EF9F27" }}>⭐ {r.rating}</span> },
            { label: "", render: r => <Btn size="sm" variant="ghost">Détails</Btn> },
          ]}
          rows={COLLECTION_POINTS}
        />
      </Card>
    </div>
  );
}

/* ── Analytics tab ───────────────────────────────────────────────────────── */
function Analytics() {
  const hourlyData = [
    {h:"06h",kg:12},{h:"07h",kg:28},{h:"08h",kg:45},{h:"09h",kg:67},{h:"10h",kg:54},
    {h:"11h",kg:38},{h:"12h",kg:22},{h:"13h",kg:18},{h:"14h",kg:34},{h:"15h",kg:51},
    {h:"16h",kg:63},{h:"17h",kg:71},{h:"18h",kg:48},{h:"19h",kg:19},
  ];
  const maxH = Math.max(...hourlyData.map(d => d.kg));

  return (
    <div>
      <SectionHeader tag="ANALYTIQUES" title="Données avancées" sub="Tendances, prévisions et insights opérationnels" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <StatBox label="Moy. journalière ce mois" value="280" unit="kg/jour" color="#1D9E75" icon="📈" />
        <StatBox label="Croissance utilisateurs" value="+34%" unit="vs mois dernier" color="#EF9F27" icon="👥" />
        <StatBox label="Taux de retour 30j" value="68%" unit="rétention" color="#7F77DD" icon="🔄" />
      </div>

      {/* Hourly chart */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 20 }}>ACTIVITÉ PAR HEURE — AUJOURD'HUI</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100 }}>
          {hourlyData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", borderRadius: "3px 3px 0 0", height: `${(d.kg/maxH)*80}px`, background: d.h === "17h" ? "#1D9E75" : "#2C2C2A", transition: "height .4s ease" }} />
              <div style={{ fontSize: 8, color: "#888780", fontFamily: "'Space Mono',monospace" }}>{d.h}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: "#888780" }}>Pic de collecte: <span style={{ color: "#1D9E75", fontWeight: 700 }}>17h00 — 71 kg</span></div>
      </Card>

      {/* Per-point comparison */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>COMPARAISON PAR POINT</div>
        {COLLECTION_POINTS.map((p, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</span>
              <span style={{ fontSize: 11, color: "#1D9E75", fontFamily: "'Space Mono',monospace" }}>{p.kgToday} kg</span>
            </div>
            <ProgressBar value={p.kgToday} max={Math.max(...COLLECTION_POINTS.map(c=>c.kgToday))} color={["#1D9E75","#EF9F27","#7F77DD","#5DCAA5"][i]} showPct={false} />
          </div>
        ))}
      </Card>

      {/* Forecast */}
      <Card>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>PRÉVISION IA — PROCHAINS 7 JOURS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
          {["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"].map((d, i) => {
            const predicted = [380, 520, 490, 560, 510, 470, 340][i];
            return (
              <div key={i} style={{ textAlign: "center", background: "#1A1A18", borderRadius: 8, padding: "12px 6px", border: i === 1 ? "1px solid #1D9E7544" : "1px solid #2C2C2A" }}>
                <div style={{ fontSize: 9, color: "#888780", fontFamily: "'Space Mono',monospace", marginBottom: 6 }}>{d}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: i === 1 ? "#1D9E75" : "#C8C6BF" }}>{predicted}</div>
                <div style={{ fontSize: 8, color: "#888780" }}>kg</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 10, color: "#888780" }}>Modèle: Random Forest · MAE: ±28 kg · Dernière mise à jour: il y a 2h</div>
      </Card>
    </div>
  );
}

/* ── Alerts tab ──────────────────────────────────────────────────────────── */
function AlertsTab({ alerts, dismissAlert }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <SectionHeader tag="ALERTES SYSTÈME" title="Centre de notifications" sub="Alertes IoT, capacités et événements opérationnels" />
        <Btn size="sm" variant="ghost" onClick={() => alerts.forEach(a => dismissAlert(a.id))}>Tout effacer</Btn>
      </div>

      {alerts.length === 0
        ? <Card style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Aucune alerte active</div>
            <div style={{ fontSize: 13, color: "#888780" }}>Tous les systèmes fonctionnent normalement</div>
          </Card>
        : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alerts.map(a => (
              <div key={a.id} style={{ background: "#1A1A18", border: "1px solid #2C2C2A", borderRadius: 12, padding: "16px 20px" }}>
                <AlertBanner level={a.level} message={a.msg} time={a.time} onDismiss={() => dismissAlert(a.id)} />
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <Btn size="sm" variant="primary">Prendre en charge</Btn>
                  <Btn size="sm" variant="ghost">Ignorer</Btn>
                </div>
              </div>
            ))}
          </div>
      }

      <Card style={{ marginTop: 24 }}>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>HISTORIQUE DES 24H</div>
        {[
          { time: "08:32", level: "info",    msg: "Synchronisation IoT réussie — 4 balances" },
          { time: "07:15", level: "warning", msg: "Collecte Yoff — Connexion instable" },
          { time: "06:00", level: "info",    msg: "Ouverture automatique des points de collecte" },
          { time: "05:45", level: "info",    msg: "Rapport nocturne généré — 3 840 kg ce mois" },
        ].map((h, i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: i < 3 ? "1px solid #2C2C2A" : "none", alignItems: "flex-start" }}>
            <span style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", minWidth: 40 }}>{h.time}</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: h.level === "warning" ? "#EF9F27" : "#1D9E75", flexShrink: 0, marginTop: 4 }} />
            <span style={{ fontSize: 12, color: "#C8C6BF" }}>{h.msg}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ── Operators tab ───────────────────────────────────────────────────────── */
function OperatorsTab() {
  const [showModal, setShowModal] = useState(false);
  const operators = COLLECTION_POINTS.map(p => ({
    name: p.operator, point: p.name,
    kgToday: p.kgToday, status: p.online,
    phone: "+221 77 " + Math.floor(Math.random()*9000000+1000000),
  }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <SectionHeader tag="OPÉRATEURS" title="Gestion du personnel" sub="Agents de collecte et responsables de points" />
        <Btn onClick={() => setShowModal(true)}>+ Ajouter opérateur</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {operators.map((op, i) => (
          <Card key={i}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: ["#1D9E7530","#EF9F2730","#7F77DD30","#D85A3030"][i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: ["#5DCAA5","#EF9F27","#AFA9EC","#D85A30"][i], flexShrink: 0 }}>
                {op.name.split(" ").map(n=>n[0]).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{op.name}</div>
                  <Badge color={op.status ? "#5DCAA5" : "#D85A30"}>{op.status ? "Actif" : "Absent"}</Badge>
                </div>
                <div style={{ fontSize: 11, color: "#888780", marginBottom: 4 }}>📍 {op.point}</div>
                <div style={{ fontSize: 11, color: "#888780", marginBottom: 10, fontFamily: "'Space Mono',monospace" }}>{op.phone}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#1D9E75", fontFamily: "'Space Mono',monospace" }}>{op.kgToday} kg auj.</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn size="sm" variant="ghost">📞 Appeler</Btn>
                    <Btn size="sm" variant="ghost">✏ Modifier</Btn>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Ajouter un opérateur">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 6 }}>NOM COMPLET</label>
            <input placeholder="Prénom Nom" style={{ width: "100%", background: "#2C2C2A", border: "1px solid #2C2C2A", borderRadius: 7, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "'Syne',sans-serif", outline: "none" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 6 }}>TÉLÉPHONE</label>
            <input placeholder="+221 77 000 00 00" style={{ width: "100%", background: "#2C2C2A", border: "1px solid #2C2C2A", borderRadius: 7, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "'Syne',sans-serif", outline: "none" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 6 }}>POINT ASSIGNÉ</label>
            <select style={{ width: "100%", background: "#2C2C2A", border: "none", borderRadius: 7, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "'Syne',sans-serif", outline: "none" }}>
              {COLLECTION_POINTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowModal(false)}>Annuler</Btn>
            <Btn style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowModal(false)}>Enregistrer</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Settings tab ────────────────────────────────────────────────────────── */
function SettingsTab() {
  const [priceEdits, setPriceEdits] = useState(Object.fromEntries(WASTE_TYPES.map(w => [w.id, w.pricePerKg])));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionHeader tag="PARAMÈTRES" title="Configuration" sub="Gestion des prix, alertes et intégrations" />

      {/* Price management */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>PRIX D'ACHAT (FCFA/KG)</div>
        {WASTE_TYPES.map(w => (
          <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <span style={{ fontSize: 18, minWidth: 28 }}>{w.emoji}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{w.label}</span>
            <input type="number" value={priceEdits[w.id]} onChange={e => setPriceEdits(p => ({ ...p, [w.id]: Number(e.target.value) }))}
              style={{ width: 90, background: "#2C2C2A", border: "1px solid #2C2C2A", borderRadius: 7, padding: "7px 12px", color: "#fff", fontSize: 13, fontFamily: "'Space Mono',monospace", outline: "none", textAlign: "right" }} />
            <span style={{ fontSize: 12, color: "#888780", minWidth: 30 }}>F/kg</span>
          </div>
        ))}
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <Btn onClick={handleSave} style={{ justifyContent: "center", padding: "10px 24px" }}>
            {saved ? "✓ Enregistré!" : "Sauvegarder les prix"}
          </Btn>
        </div>
      </Card>

      {/* Alert thresholds */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>SEUILS D'ALERTE CAPACITÉ</div>
        {[
          { label: "Alerte Warning", value: 80, color: "#EF9F27" },
          { label: "Alerte Critique", value: 95, color: "#D85A30" },
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13 }}>{t.label}</span>
            <input type="range" min={50} max={100} defaultValue={t.value} style={{ width: 120 }} />
            <span style={{ fontSize: 12, color: t.color, fontFamily: "'Space Mono',monospace", minWidth: 35 }}>{t.value}%</span>
          </div>
        ))}
      </Card>

      {/* Integrations */}
      <Card>
        <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>INTÉGRATIONS</div>
        {[
          { name: "Wave API",          status: true,  color: "#1D9E75" },
          { name: "Orange Money API",  status: true,  color: "#1D9E75" },
          { name: "Balances IoT MQTT", status: false, color: "#D85A30", note: "Yoff hors ligne" },
          { name: "Kafka Stream",      status: true,  color: "#1D9E75" },
          { name: "Email Notifications", status: true, color: "#1D9E75" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < 4 ? "1px solid #2C2C2A" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
              <span style={{ fontSize: 13 }}>{s.name}</span>
              {s.note && <span style={{ fontSize: 10, color: "#EF9F27", fontFamily: "'Space Mono',monospace" }}>({s.note})</span>}
            </div>
            <Badge color={s.status ? "#5DCAA5" : "#D85A30"} bg={s.status ? "#08504120" : "#D85A3020"}>
              {s.status ? "Connecté" : "Erreur"}
            </Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ── ROOT MAIRIE ─────────────────────────────────────────────────────────── */
export default function MairiePage() {
  const [tab, setTab] = useState("overview");
  const [alerts, setAlerts] = useState(ALERTS_DATA);
  const dismissAlert = id => setAlerts(a => a.filter(x => x.id !== id));

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px" }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#1D9E75", letterSpacing: 4, marginBottom: 8 }}>PORTAIL ADMINISTRATION</div>
      <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 28px" }}>🏛 Dashboard Mairie de Dakar</h2>

      <div style={{ display: "flex", gap: 0, background: "#0F0F0C", border: "1px solid #2C2C2A", borderRadius: 16, overflow: "hidden", minHeight: 680 }}>
        <Sidebar tab={tab} setTab={setTab} alertCount={alerts.length} />
        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {tab === "overview"  && <Overview alerts={alerts} dismissAlert={dismissAlert} />}
          {tab === "analytics" && <Analytics />}
          {tab === "alerts"    && <AlertsTab alerts={alerts} dismissAlert={dismissAlert} />}
          {tab === "operators" && <OperatorsTab />}
          {tab === "points"    && (
            <div>
              <SectionHeader tag="POINTS DE COLLECTE" title="Gestion des sites" sub="Suivi en temps réel de chaque point de collecte" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                {COLLECTION_POINTS.map((p, i) => (
                  <Card key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{p.name}</div>
                      <Badge color={p.online ? "#5DCAA5" : "#D85A30"}>{p.online ? <><LiveDot size={5}/> Actif</> : "Hors ligne"}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: "#888780", marginBottom: 4 }}>📍 {p.address}</div>
                    <div style={{ fontSize: 12, color: "#888780", marginBottom: 12 }}>🕐 {p.hours} · ⭐ {p.rating}</div>
                    <ProgressBar value={p.kgToday} max={p.capacity} color={p.kgToday/p.capacity > .8 ? "#EF9F27" : "#1D9E75"} label={`Capacité: ${p.kgToday}/${p.capacity} kg`} />
                    <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                      <Btn size="sm" style={{ flex: 1, justifyContent: "center" }}>Voir détails</Btn>
                      <Btn size="sm" variant="ghost" style={{ flex: 1, justifyContent: "center" }}>Rapport</Btn>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

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

const ALL_USERS = [
  { id:"u1", name:"Amadou Diallo",   phone:"+221 77 123 45 67", balance:4750,  totalKg:47.2,  txCount:18, joined:"15 jan 2026", status:"active",   level:"Bronze" },
  { id:"u2", name:"Fatou Ndiaye",    phone:"+221 78 234 56 78", balance:12300, totalKg:128.4, txCount:52, joined:"3 jan 2026",  status:"active",   level:"Or"     },
  { id:"u3", name:"Ibrahima Sow",    phone:"+221 76 345 67 89", balance:890,   totalKg:9.1,   txCount:4,  joined:"10 mai 2026", status:"active",   level:"Débutant"},
  { id:"u4", name:"Mariama Balde",   phone:"+221 70 456 78 90", balance:6600,  totalKg:65.8,  txCount:27, joined:"20 jan 2026", status:"active",   level:"Argent" },
  { id:"u5", name:"Ousmane Diallo",  phone:"+221 77 567 89 01", balance:0,     totalKg:3.2,   txCount:2,  joined:"1 mai 2026",  status:"inactive", level:"Débutant"},
  { id:"u6", name:"Aissatou Camara", phone:"+221 78 678 90 12", balance:22100, totalKg:241.0, txCount:88, joined:"5 jan 2026",  status:"active",   level:"Platine"},
];

const ALL_TX = [
  ...TRANSACTIONS,
  { id:"WB-2820", date:"2026-05-10T14:12:00", type:"alu",   kg:2.1, fcfa:798,  point:"cp4", userId:"u6", status:"paid"   },
  { id:"WB-2815", date:"2026-05-08T09:30:00", type:"pet",   kg:5.0, fcfa:600,  point:"cp1", userId:"u2", status:"paid"   },
  { id:"WB-2810", date:"2026-05-05T16:00:00", type:"paper", kg:8.3, fcfa:373,  point:"cp2", userId:"u4", status:"paid"   },
  { id:"WB-2800", date:"2026-05-01T11:45:00", type:"glass", kg:6.0, fcfa:180,  point:"cp3", userId:"u3", status:"pending"},
];

/* ── Dashboard overview ──────────────────────────────────────────────────── */
function AdminOverview() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <SectionHeader tag="SUPER ADMIN" title="Vue système globale" sub="Métriques consolidées de toute la plateforme WasteBank" />
        <div style={{ display: "flex", gap: 10 }}>
          <Badge color="#5DCAA5" bg="#08504120"><LiveDot size={5} /> SYSTÈME OK</Badge>
          <Btn size="sm" variant="outline">📥 Export global</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatBox label="Utilisateurs totaux"   value="3 870"  unit="inscrits"      color="#1D9E75" icon="👥" delta={34} />
        <StatBox label="Transactions totales"  value="14 238" unit="dépôts"        color="#EF9F27" icon="📋" delta={18} />
        <StatBox label="Volume mensuel"        value="8.4t"   unit="kg collectés"  color="#7F77DD" icon="♻️" delta={22} />
        <StatBox label="Revenus plateforme"    value="2.1M"   unit="FCFA ce mois"  color="#5DCAA5" icon="💰" delta={41} />
      </div>

      {/* System health */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>SANTÉ DU SYSTÈME</div>
          {[
            { name: "API Backend",       status: true,  latency: "42ms",  uptime: "99.8%" },
            { name: "Base de données",   status: true,  latency: "8ms",   uptime: "99.9%" },
            { name: "Kafka Stream",      status: true,  latency: "12ms",  uptime: "99.7%" },
            { name: "Wave Payment API",  status: true,  latency: "180ms", uptime: "99.5%" },
            { name: "Orange Money API",  status: true,  latency: "210ms", uptime: "98.9%" },
            { name: "IoT MQTT Broker",   status: false, latency: "—",     uptime: "94.1%", note: "Yoff offline" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 5 ? "1px solid #2C2C2A" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.status ? "#1D9E75" : "#D85A30", display: "inline-block" }} />
                <span style={{ fontSize: 12 }}>{s.name}</span>
                {s.note && <span style={{ fontSize: 9, color: "#EF9F27", fontFamily: "'Space Mono',monospace" }}>({s.note})</span>}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace" }}>{s.latency}</span>
                <span style={{ fontSize: 10, color: s.status ? "#5DCAA5" : "#D85A30", fontFamily: "'Space Mono',monospace" }}>{s.uptime}</span>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>TOP COLLECTEURS CE MOIS</div>
          {ALL_USERS.sort((a,b) => b.totalKg - a.totalKg).slice(0, 5).map((u, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < 4 ? "1px solid #2C2C2A" : "none" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: ["#EF9F27","#88878050","#D85A3030","#1D9E7520","#7F77DD20"][i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: ["#EF9F27","#888780","#D85A30","#1D9E75","#7F77DD"][i], flexShrink: 0 }}>{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{u.name}</div>
                <div style={{ fontSize: 10, color: "#888780" }}>{u.level}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1D9E75", fontFamily: "'Space Mono',monospace" }}>{u.totalKg} kg</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2 }}>DERNIÈRES TRANSACTIONS</div>
          <Badge color="#5DCAA5"><LiveDot size={5}/> TEMPS RÉEL</Badge>
        </div>
        <DataTable
          columns={[
            { label: "ID", render: r => <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#888780" }}>{r.id}</span> },
            { label: "Type", render: r => { const wt = getWasteType(r.type); return <span>{wt.emoji} {wt.label}</span>; } },
            { label: "Kg", align: "right", render: r => <span style={{ fontFamily: "'Space Mono',monospace" }}>{r.kg}</span> },
            { label: "FCFA", align: "right", render: r => <span style={{ color: "#1D9E75", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>+{r.fcfa}</span> },
            { label: "Point", render: r => { const pt = getPoint(r.point); return <span style={{ fontSize: 11 }}>{pt?.name}</span>; } },
            { label: "Date", render: r => <span style={{ fontSize: 11, color: "#888780" }}>{formatDate(r.date)}</span> },
            { label: "Statut", render: r => <Badge color={r.status === "paid" ? "#5DCAA5" : "#EF9F27"}>{r.status === "paid" ? "Payé" : "En attente"}</Badge> },
          ]}
          rows={ALL_TX.slice(0, 8)}
        />
      </Card>
    </div>
  );
}

/* ── Users management ────────────────────────────────────────────────────── */
function UsersManagement() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = ALL_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const levelColor = { "Platine": "#5DCAA5", "Or": "#EF9F27", "Argent": "#888780", "Bronze": "#D85A30", "Débutant": "#2C2C2A" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <SectionHeader tag="UTILISATEURS" title="Gestion des collecteurs" />
        <div style={{ display: "flex", gap: 10 }}>
          <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "#1A1A18", border: "1px solid #2C2C2A", borderRadius: 7, padding: "8px 14px", color: "#fff", fontSize: 12, fontFamily: "'Syne',sans-serif", outline: "none", width: 200 }} />
          <Btn size="sm">+ Nouveau collecteur</Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Actifs",   value: ALL_USERS.filter(u=>u.status==="active").length,   color: "#1D9E75" },
          { label: "Inactifs", value: ALL_USERS.filter(u=>u.status==="inactive").length, color: "#888780" },
          { label: "Platine+", value: ALL_USERS.filter(u=>["Platine","Or"].includes(u.level)).length, color: "#EF9F27" },
          { label: "Ce mois",  value: ALL_USERS.filter(u=>u.joined.includes("2026")).length, color: "#7F77DD" },
        ].map((s, i) => (
          <Card key={i} style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 6 }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <Card>
        <DataTable
          columns={[
            { label: "Collecteur", render: u => (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1D9E7520", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#5DCAA5", flexShrink: 0 }}>
                  {u.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                  <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace" }}>{u.phone}</div>
                </div>
              </div>
            )},
            { label: "Niveau", render: u => <Badge color={levelColor[u.level]} bg={levelColor[u.level]+"20"}>{u.level}</Badge> },
            { label: "Solde", align: "right", render: u => <span style={{ color: "#1D9E75", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{u.balance.toLocaleString("fr-FR")} F</span> },
            { label: "Total kg", align: "right", render: u => <span style={{ fontFamily: "'Space Mono',monospace" }}>{u.totalKg}</span> },
            { label: "Transactions", align: "right", render: u => <span style={{ fontFamily: "'Space Mono',monospace" }}>{u.txCount}</span> },
            { label: "Statut", render: u => <Badge color={u.status === "active" ? "#5DCAA5" : "#888780"}>{u.status === "active" ? "Actif" : "Inactif"}</Badge> },
            { label: "", render: u => (
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" variant="ghost" onClick={() => { setSelectedUser(u); setShowModal(true); }}>Voir</Btn>
                <Btn size="sm" variant="ghost">✏</Btn>
              </div>
            )},
          ]}
          rows={filtered}
        />
      </Card>

      <Modal open={showModal && !!selectedUser} onClose={() => { setShowModal(false); setSelectedUser(null); }} title="Profil collecteur" width={520}>
        {selectedUser && (
          <div>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#1D9E7520", border: "2px solid #5DCAA5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#5DCAA5" }}>
                {selectedUser.name.split(" ").map(n=>n[0]).join("")}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{selectedUser.name}</div>
                <div style={{ fontSize: 12, color: "#888780", fontFamily: "'Space Mono',monospace" }}>{selectedUser.phone}</div>
                <Badge color={levelColor[selectedUser.level]} bg={levelColor[selectedUser.level]+"20"} style={{ marginTop: 6 }}>{selectedUser.level}</Badge>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Solde", value: selectedUser.balance.toLocaleString("fr-FR")+" F", color: "#1D9E75" },
                { label: "Kg recyclés", value: selectedUser.totalKg+" kg", color: "#EF9F27" },
                { label: "Transactions", value: selectedUser.txCount, color: "#7F77DD" },
              ].map((s,i) => (
                <div key={i} style={{ background: "#0F0F0C", borderRadius: 8, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#888780" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "#0F0F0C", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, color: "#888780", marginBottom: 4 }}>Statut</div>
                <Badge color={selectedUser.status === "active" ? "#5DCAA5" : "#888780"}>{selectedUser.status === "active" ? "✓ Actif" : "Inactif"}</Badge>
              </div>
              <div style={{ background: "#0F0F0C", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, color: "#888780", marginBottom: 4 }}>Membre depuis</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{selectedUser.joined}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Btn size="sm" variant="ghost" style={{ flex: 1, justifyContent: "center" }}>Suspendre</Btn>
              <Btn size="sm" style={{ flex: 1, justifyContent: "center" }}>Envoyer message</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Transactions management ─────────────────────────────────────────────── */
function TransactionsManagement() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? ALL_TX : ALL_TX.filter(t => t.status === filter);
  const totalFcfa = ALL_TX.reduce((a,t) => a + t.fcfa, 0);
  const pendingFcfa = ALL_TX.filter(t=>t.status==="pending").reduce((a,t)=>a+t.fcfa,0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <SectionHeader tag="TRANSACTIONS" title="Suivi des paiements" />
        <Btn size="sm" variant="outline">📥 Exporter Excel</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <StatBox label="Total transactions"    value={ALL_TX.length}                  unit="dépôts"       color="#1D9E75" icon="📋" />
        <StatBox label="FCFA total versé"      value={(totalFcfa/1000).toFixed(1)+"k"} unit="FCFA"        color="#EF9F27" icon="💸" />
        <StatBox label="En attente"            value={pendingFcfa}                    unit="FCFA pending" color="#D85A30" icon="⏳" />
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all","paid","pending"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "#1D9E75" : "#1A1A18", border: "none", borderRadius: 6, padding: "7px 16px", color: filter === f ? "#000" : "#888780", fontSize: 12, fontWeight: filter === f ? 700 : 400, cursor: "pointer", fontFamily: "'Syne',sans-serif" }}>
            {f === "all" ? "Toutes" : f === "paid" ? "Payées" : "En attente"}
          </button>
        ))}
      </div>

      <Card>
        <DataTable
          columns={[
            { label: "ID", render: r => <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#888780" }}>{r.id}</span> },
            { label: "Type", render: r => { const w = getWasteType(r.type); return <span>{w.emoji} {w.label}</span>; } },
            { label: "Kg", align: "right", render: r => <span style={{ fontFamily: "'Space Mono',monospace" }}>{r.kg}</span> },
            { label: "Montant", align: "right", render: r => <span style={{ color: "#1D9E75", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>+{r.fcfa} F</span> },
            { label: "Point", render: r => { const p = getPoint(r.point); return <span style={{ fontSize: 11 }}>{p?.name || r.point}</span>; } },
            { label: "Date", render: r => <span style={{ fontSize: 11, color: "#888780" }}>{formatDate(r.date)}</span> },
            { label: "Statut", render: r => (
              <Badge color={r.status === "paid" ? "#5DCAA5" : "#EF9F27"} bg={r.status === "paid" ? "#08504120" : "#EF9F2720"}>
                {r.status === "paid" ? "✓ Payé" : "⏳ Attente"}
              </Badge>
            )},
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  );
}

/* ── Settings ────────────────────────────────────────────────────────────── */
function AdminSettings() {
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <SectionHeader tag="CONFIGURATION" title="Paramètres globaux" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>SEUIL ALERTE FENÊTRE</div>
          <div style={{ fontSize: 12, color: "#888780", marginBottom: 14, lineHeight: 1.6 }}>Détection tentatives multiples (anti-fraude) — modèle IDS intégré</div>
          {[
            { label: "Fenêtre temporelle (secondes)", defaultVal: 30 },
            { label: "Seuil de tentatives suspectes", defaultVal: 5  },
            { label: "Délai blocage automatique (min)", defaultVal: 15 },
          ].map((f,i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 1, marginBottom: 5 }}>{f.label.toUpperCase()}</label>
              <input type="number" defaultValue={f.defaultVal} style={{ width: "100%", background: "#2C2C2A", border: "none", borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "'Space Mono',monospace", outline: "none" }} />
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>LIMITES TRANSACTIONS</div>
          {[
            { label: "Dépôt minimum (kg)", defaultVal: 0.1 },
            { label: "Dépôt maximum (kg)", defaultVal: 50  },
            { label: "Paiement max/jour (FCFA)", defaultVal: 100000 },
            { label: "Transactions max/semaine", defaultVal: 10 },
          ].map((f,i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 10, color: "#888780", fontFamily: "'Space Mono',monospace", letterSpacing: 1, marginBottom: 5 }}>{f.label.toUpperCase()}</label>
              <input type="number" defaultValue={f.defaultVal} style={{ width: "100%", background: "#2C2C2A", border: "none", borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "'Space Mono',monospace", outline: "none" }} />
            </div>
          ))}
        </Card>
      </div>
      <div style={{ marginTop: 20 }}>
        <Btn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} style={{ padding: "12px 32px" }}>
          {saved ? "✓ Paramètres sauvegardés!" : "Sauvegarder la configuration"}
        </Btn>
      </div>
    </div>
  );
}

/* ── ROOT ADMIN PAGE ─────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [tab, setTab] = useState("overview");

  const navItems = [
    { id: "overview",      icon: "📊", label: "Vue globale"      },
    { id: "users",         icon: "👥", label: "Collecteurs"      },
    { id: "transactions",  icon: "💸", label: "Transactions"     },
    { id: "settings",      icon: "⚙️",  label: "Configuration"   },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px" }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#D85A30", letterSpacing: 4, marginBottom: 8 }}>SUPER ADMINISTRATEUR</div>
      <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 28px" }}>⚙️ Panneau d'administration</h2>

      <div style={{ display: "flex", gap: 0, background: "#0F0F0C", border: "1px solid #2C2C2A", borderRadius: 16, overflow: "hidden", minHeight: 700 }}>
        {/* Sidebar */}
        <div style={{ width: 210, borderRight: "1px solid #2C2C2A", padding: "16px 10px", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 10px 16px", borderBottom: "1px solid #2C2C2A", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#D85A30" }}>Admin Panel</div>
            <div style={{ fontSize: 9, color: "#888780", fontFamily: "'Space Mono',monospace", marginTop: 2 }}>WasteBank v1.0</div>
          </div>
          {navItems.map(it => (
            <button key={it.id} onClick={() => setTab(it.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: tab === it.id ? "#D85A3020" : "transparent", border: "none", borderRadius: 8, color: tab === it.id ? "#D85A30" : "#888780", fontSize: 12, fontWeight: tab === it.id ? 700 : 400, cursor: "pointer", fontFamily: "'Syne',sans-serif", transition: "all .15s", borderLeft: `2px solid ${tab === it.id ? "#D85A30" : "transparent"}`, marginBottom: 2 }}>
              <span style={{ fontSize: 15 }}>{it.icon}</span>
              <span>{it.label}</span>
            </button>
          ))}
          <div style={{ marginTop: "auto", padding: "14px 10px", borderTop: "1px solid #2C2C2A" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LiveDot size={6} color="#D85A30" />
              <span style={{ fontSize: 9, color: "#D85A30", fontFamily: "'Space Mono',monospace", letterSpacing: 1 }}>ADMIN CONNECTÉ</span>
            </div>
          </div>
        </div>
        {/* Main content */}
        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {tab === "overview"     && <AdminOverview />}
          {tab === "users"        && <UsersManagement />}
          {tab === "transactions" && <TransactionsManagement />}
          {tab === "settings"     && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}

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

