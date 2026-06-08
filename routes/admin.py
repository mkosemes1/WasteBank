"""
WasteBank Admin Routes v2
- Create collector users (admin only)
- Assign collector to single point
- Live activity feed of all collector actions
"""
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify, Response
from models.db import get_db, hash_password
from routes.auth import login_required
import json, time

admin_bp = Blueprint("admin", __name__)

def admin_required(f):
    from functools import wraps
    @wraps(f)
    def dec(*a, **kw):
        if session.get("user_role") != "admin":
            flash("Accès administrateur requis.", "error")
            return redirect(url_for("dash.home"))
        return f(*a, **kw)
    return dec

# ── Dashboard admin ────────────────────────────────────────────────────────────
@admin_bp.route("/")
@login_required
@admin_required
def dashboard():
    db = get_db()
    stats = db.execute("""
        SELECT
          (SELECT COUNT(*) FROM users WHERE role='citizen') as citizens,
          (SELECT COUNT(*) FROM users WHERE role='collector') as collectors,
          (SELECT COUNT(*) FROM deposits) as total_deposits,
          (SELECT COALESCE(SUM(weight_kg),0) FROM deposits WHERE status='paid') as total_kg,
          (SELECT COALESCE(SUM(total_fcfa),0) FROM deposits WHERE status='paid') as total_paid,
          (SELECT COUNT(*) FROM deposits WHERE status='pending') as pending,
          (SELECT COUNT(*) FROM collection_points WHERE active=1) as active_points
    """).fetchone()

    recent = db.execute("""
        SELECT d.*, u.name as user_name, wt.name as waste_name, wt.color_hex,
               cp.name as point_name
        FROM deposits d JOIN users u ON d.user_id=u.id
        JOIN waste_types wt ON d.waste_type_id=wt.id
        JOIN collection_points cp ON d.point_id=cp.id
        ORDER BY d.created_at DESC LIMIT 15
    """).fetchall()

    monthly = db.execute("""
        SELECT strftime('%Y-%m',created_at) as month,
               COUNT(*) as count, COALESCE(SUM(weight_kg),0) as kg,
               COALESCE(SUM(total_fcfa),0) as fcfa
        FROM deposits WHERE status!='rejected'
        GROUP BY month ORDER BY month DESC LIMIT 6
    """).fetchall()

    waste_bk = db.execute("""
        SELECT wt.name, wt.color_hex,
               COALESCE(SUM(d.weight_kg),0) as total_kg, COUNT(d.id) as count
        FROM waste_types wt LEFT JOIN deposits d ON d.waste_type_id=wt.id AND d.status='paid'
        GROUP BY wt.id ORDER BY total_kg DESC
    """).fetchall()

    # Live collector actions (last 20)
    live = db.execute("""
        SELECT ca.*, u.name as collector_name, cp.name as point_name,
               d.qr_code, wt.name as waste_name
        FROM collector_actions ca
        JOIN users u ON ca.collector_id=u.id
        LEFT JOIN collection_points cp ON ca.point_id=cp.id
        LEFT JOIN deposits d ON ca.deposit_id=d.id
        LEFT JOIN waste_types wt ON d.waste_type_id=wt.id
        ORDER BY ca.created_at DESC LIMIT 20
    """).fetchall()

    collectors = db.execute("""
        SELECT u.*, cp.name as point_name, cp.id as point_id,
               (SELECT COUNT(*) FROM deposits d WHERE d.user_id IS NOT NULL AND d.validated_by=u.id AND date(d.validated_at)=date('now')) as today_validated
        FROM users u
        LEFT JOIN collector_points cpx ON cpx.collector_id=u.id
        LEFT JOIN collection_points cp ON cp.id=cpx.point_id
        WHERE u.role='collector'
    """).fetchall()

    top_users = db.execute("""
        SELECT u.name, u.city, COUNT(d.id) as deposits,
               COALESCE(SUM(d.weight_kg),0) as kg,
               COALESCE(SUM(d.total_fcfa),0) as earned
        FROM users u LEFT JOIN deposits d ON d.user_id=u.id AND d.status='paid'
        WHERE u.role='citizen'
        GROUP BY u.id ORDER BY earned DESC LIMIT 5
    """).fetchall()

    return render_template("admin/dashboard.html",
        stats=stats, recent=recent, monthly=list(reversed(monthly)),
        waste_bk=waste_bk, live=live, collectors=collectors, top_users=top_users)


# ── SSE Live Feed ──────────────────────────────────────────────────────────────
@admin_bp.route("/live-feed")
@login_required
@admin_required
def live_feed():
    """Server-Sent Events pour le flux temps réel des actions collecteurs."""
    def generate():
        last_id = 0
        while True:
            db = get_db()
            rows = db.execute("""
                SELECT ca.id, ca.action, ca.amount_fcfa, ca.weight_kg,
                       ca.created_at, u.name as collector_name,
                       cp.name as point_name, d.qr_code,
                       wt.name as waste_name
                FROM collector_actions ca
                JOIN users u ON ca.collector_id=u.id
                LEFT JOIN collection_points cp ON ca.point_id=cp.id
                LEFT JOIN deposits d ON ca.deposit_id=d.id
                LEFT JOIN waste_types wt ON d.waste_type_id=wt.id
                WHERE ca.id > ?
                ORDER BY ca.id ASC LIMIT 10
            """, (last_id,)).fetchall()
            for row in rows:
                last_id = row["id"]
                data = json.dumps({
                    "id":          row["id"],
                    "action":      row["action"],
                    "collector":   row["collector_name"],
                    "point":       row["point_name"] or "",
                    "waste":       row["waste_name"] or "",
                    "amount":      row["amount_fcfa"],
                    "weight":      row["weight_kg"],
                    "qr":          row["qr_code"] or "",
                    "time":        row["created_at"][:16],
                })
                yield f"data: {data}\n\n"
            time.sleep(3)
    return Response(generate(), mimetype="text/event-stream",
                    headers={"Cache-Control":"no-cache","X-Accel-Buffering":"no"})


# ── Créer un collecteur (admin seulement) ─────────────────────────────────────
@admin_bp.route("/collectors/create", methods=["GET", "POST"])
@login_required
@admin_required
def create_collector():
    db = get_db()
    points = db.execute("SELECT * FROM collection_points WHERE active=1 ORDER BY city,name").fetchall()

    if request.method == "POST":
        name     = request.form.get("name","").strip()
        email    = request.form.get("email","").strip().lower()
        phone    = request.form.get("phone","").strip()
        password = request.form.get("password","")
        point_id = request.form.get("point_id","")

        if not all([name,email,phone,password,point_id]):
            flash("Tous les champs sont requis.", "error")
            return render_template("admin/create_collector.html", points=points)

        existing = db.execute("SELECT id FROM users WHERE email=? OR phone=?",(email,phone)).fetchone()
        if existing:
            flash("Email ou téléphone déjà utilisé.", "error")
            return render_template("admin/create_collector.html", points=points)

        res = db.execute("""
            INSERT INTO users (name,email,phone,password,role,city)
            VALUES (?,?,?,?,?,?)
        """,(name,email,phone,hash_password(password),"collector","Dakar"))
        coll_id = res.lastrowid
        # Assigner au point unique
        db.execute("INSERT INTO collector_points (collector_id,point_id) VALUES(?,?)",(coll_id,point_id))
        # Log admin action
        db.execute("INSERT INTO collector_actions (collector_id,action,point_id,notes) VALUES(?,?,?,?)",
                   (coll_id,"created",point_id,f"Créé par admin #{session['user_id']}"))
        db.commit()
        flash(f"Collecteur {name} créé et assigné au point #{point_id}.", "success")
        return redirect(url_for("admin.users"))

    return render_template("admin/create_collector.html", points=points)


# ── Gestion utilisateurs ───────────────────────────────────────────────────────
@admin_bp.route("/users")
@login_required
@admin_required
def users():
    db = get_db()
    role_f = request.args.get("role",""); q = request.args.get("q","")
    qr = "SELECT * FROM users WHERE 1=1"
    params = []
    if role_f: qr += " AND role=?"; params.append(role_f)
    if q: qr += " AND (name LIKE ? OR email LIKE ?)"; params += [f"%{q}%",f"%{q}%"]
    qr += " ORDER BY created_at DESC"
    all_users = db.execute(qr, params).fetchall()
    all_points = db.execute("SELECT * FROM collection_points WHERE active=1").fetchall()
    collector_points = {}
    for row in db.execute("SELECT collector_id, point_id FROM collector_points").fetchall():
        collector_points[row["collector_id"]] = row["point_id"]
    return render_template("admin/users.html", users=all_users, role_filter=role_f, q=q,
                           all_points=all_points, collector_points=collector_points)

@admin_bp.route("/users/<int:uid>/toggle", methods=["POST"])
@login_required
@admin_required
def toggle_user(uid):
    db = get_db()
    db.execute("UPDATE users SET active=1-active WHERE id=?", (uid,))
    db.commit()
    return jsonify({"ok":True})

@admin_bp.route("/users/<int:uid>/assign-point", methods=["POST"])
@login_required
@admin_required
def assign_point(uid):
    db = get_db()
    point_id = request.form.get("point_id")
    if not point_id:
        flash("Sélectionnez un point.", "error")
        return redirect(url_for("admin.users"))
    db.execute("DELETE FROM collector_points WHERE collector_id=?", (uid,))
    db.execute("INSERT INTO collector_points (collector_id,point_id) VALUES(?,?)", (uid,point_id))
    db.commit()
    flash("Point de collecte mis à jour.", "success")
    return redirect(url_for("admin.users"))


# ── Types de déchets ───────────────────────────────────────────────────────────
@admin_bp.route("/waste-types", methods=["GET","POST"])
@login_required
@admin_required
def waste_types():
    db = get_db()
    if request.method == "POST":
        action = request.form.get("action")
        if action == "add":
            db.execute("INSERT INTO waste_types (name,unit,price_fcfa,color_hex,icon,description) VALUES(?,?,?,?,?,?)",
                (request.form["name"],request.form.get("unit","kg"),float(request.form["price"]),
                 request.form.get("color","C87941"),request.form.get("icon","recycle"),request.form.get("description","")))
            db.commit(); flash("Type ajouté.","success")
        elif action == "update":
            db.execute("UPDATE waste_types SET price_fcfa=? WHERE id=?",
                (float(request.form["price"]),request.form["wt_id"]))
            db.commit(); flash("Prix mis à jour.","success")
        elif action == "toggle":
            db.execute("UPDATE waste_types SET active=1-active WHERE id=?", (request.form["wt_id"],))
            db.commit()
        return redirect(url_for("admin.waste_types"))
    wts = db.execute("SELECT * FROM waste_types ORDER BY name").fetchall()
    return render_template("admin/waste_types.html", waste_types=wts)


# ── Points de collecte ─────────────────────────────────────────────────────────
@admin_bp.route("/collection-points", methods=["GET","POST"])
@login_required
@admin_required
def collection_points():
    db = get_db()
    if request.method == "POST":
        action = request.form.get("action")
        if action == "add":
            db.execute("INSERT INTO collection_points (name,address,city,lat,lng) VALUES(?,?,?,?,?)",
                (request.form["name"],request.form["address"],request.form["city"],
                 float(request.form.get("lat",0) or 0),float(request.form.get("lng",0) or 0)))
            db.commit(); flash("Point ajouté.","success")
        elif action == "toggle":
            db.execute("UPDATE collection_points SET active=1-active WHERE id=?", (request.form["cp_id"],))
            db.commit()
        return redirect(url_for("admin.collection_points"))
    cps = db.execute("""
        SELECT cp.*, u.name as manager_name,
               (SELECT COUNT(*) FROM collector_points cpx WHERE cpx.point_id=cp.id) as collector_count
        FROM collection_points cp LEFT JOIN users u ON cp.manager_id=u.id
        ORDER BY cp.city, cp.name
    """).fetchall()
    return render_template("admin/collection_points.html", points=cps)


# ── Tous les dépôts ────────────────────────────────────────────────────────────
@admin_bp.route("/deposits")
@login_required
@admin_required
def deposits():
    db = get_db()
    status = request.args.get("status",""); city = request.args.get("city","")
    q = """SELECT d.*, u.name as user_name, wt.name as waste_name, wt.color_hex,
               cp.name as point_name, cp.city, cb.name as validator_name
           FROM deposits d JOIN users u ON d.user_id=u.id
           JOIN waste_types wt ON d.waste_type_id=wt.id
           JOIN collection_points cp ON d.point_id=cp.id
           LEFT JOIN users cb ON d.validated_by=cb.id WHERE 1=1"""
    params = []
    if status: q += " AND d.status=?"; params.append(status)
    if city: q += " AND cp.city=?"; params.append(city)
    q += " ORDER BY d.created_at DESC LIMIT 100"
    deps = db.execute(q,params).fetchall()
    cities = db.execute("SELECT DISTINCT city FROM collection_points").fetchall()
    return render_template("admin/deposits.html", deposits=deps,
                           status_filter=status, city_filter=city, cities=cities)


# ── Rapports RSE ───────────────────────────────────────────────────────────────
@admin_bp.route("/rse", methods=["GET","POST"])
@login_required
@admin_required
def rse():
    db = get_db()
    if request.method == "POST":
        db.execute("INSERT INTO rse_reports (company_name,company_email,period_start,period_end,price_paid) VALUES(?,?,?,?,?)",
            (request.form["company"],request.form["email"],request.form["start"],request.form["end"],float(request.form.get("price",0))))
        db.commit(); flash("Rapport RSE créé.","success")
        return redirect(url_for("admin.rse"))
    reports = db.execute("SELECT * FROM rse_reports ORDER BY created_at DESC").fetchall()
    return render_template("admin/rse.html", reports=reports)
