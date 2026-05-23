# ♻️ WasteBank — Plateforme de valorisation des déchets

> Transforme tes déchets en revenus immédiats via mobile money.

## 🚀 Démarrage rapide

```bash
# 1. Cloner / dézipper le projet
cd wastebank/

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Lancer le serveur
python app.py

# 4. Ouvrir le navigateur
# http://localhost:5000
```

## 🔑 Comptes de démonstration

| Rôle      | Email                       | Mot de passe    |
|-----------|-----------------------------|-----------------|
| Citoyen   | moussa@demo.com             | demo123         |
| Collecteur| fatou@wastebank.africa      | collector123    |
| Admin     | admin@wastebank.africa      | admin123        |

## 📁 Structure du projet

```
wastebank/
├── app.py                  # Point d'entrée Flask
├── requirements.txt
├── wastebank.db            # Base de données SQLite (auto-créée)
├── models/
│   └── db.py               # Schéma BDD, init, helpers
├── routes/
│   ├── auth.py             # Login / Register / Logout
│   ├── dashboard.py        # Espace citoyen & collecteur
│   ├── admin.py            # Panneau d'administration
│   ├── public.py           # Pages publiques
│   └── api.py              # API REST JSON
├── static/
│   └── css/main.css        # Design system complet
└── templates/
    ├── base.html
    ├── auth/               # Login, Register
    ├── dashboard/          # Home, dépôt, wallet, profil, collecteur
    ├── admin/              # Dashboard, users, waste types, RSE...
    └── public/             # Landing, prix, points, guide
```

## 🌐 Pages disponibles

### Public
- `/`                  — Landing page
- `/how-it-works`      — Guide étape par étape
- `/prices`            — Prix du jour + simulateur
- `/points`            — Carte des points de collecte

### Authentification
- `/auth/login`        — Connexion
- `/auth/register`     — Inscription
- `/auth/logout`       — Déconnexion

### Espace citoyen (connexion requise)
- `/dashboard/`        — Tableau de bord + stats
- `/dashboard/deposit/new` — Nouveau dépôt
- `/dashboard/wallet`  — Portefeuille & retraits
- `/dashboard/profile` — Mon profil

### Espace collecteur
- `/dashboard/collector` — Valider / rejeter les dépôts

### Admin
- `/admin/`            — Dashboard global
- `/admin/users`       — Gestion utilisateurs
- `/admin/waste-types` — Types & prix des déchets
- `/admin/collection-points` — Réseau de collecte
- `/admin/deposits`    — Tous les dépôts
- `/admin/rse`         — Rapports RSE / ESG

### API REST
- `GET /api/prices`    — Prix actuels (JSON)
- `GET /api/points`    — Points de collecte (JSON)
- `GET /api/stats`     — Statistiques plateforme (JSON)
- `POST /api/calculate` — Calculer un montant

## ⚙️ Variables d'environnement

```bash
SECRET_KEY=votre-cle-secrete-production
```

## 🏗️ Production (Gunicorn)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 "app:create_app()"
```

## 🧩 Technologies

- **Backend** : Flask 3.x (Python)
- **Base de données** : SQLite (PostgreSQL-ready)
- **Auth** : Sessions Flask + hash SHA-256
- **Frontend** : HTML/CSS vanilla (Syne + Space Mono)
- **Charts** : Chart.js 4.x (CDN)
- **Icons** : Emoji nativement
- **Maps** : Google Maps links

## 📊 Modèle de données

- `users` — Citoyens, collecteurs, admins
- `waste_types` — Types de déchets & prix
- `collection_points` — Réseau de points de dépôt
- `deposits` — Dépôts de déchets (pending → paid)
- `transactions` — Historique financier
- `rse_reports` — Rapports ESG pour entreprises
- `notifications` — Alertes utilisateurs
