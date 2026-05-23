import { useState, useEffect } from "react";
import { Badge, LiveDot, Btn, Card, StatBox, BarChart, AlertBanner, DataTable, SectionHeader, ProgressBar, Modal, Toast } from "../components/UI.jsx";
import { COLLECTION_POINTS, WASTE_TYPES, MAIRIE_STATS, ALERTS_DATA, formatFcfa, formatKg, getWasteType } from "../data/index.js";

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
