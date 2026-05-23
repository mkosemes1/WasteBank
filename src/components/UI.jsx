import { useState, useEffect, useRef } from "react";

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
