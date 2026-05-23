from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from models.db import get_db, generate_ref
from routes.auth import login_required
import secrets, datetime

dash_bp = Blueprint("dash", __name__)


@dash_bp.route("/")
@login_required
def home():
    db = get_db()
    uid = session["user_id"]
    user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()

    deposits = db.execute("""
        SELECT d.*, wt.name as waste_name, wt.color_hex, wt.icon,
               cp.name as point_name, cp.city
        FROM deposits d
        JOIN waste_types wt ON d.waste_type_id = wt.id
        JOIN collection_points cp ON d.point_id = cp.id
        WHERE d.user_id = ?
        ORDER BY d.created_at DESC LIMIT 10
    """, (uid,)).fetchall()

    transactions = db.execute("""
        SELECT * FROM transactions WHERE user_id=?
        ORDER BY created_at DESC LIMIT 8
    """, (uid,)).fetchall()

    stats = db.execute("""
        SELECT
          COUNT(*) as total_deposits,
          COALESCE(SUM(weight_kg),0) as total_kg,
          COALESCE(SUM(total_fcfa),0) as total_earned,
          COUNT(CASE WHEN status='pending' THEN 1 END) as pending
        FROM deposits WHERE user_id=?
    """, (uid,)).fetchone()

    # Monthly chart data (last 6 months)
    monthly = db.execute("""
        SELECT strftime('%Y-%m', created_at) as month,
               COALESCE(SUM(weight_kg),0) as kg,
               COALESCE(SUM(total_fcfa),0) as fcfa
        FROM deposits WHERE user_id=? AND status != 'rejected'
        GROUP BY month ORDER BY month DESC LIMIT 6
    """, (uid,)).fetchall()

    notifications = db.execute("""
        SELECT * FROM notifications WHERE user_id=? AND read=0
        ORDER BY created_at DESC LIMIT 5
    """, (uid,)).fetchall()

    waste_types = db.execute("SELECT * FROM waste_types WHERE active=1").fetchall()
    collection_points = db.execute("SELECT * FROM collection_points WHERE active=1").fetchall()

    return render_template("dashboard/home.html",
        user=user, deposits=deposits, transactions=transactions,
        stats=stats, monthly=list(reversed(monthly)),
        notifications=notifications, waste_types=waste_types,
        collection_points=collection_points,
    )


@dash_bp.route("/deposit/new", methods=["GET", "POST"])
@login_required
def new_deposit():
    db = get_db()
    uid = session["user_id"]
    waste_types = db.execute("SELECT * FROM waste_types WHERE active=1").fetchall()
    collection_points = db.execute("SELECT * FROM collection_points WHERE active=1").fetchall()

    if request.method == "POST":
        waste_type_id = request.form.get("waste_type_id")
        point_id      = request.form.get("point_id")
        weight_kg     = request.form.get("weight_kg")
        try:
            weight_kg = float(weight_kg)
            if weight_kg <= 0:
                raise ValueError
        except (TypeError, ValueError):
            flash("Poids invalide.", "error")
            return render_template("dashboard/new_deposit.html",
                waste_types=waste_types, collection_points=collection_points)

        wt = db.execute("SELECT * FROM waste_types WHERE id=?", (waste_type_id,)).fetchone()
        if not wt:
            flash("Type de déchet invalide.", "error")
            return render_template("dashboard/new_deposit.html",
                waste_types=waste_types, collection_points=collection_points)

        price_per_kg = wt["price_fcfa"]
        total = round(weight_kg * price_per_kg, 2)
        qr_code = "WB-DEP-" + secrets.token_hex(6).upper()

        db.execute("""
            INSERT INTO deposits (user_id, point_id, waste_type_id, weight_kg, price_per_kg, total_fcfa, qr_code)
            VALUES (?,?,?,?,?,?,?)
        """, (uid, point_id, waste_type_id, weight_kg, price_per_kg, total, qr_code))

        # Add notification
        db.execute("""
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?,?,?,?)
        """, (uid, "Dépôt enregistré",
              f"Votre dépôt de {weight_kg}kg en attente de validation. Réf: {qr_code}", "info"))
        db.commit()

        flash(f"Dépôt enregistré ! Référence: {qr_code}", "success")
        return redirect(url_for("dash.deposit_detail", qr=qr_code))

    return render_template("dashboard/new_deposit.html",
        waste_types=waste_types, collection_points=collection_points)


@dash_bp.route("/deposit/<qr>")
@login_required
def deposit_detail(qr):
    db = get_db()
    uid = session["user_id"]
    dep = db.execute("""
        SELECT d.*, wt.name as waste_name, wt.color_hex, wt.icon, wt.unit,
               cp.name as point_name, cp.address, cp.city
        FROM deposits d
        JOIN waste_types wt ON d.waste_type_id = wt.id
        JOIN collection_points cp ON d.point_id = cp.id
        WHERE d.qr_code=? AND d.user_id=?
    """, (qr, uid)).fetchone()
    if not dep:
        flash("Dépôt introuvable.", "error")
        return redirect(url_for("dash.home"))
    return render_template("dashboard/deposit_detail.html", dep=dep)


@dash_bp.route("/wallet")
@login_required
def wallet():
    db = get_db()
    uid = session["user_id"]
    user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    transactions = db.execute("""
        SELECT t.*, d.qr_code, d.weight_kg,
               wt.name as waste_name
        FROM transactions t
        LEFT JOIN deposits d ON t.deposit_id = d.id
        LEFT JOIN waste_types wt ON d.waste_type_id = wt.id
        WHERE t.user_id=?
        ORDER BY t.created_at DESC
    """, (uid,)).fetchall()
    return render_template("dashboard/wallet.html", user=user, transactions=transactions)


@dash_bp.route("/withdraw", methods=["POST"])
@login_required
def withdraw():
    db = get_db()
    uid = session["user_id"]
    amount = request.form.get("amount", 0)
    method = request.form.get("method", "wave")
    phone  = request.form.get("phone", "")
    try:
        amount = float(amount)
    except ValueError:
        flash("Montant invalide.", "error")
        return redirect(url_for("dash.wallet"))
    user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    if user["balance"] < amount or amount < 500:
        flash("Solde insuffisant ou montant minimum 500 FCFA.", "error")
        return redirect(url_for("dash.wallet"))
    ref = generate_ref()
    db.execute("UPDATE users SET balance = balance - ? WHERE id=?", (amount, uid))
    db.execute("""
        INSERT INTO transactions (user_id, amount, type, method, reference, description)
        VALUES (?,?,?,?,?,?)
    """, (uid, -amount, "withdrawal", method, ref, f"Retrait vers {phone}"))
    db.execute("""
        INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)
    """, (uid, "Retrait en cours",
          f"{amount:.0f} FCFA envoyés sur {method.replace('_',' ')} ({phone}). Réf: {ref}", "success"))
    db.commit()
    flash(f"Retrait de {amount:.0f} FCFA initié ! Réf: {ref}", "success")
    return redirect(url_for("dash.wallet"))


@dash_bp.route("/notifications/read", methods=["POST"])
@login_required
def mark_read():
    db = get_db()
    db.execute("UPDATE notifications SET read=1 WHERE user_id=?", (session["user_id"],))
    db.commit()
    return jsonify({"ok": True})


@dash_bp.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    db = get_db()
    uid = session["user_id"]
    if request.method == "POST":
        name  = request.form.get("name", "").strip()
        phone = request.form.get("phone", "").strip()
        city  = request.form.get("city", "Dakar")
        db.execute("UPDATE users SET name=?, phone=?, city=? WHERE id=?", (name, phone, city, uid))
        db.commit()
        session["user_name"] = name
        flash("Profil mis à jour.", "success")
        return redirect(url_for("dash.profile"))
    user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    return render_template("dashboard/profile.html", user=user)


# ── Collector view ─────────────────────────────────────────────────────────────
@dash_bp.route("/collector")
@login_required
def collector():
    db = get_db()
    uid = session["user_id"]
    user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    if user["role"] not in ("collector", "admin"):
        flash("Accès réservé aux collecteurs.", "error")
        return redirect(url_for("dash.home"))

    pending = db.execute("""
        SELECT d.*, u.name as citizen_name, u.phone as citizen_phone,
               wt.name as waste_name, wt.color_hex, wt.icon,
               cp.name as point_name
        FROM deposits d
        JOIN users u ON d.user_id = u.id
        JOIN waste_types wt ON d.waste_type_id = wt.id
        JOIN collection_points cp ON d.point_id = cp.id
        WHERE d.status = 'pending'
        ORDER BY d.created_at ASC
    """).fetchall()

    today_stats = db.execute("""
        SELECT COUNT(*) as count, COALESCE(SUM(weight_kg),0) as kg,
               COALESCE(SUM(total_fcfa),0) as fcfa
        FROM deposits
        WHERE status='validated' AND date(validated_at)=date('now')
    """).fetchone()

    return render_template("dashboard/collector.html",
        pending=pending, today_stats=today_stats, user=user)


@dash_bp.route("/validate/<int:dep_id>", methods=["POST"])
@login_required
def validate_deposit(dep_id):
    db = get_db()
    uid = session["user_id"]
    user = db.execute("SELECT role FROM users WHERE id=?", (uid,)).fetchone()
    if user["role"] not in ("collector", "admin"):
        return jsonify({"error": "forbidden"}), 403
    action = request.form.get("action", "validate")
    dep = db.execute("SELECT * FROM deposits WHERE id=?", (dep_id,)).fetchone()
    if not dep:
        flash("Dépôt introuvable.", "error")
        return redirect(url_for("dash.collector"))
    if action == "validate":
        db.execute("""
            UPDATE deposits SET status='paid', validated_at=datetime('now') WHERE id=?
        """, (dep_id,))
        # Credit user
        db.execute("UPDATE users SET balance = balance + ?, points = points + ? WHERE id=?",
                   (dep["total_fcfa"], int(dep["weight_kg"] * 10), dep["user_id"]))
        ref = generate_ref()
        db.execute("""
            INSERT INTO transactions (user_id, deposit_id, amount, type, reference, description)
            VALUES (?,?,?,?,?,?)
        """, (dep["user_id"], dep_id, dep["total_fcfa"], "credit", ref,
              f"Paiement dépôt {dep['qr_code']}"))
        db.execute("""
            INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)
        """, (dep["user_id"], "💰 Paiement reçu !",
              f"{dep['total_fcfa']:.0f} FCFA crédités pour {dep['weight_kg']}kg. Réf: {ref}", "success"))
    else:
        db.execute("UPDATE deposits SET status='rejected' WHERE id=?", (dep_id,))
        db.execute("""
            INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)
        """, (dep["user_id"], "Dépôt refusé",
              f"Dépôt {dep['qr_code']} refusé. Contactez le point de collecte.", "warning"))
    db.commit()
    flash("Dépôt traité avec succès.", "success")
    return redirect(url_for("dash.collector"))
