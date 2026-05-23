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
