"""
WasteBank — Database layer (SQLite + raw SQL for zero-dependency portability)
"""
import sqlite3
import hashlib
import secrets
from flask import g, current_app
from datetime import datetime


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE"],
            detect_types=sqlite3.PARSE_DECLTYPES,
        )
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def init_db():
    db = sqlite3.connect(current_app.config["DATABASE"])
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")

    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            email       TEXT UNIQUE NOT NULL,
            phone       TEXT UNIQUE,
            password    TEXT NOT NULL,
            role        TEXT NOT NULL DEFAULT 'citizen',  -- citizen | collector | admin
            city        TEXT DEFAULT 'Dakar',
            balance     REAL DEFAULT 0.0,
            points      INTEGER DEFAULT 0,
            avatar      TEXT,
            created_at  TEXT DEFAULT (datetime('now')),
            active      INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS waste_types (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            unit        TEXT DEFAULT 'kg',
            price_fcfa  REAL NOT NULL,
            color_hex   TEXT DEFAULT '1D9E75',
            icon        TEXT DEFAULT '♻️',
            description TEXT,
            active      INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS collection_points (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            address     TEXT NOT NULL,
            city        TEXT NOT NULL,
            lat         REAL,
            lng         REAL,
            manager_id  INTEGER REFERENCES users(id),
            capacity_kg REAL DEFAULT 500,
            active      INTEGER DEFAULT 1,
            created_at  TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS deposits (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER NOT NULL REFERENCES users(id),
            point_id        INTEGER NOT NULL REFERENCES collection_points(id),
            waste_type_id   INTEGER NOT NULL REFERENCES waste_types(id),
            weight_kg       REAL NOT NULL,
            price_per_kg    REAL NOT NULL,
            total_fcfa      REAL NOT NULL,
            qr_code         TEXT UNIQUE,
            status          TEXT DEFAULT 'pending',  -- pending | validated | paid | rejected
            created_at      TEXT DEFAULT (datetime('now')),
            validated_at    TEXT,
            notes           TEXT
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            deposit_id  INTEGER REFERENCES deposits(id),
            amount      REAL NOT NULL,
            type        TEXT NOT NULL,  -- credit | debit | withdrawal
            method      TEXT DEFAULT 'wastebank',  -- wastebank | wave | orange_money
            reference   TEXT UNIQUE,
            status      TEXT DEFAULT 'completed',
            created_at  TEXT DEFAULT (datetime('now')),
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS rse_reports (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name    TEXT NOT NULL,
            company_email   TEXT NOT NULL,
            period_start    TEXT NOT NULL,
            period_end      TEXT NOT NULL,
            total_kg        REAL DEFAULT 0,
            total_deposits  INTEGER DEFAULT 0,
            cities          TEXT,
            price_paid      REAL DEFAULT 0,
            status          TEXT DEFAULT 'pending',
            pdf_path        TEXT,
            created_at      TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            title       TEXT NOT NULL,
            message     TEXT NOT NULL,
            type        TEXT DEFAULT 'info',  -- info | success | warning | error
            read        INTEGER DEFAULT 0,
            created_at  TEXT DEFAULT (datetime('now'))
        );
    """)
    db.commit()

    # Seed waste types if empty
    count = db.execute("SELECT COUNT(*) FROM waste_types").fetchone()[0]
    if count == 0:
        wastes = [
            ("Plastique PET",   "kg", 120.0, "5DCAA5", "🧴", "Bouteilles, emballages plastique transparents"),
            ("Aluminium",       "kg", 380.0, "EF9F27", "🥫", "Canettes, boîtes aluminium, ferraille légère"),
            ("Papier/Carton",   "kg",  45.0, "7F77DD", "📦", "Cartons, journaux, cahiers, papier bureau"),
            ("Verre",           "kg",  30.0, "D85A30", "🍾", "Bouteilles, bocaux, verre de fenêtre"),
            ("Plastique dur",   "kg",  85.0, "1D9E75", "🪣", "Seaux, chaises en plastique, tuyaux"),
            ("Métaux ferreux",  "kg",  95.0, "888780", "⚙️", "Fer, acier, grilles, tôle"),
        ]
        db.executemany(
            "INSERT INTO waste_types (name, unit, price_fcfa, color_hex, icon, description) VALUES (?,?,?,?,?,?)",
            wastes,
        )

    # Seed collection points if empty
    cp_count = db.execute("SELECT COUNT(*) FROM collection_points").fetchone()[0]
    if cp_count == 0:
        points = [
            ("Point Collecte Médina",     "Rue 10 x 23, Médina",           "Dakar",   14.6928, -17.4467),
            ("Point Collecte Ouakam",     "VDN, Ouakam",                   "Dakar",   14.7167, -17.4900),
            ("Point Collecte Pikine",     "Marché Zinc, Pikine",           "Dakar",   14.7500, -17.3833),
            ("Point Collecte Plateau",    "Avenue Pompidou, Plateau",      "Dakar",   14.6667, -17.4333),
            ("Point Collecte Cocody",     "Rue des Jardins, Cocody",       "Abidjan", 5.3600,  -3.9800),
            ("Point Collecte Marcory",    "Boulevard de Marseille, Marcory","Abidjan", 5.3000, -4.0100),
        ]
        db.executemany(
            "INSERT INTO collection_points (name, address, city, lat, lng) VALUES (?,?,?,?,?)",
            points,
        )

    # Seed admin user if empty
    user_count = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if user_count == 0:
        pw_hash = hashlib.sha256("admin123".encode()).hexdigest()
        db.execute(
            "INSERT INTO users (name, email, phone, password, role, city) VALUES (?,?,?,?,?,?)",
            ("Admin WasteBank", "admin@wastebank.africa", "+221700000000", pw_hash, "admin", "Dakar"),
        )
        # Demo citizen
        pw2 = hashlib.sha256("demo123".encode()).hexdigest()
        db.execute(
            "INSERT INTO users (name, email, phone, password, role, city, balance, points) VALUES (?,?,?,?,?,?,?,?)",
            ("Moussa Diallo", "moussa@demo.com", "+221701234567", pw2, "citizen", "Dakar", 4750.0, 320),
        )
        # Demo collector
        pw3 = hashlib.sha256("collector123".encode()).hexdigest()
        db.execute(
            "INSERT INTO users (name, email, phone, password, role, city) VALUES (?,?,?,?,?,?)",
            ("Fatou Collector", "fatou@wastebank.africa", "+221709876543", pw3, "collector", "Dakar"),
        )

    db.commit()
    db.close()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def check_password(password: str, hashed: str) -> bool:
    return hashlib.sha256(password.encode()).hexdigest() == hashed


def generate_ref() -> str:
    return "WB-" + secrets.token_hex(5).upper()
