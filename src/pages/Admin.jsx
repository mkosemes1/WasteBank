import { useState } from "react";
import { Badge, LiveDot, Btn, Card, StatBox, DataTable, SectionHeader, Modal, AlertBanner, ProgressBar } from "../components/UI.jsx";
import { COLLECTION_POINTS, WASTE_TYPES, TRANSACTIONS, CITIZEN_USER, formatDate, getWasteType, getPoint } from "../data/index.js";

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
