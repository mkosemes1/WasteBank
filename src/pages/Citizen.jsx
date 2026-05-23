import { useState, useEffect, useRef } from "react";
import { Badge, LiveDot, Btn, Card, Toast, Modal, ProgressBar } from "../components/UI.jsx";
import { WASTE_TYPES, COLLECTION_POINTS, TRANSACTIONS, CITIZEN_USER, formatFcfa, formatKg, formatDate, getWasteType, getPoint } from "../data/index.js";

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
