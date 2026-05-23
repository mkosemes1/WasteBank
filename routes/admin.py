from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from models.db import get_db, hash_password
from routes.auth import login_required

admin_bp = Blueprint("admin", __name__)


def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get("user_role") != "admin":
            flash("Accès administrateur requis.", "error")
            return redirect(url_for("dash.home"))
        return f(*args, **kwargs)
    return decorated


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

    recent_deposits = db.execute("""
        SELECT d.*, u.name as user_name, wt.name as waste_name, wt.color_hex,
               cp.name as point_name
        FROM deposits d
        JOIN users u ON d.user_id = u.id
        JOIN waste_types wt ON d.waste_type_id = wt.id
        JOIN collection_points cp ON d.point_id = cp.id
        ORDER BY d.created_at DESC LIMIT 15
    """).fetchall()

    monthly = db.execute("""
        SELECT strftime('%Y-%m', created_at) as month,
               COUNT(*) as count,
               COALESCE(SUM(weight_kg),0) as kg,
               COALESCE(SUM(total_fcfa),0) as fcfa
        FROM deposits WHERE status != 'rejected'
        GROUP BY month ORDER BY month DESC LIMIT 6
    """).fetchall()

    top_users = db.execute("""
        SELECT u.name, u.city, COUNT(d.id) as deposits,
               COALESCE(SUM(d.weight_kg),0) as kg,
               COALESCE(SUM(d.total_fcfa),0) as earned
        FROM users u
        LEFT JOIN deposits d ON d.user_id = u.id AND d.status='paid'
        WHERE u.role='citizen'
        GROUP BY u.id ORDER BY earned DESC LIMIT 5
    """).fetchall()

    waste_breakdown = db.execute("""
        SELECT wt.name, wt.color_hex, wt.icon,
               COALESCE(SUM(d.weight_kg),0) as total_kg,
               COUNT(d.id) as count
        FROM waste_types wt
        LEFT JOIN deposits d ON d.waste_type_id = wt.id AND d.status='paid'
        GROUP BY wt.id ORDER BY total_kg DESC
    """).fetchall()

    return render_template("admin/dashboard.html",
        stats=stats, recent_deposits=recent_deposits,
        monthly=list(reversed(monthly)), top_users=top_users,
        waste_breakdown=waste_breakdown,
    )


@admin_bp.route("/users")
@login_required
@admin_required
def users():
    db = get_db()
    role_filter = request.args.get("role", "")
    q = request.args.get("q", "")
    query = "SELECT * FROM users WHERE 1=1"
    params = []
    if role_filter:
        query += " AND role=?"
        params.append(role_filter)
    if q:
        query += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)"
        params += [f"%{q}%", f"%{q}%", f"%{q}%"]
    query += " ORDER BY created_at DESC"
    all_users = db.execute(query, params).fetchall()
    return render_template("admin/users.html", users=all_users, role_filter=role_filter, q=q)


@admin_bp.route("/users/<int:uid>/toggle", methods=["POST"])
@login_required
@admin_required
def toggle_user(uid):
    db = get_db()
    db.execute("UPDATE users SET active = 1 - active WHERE id=?", (uid,))
    db.commit()
    return jsonify({"ok": True})


@admin_bp.route("/users/<int:uid>/role", methods=["POST"])
@login_required
@admin_required
def change_role(uid):
    db = get_db()
    new_role = request.form.get("role", "citizen")
    db.execute("UPDATE users SET role=? WHERE id=?", (new_role, uid))
    db.commit()
    flash("Rôle mis à jour.", "success")
    return redirect(url_for("admin.users"))


@admin_bp.route("/waste-types", methods=["GET", "POST"])
@login_required
@admin_required
def waste_types():
    db = get_db()
    if request.method == "POST":
        action = request.form.get("action")
        if action == "add":
            db.execute("""
                INSERT INTO waste_types (name, unit, price_fcfa, color_hex, icon, description)
                VALUES (?,?,?,?,?,?)
            """, (request.form["name"], request.form.get("unit","kg"),
                  float(request.form["price"]), request.form.get("color","1D9E75"),
                  request.form.get("icon","♻️"), request.form.get("description","")))
            db.commit()
            flash("Type ajouté.", "success")
        elif action == "update":
            db.execute("""
                UPDATE waste_types SET name=?, price_fcfa=?, description=? WHERE id=?
            """, (request.form["name"], float(request.form["price"]),
                  request.form.get("description",""), request.form["wt_id"]))
            db.commit()
            flash("Prix mis à jour.", "success")
        elif action == "toggle":
            db.execute("UPDATE waste_types SET active=1-active WHERE id=?", (request.form["wt_id"],))
            db.commit()
        return redirect(url_for("admin.waste_types"))
    wts = db.execute("SELECT * FROM waste_types ORDER BY name").fetchall()
    return render_template("admin/waste_types.html", waste_types=wts)


@admin_bp.route("/collection-points", methods=["GET", "POST"])
@login_required
@admin_required
def collection_points():
    db = get_db()
    if request.method == "POST":
        action = request.form.get("action")
        if action == "add":
            db.execute("""
                INSERT INTO collection_points (name, address, city, lat, lng)
                VALUES (?,?,?,?,?)
            """, (request.form["name"], request.form["address"], request.form["city"],
                  float(request.form.get("lat", 0) or 0),
                  float(request.form.get("lng", 0) or 0)))
            db.commit()
            flash("Point ajouté.", "success")
        elif action == "toggle":
            db.execute("UPDATE collection_points SET active=1-active WHERE id=?", (request.form["cp_id"],))
            db.commit()
        return redirect(url_for("admin.collection_points"))
    cps = db.execute("""
        SELECT cp.*, u.name as manager_name
        FROM collection_points cp
        LEFT JOIN users u ON cp.manager_id = u.id
        ORDER BY cp.city, cp.name
    """).fetchall()
    return render_template("admin/collection_points.html", points=cps)


@admin_bp.route("/deposits")
@login_required
@admin_required
def deposits():
    db = get_db()
    status = request.args.get("status", "")
    city = request.args.get("city", "")
    query = """
        SELECT d.*, u.name as user_name, wt.name as waste_name, wt.color_hex, wt.icon,
               cp.name as point_name, cp.city
        FROM deposits d
        JOIN users u ON d.user_id = u.id
        JOIN waste_types wt ON d.waste_type_id = wt.id
        JOIN collection_points cp ON d.point_id = cp.id
        WHERE 1=1
    """
    params = []
    if status:
        query += " AND d.status=?"
        params.append(status)
    if city:
        query += " AND cp.city=?"
        params.append(city)
    query += " ORDER BY d.created_at DESC LIMIT 100"
    deps = db.execute(query, params).fetchall()
    cities = db.execute("SELECT DISTINCT city FROM collection_points").fetchall()
    return render_template("admin/deposits.html", deposits=deps,
                           status_filter=status, city_filter=city, cities=cities)


@admin_bp.route("/rse", methods=["GET", "POST"])
@login_required
@admin_required
def rse():
    db = get_db()
    if request.method == "POST":
        db.execute("""
            INSERT INTO rse_reports (company_name, company_email, period_start, period_end, price_paid)
            VALUES (?,?,?,?,?)
        """, (request.form["company"], request.form["email"],
              request.form["start"], request.form["end"],
              float(request.form.get("price", 0))))
        db.commit()
        flash("Rapport RSE créé.", "success")
        return redirect(url_for("admin.rse"))
    reports = db.execute("SELECT * FROM rse_reports ORDER BY created_at DESC").fetchall()
    return render_template("admin/rse.html", reports=reports)
