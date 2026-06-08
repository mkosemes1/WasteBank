"""
WasteBank — Database layer v2
"""
import sqlite3, hashlib, secrets
from flask import g, current_app

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"], detect_types=sqlite3.PARSE_DECLTYPES)
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
            role        TEXT NOT NULL DEFAULT 'citizen',
            city        TEXT DEFAULT 'Dakar',
            balance     REAL DEFAULT 0.0,
            points      INTEGER DEFAULT 0,
            created_at  TEXT DEFAULT (datetime('now')),
            active      INTEGER DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS waste_types (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            unit        TEXT DEFAULT 'kg',
            price_fcfa  REAL NOT NULL,
            color_hex   TEXT DEFAULT 'C87941',
            icon        TEXT DEFAULT 'recycle',
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
        CREATE TABLE IF NOT EXISTS collector_points (
            collector_id INTEGER NOT NULL REFERENCES users(id),
            point_id     INTEGER NOT NULL REFERENCES collection_points(id),
            assigned_at  TEXT DEFAULT (datetime('now')),
            PRIMARY KEY (collector_id, point_id)
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
            status          TEXT DEFAULT 'pending',
            ai_method       TEXT,
            ai_confidence   INTEGER,
            created_at      TEXT DEFAULT (datetime('now')),
            validated_at    TEXT,
            validated_by    INTEGER REFERENCES users(id),
            notes           TEXT
        );
        CREATE TABLE IF NOT EXISTS transactions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            deposit_id  INTEGER REFERENCES deposits(id),
            amount      REAL NOT NULL,
            type        TEXT NOT NULL,
            method      TEXT DEFAULT 'wastebank',
            reference   TEXT UNIQUE,
            status      TEXT DEFAULT 'completed',
            created_at  TEXT DEFAULT (datetime('now')),
            description TEXT
        );
        CREATE TABLE IF NOT EXISTS collector_actions (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            collector_id INTEGER NOT NULL REFERENCES users(id),
            deposit_id   INTEGER REFERENCES deposits(id),
            action       TEXT NOT NULL,
            point_id     INTEGER REFERENCES collection_points(id),
            amount_fcfa  REAL DEFAULT 0,
            weight_kg    REAL DEFAULT 0,
            created_at   TEXT DEFAULT (datetime('now')),
            notes        TEXT
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
            created_at      TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS notifications (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            title       TEXT NOT NULL,
            message     TEXT NOT NULL,
            type        TEXT DEFAULT 'info',
            read        INTEGER DEFAULT 0,
            created_at  TEXT DEFAULT (datetime('now'))
        );
    """)
    db.commit()

    # Seed waste types
    if db.execute("SELECT COUNT(*) FROM waste_types").fetchone()[0] == 0:
        db.executemany("INSERT INTO waste_types (name,unit,price_fcfa,color_hex,icon,description) VALUES(?,?,?,?,?,?)",[
            ("Plastique PET","kg",120.0,"5DCAA5","bottle","Bouteilles, emballages transparents"),
            ("Aluminium","kg",380.0,"EF9F27","can","Canettes, boites aluminium"),
            ("Papier/Carton","kg",45.0,"7F77DD","box","Cartons, journaux, papier"),
            ("Verre","kg",30.0,"D85A30","wine-bottle","Bouteilles, bocaux verre"),
            ("Plastique dur","kg",85.0,"1D9E75","bucket","Seaux, chaises plastique"),
            ("Metaux ferreux","kg",95.0,"888780","cog","Fer, acier, tole"),
        ])

    # Seed collection points
    if db.execute("SELECT COUNT(*) FROM collection_points").fetchone()[0] == 0:
        db.executemany("INSERT INTO collection_points (name,address,city,lat,lng) VALUES(?,?,?,?,?)",[
            ("Point Medina","Rue 10 x 23, Medina","Dakar",14.6928,-17.4467),
            ("Point Ouakam","VDN, Ouakam","Dakar",14.7167,-17.4900),
            ("Point Pikine","Marche Zinc, Pikine","Dakar",14.7500,-17.3833),
            ("Point Plateau","Avenue Pompidou, Plateau","Dakar",14.6667,-17.4333),
            ("Point Cocody","Rue des Jardins, Cocody","Abidjan",5.3600,-3.9800),
            ("Point Marcory","Boulevard Marseille","Abidjan",5.3000,-4.0100),
        ])

    # Seed users
    if db.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
        pw = lambda p: hashlib.sha256(p.encode()).hexdigest()
        db.execute("INSERT INTO users (name,email,phone,password,role,city) VALUES(?,?,?,?,?,?)",
            ("Admin WasteBank","admin@wastebank.africa","+221700000000",pw("admin123"),"admin","Dakar"))
        db.execute("INSERT INTO users (name,email,phone,password,role,city,balance,points) VALUES(?,?,?,?,?,?,?,?)",
            ("Moussa Diallo","moussa@demo.com","+221701234567",pw("demo123"),"citizen","Dakar",4750.0,320))
        # Collector assigned to point 1
        res = db.execute("INSERT INTO users (name,email,phone,password,role,city) VALUES(?,?,?,?,?,?)",
            ("Fatou Collector","fatou@wastebank.africa","+221709876543",pw("collector123"),"collector","Dakar"))
        cid = res.lastrowid
        db.execute("INSERT INTO collector_points (collector_id,point_id) VALUES(?,?)",(cid,1))
    db.commit(); db.close()

def hash_password(p): return hashlib.sha256(p.encode()).hexdigest()
def check_password(p,h): return hashlib.sha256(p.encode()).hexdigest() == h
def generate_ref(): return "WB-"+secrets.token_hex(5).upper()
