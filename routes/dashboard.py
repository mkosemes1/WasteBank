"""
WasteBank Dashboard Routes v2
- Collector sees only their assigned point
- Collector monthly stats
- Deposit: no point_id field (auto-assigned to collector's point)
- Citizens see all available points
"""
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from models.db import get_db, generate_ref
from routes.auth import login_required
import secrets

dash_bp = Blueprint("dash", __name__)


@dash_bp.route("/")
@login_required
def home():
    db = get_db()
    uid = session["user_id"]
    user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    role = user["role"]

    if role == "collector":
        return redirect(url_for("dash.collector"))

    deposits = db.execute("""
        SELECT d.*, wt.name as waste_name, wt.color_hex, wt.icon,
               cp.name as point_name, cp.city
        FROM deposits d JOIN waste_types wt ON d.waste_type_id=wt.id
        JOIN collection_points cp ON d.point_id=cp.id
        WHERE d.user_id=? ORDER BY d.created_at DESC LIMIT 10
    """, (uid,)).fetchall()

    transactions = db.execute("SELECT * FROM transactions WHERE user_id=? ORDER BY created_at DESC LIMIT 8",(uid,)).fetchall()

    stats = db.execute("""
        SELECT COUNT(*) as total_deposits, COALESCE(SUM(weight_kg),0) as total_kg,
               COALESCE(SUM(total_fcfa),0) as total_earned
        FROM deposits WHERE user_id=? AND status!='rejected'
    """, (uid,)).fetchone()

    monthly = db.execute("""
        SELECT strftime('%Y-%m',created_at) as month,
               COALESCE(SUM(weight_kg),0) as kg, COALESCE(SUM(total_fcfa),0) as fcfa
        FROM deposits WHERE user_id=? AND status!='rejected'
        GROUP BY month ORDER BY month DESC LIMIT 6
    """, (uid,)).fetchall()

    notifications = db.execute("SELECT * FROM notifications WHERE user_id=? AND read=0 ORDER BY created_at DESC LIMIT 5",(uid,)).fetchall()
    waste_types = db.execute("SELECT * FROM waste_types WHERE active=1").fetchall()

    # All active collection points for citizen view
    collection_points = db.execute("SELECT * FROM collection_points WHERE active=1 ORDER BY city,name").fetchall()

    return render_template("dashboard/home.html",
        user=user, deposits=deposits, transactions=transactions,
        stats=stats, monthly=list(reversed(monthly)),
        notifications=notifications, waste_types=waste_types,
        collection_points=collection_points)


@dash_bp.route("/wallet")
@login_required
def wallet():
    db = get_db(); uid = session["user_id"]
    user = db.execute("SELECT * FROM users WHERE id=?",(uid,)).fetchone()
    transactions = db.execute("""
        SELECT t.*, d.qr_code, d.weight_kg, wt.name as waste_name
        FROM transactions t
        LEFT JOIN deposits d ON t.deposit_id=d.id
        LEFT JOIN waste_types wt ON d.waste_type_id=wt.id
        WHERE t.user_id=? ORDER BY t.created_at DESC
    """,(uid,)).fetchall()
    return render_template("dashboard/wallet.html", user=user, transactions=transactions)


@dash_bp.route("/withdraw", methods=["POST"])
@login_required
def withdraw():
    db = get_db(); uid = session["user_id"]
    try: amount = float(request.form.get("amount",0))
    except ValueError: flash("Montant invalide.","error"); return redirect(url_for("dash.wallet"))
    method = request.form.get("method","wave"); phone = request.form.get("phone","")
    user = db.execute("SELECT * FROM users WHERE id=?",(uid,)).fetchone()
    if user["balance"] < amount or amount < 500:
        flash("Solde insuffisant ou montant minimum 500 FCFA.","error"); return redirect(url_for("dash.wallet"))
    ref = generate_ref()
    db.execute("UPDATE users SET balance=balance-? WHERE id=?",(amount,uid))
    db.execute("INSERT INTO transactions (user_id,amount,type,method,reference,description) VALUES(?,?,?,?,?,?)",
               (uid,-amount,"withdrawal",method,ref,f"Retrait vers {phone}"))
    db.execute("INSERT INTO notifications (user_id,title,message,type) VALUES(?,?,?,?)",
               (uid,"Retrait initié",f"{amount:.0f} FCFA en cours vers {method} ({phone}). Ref:{ref}","info"))
    db.commit(); flash(f"Retrait de {amount:.0f} FCFA initié. Ref:{ref}","success")
    return redirect(url_for("dash.wallet"))


@dash_bp.route("/profile", methods=["GET","POST"])
@login_required
def profile():
    db = get_db(); uid = session["user_id"]
    if request.method == "POST":
        name = request.form.get("name","").strip()
        phone = request.form.get("phone","").strip()
        city = request.form.get("city","Dakar")
        db.execute("UPDATE users SET name=?,phone=?,city=? WHERE id=?",(name,phone,city,uid))
        db.commit(); session["user_name"]=name; flash("Profil mis à jour.","success")
        return redirect(url_for("dash.profile"))
    user = db.execute("SELECT * FROM users WHERE id=?",(uid,)).fetchone()
    return render_template("dashboard/profile.html", user=user)


@dash_bp.route("/notifications/read", methods=["POST"])
@login_required
def mark_read():
    db = get_db()
    db.execute("UPDATE notifications SET read=1 WHERE user_id=?",(session["user_id"],))
    db.commit(); return jsonify({"ok":True})


# ── COLLECTOR DASHBOARD ────────────────────────────────────────────────────────
@dash_bp.route("/collector")
@login_required
def collector():
    db = get_db(); uid = session["user_id"]
    user = db.execute("SELECT * FROM users WHERE id=?",(uid,)).fetchone()
    if user["role"] not in ("collector","admin"):
        flash("Accès réservé aux collecteurs.","error"); return redirect(url_for("dash.home"))

    # Get collector's assigned point
    cp_row = db.execute("""
        SELECT cp.* FROM collector_points cpx
        JOIN collection_points cp ON cpx.point_id=cp.id
        WHERE cpx.collector_id=?
    """, (uid,)).fetchone()

    # Pending deposits for this point only
    pending = []
    monthly_stats = None
    if cp_row:
        pending = db.execute("""
            SELECT d.*, u.name as citizen_name, u.phone as citizen_phone,
                   wt.name as waste_name, wt.color_hex, wt.icon, cp.name as point_name
            FROM deposits d JOIN users u ON d.user_id=u.id
            JOIN waste_types wt ON d.waste_type_id=wt.id
            JOIN collection_points cp ON d.point_id=cp.id
            WHERE d.status='pending' AND d.point_id=?
            ORDER BY d.created_at ASC
        """, (cp_row["id"],)).fetchall()

        # Monthly stats for this collector
        monthly_stats = db.execute("""
            SELECT strftime('%Y-%m',created_at) as month,
                   COUNT(*) as count,
                   COALESCE(SUM(weight_kg),0) as kg,
                   COALESCE(SUM(total_fcfa),0) as fcfa
            FROM deposits
            WHERE validated_by=? AND status='paid'
            GROUP BY month ORDER BY month DESC LIMIT 6
        """, (uid,)).fetchall()

    today = db.execute("""
        SELECT COUNT(*) as count, COALESCE(SUM(weight_kg),0) as kg,
               COALESCE(SUM(total_fcfa),0) as fcfa
        FROM deposits WHERE validated_by=? AND status='paid' AND date(validated_at)=date('now')
    """, (uid,)).fetchone()

    # Collector actions history
    actions = db.execute("""
        SELECT ca.*, d.qr_code, wt.name as waste_name
        FROM collector_actions ca
        LEFT JOIN deposits d ON ca.deposit_id=d.id
        LEFT JOIN waste_types wt ON d.waste_type_id=wt.id
        WHERE ca.collector_id=? ORDER BY ca.created_at DESC LIMIT 30
    """, (uid,)).fetchall()

    return render_template("dashboard/collector.html",
        user=user, cp=cp_row, pending=pending,
        monthly_stats=list(reversed(monthly_stats)) if monthly_stats else [],
        today=today, actions=actions)


@dash_bp.route("/validate/<int:dep_id>", methods=["POST"])
@login_required
def validate_deposit(dep_id):
    db = get_db(); uid = session["user_id"]
    user = db.execute("SELECT * FROM users WHERE id=?",(uid,)).fetchone()
    if user["role"] not in ("collector","admin"):
        return jsonify({"error":"forbidden"}),403

    # Check collector owns this deposit's point
    if user["role"] == "collector":
        cp_row = db.execute("SELECT point_id FROM collector_points WHERE collector_id=?",(uid,)).fetchone()
        if cp_row:
            dep_point = db.execute("SELECT point_id FROM deposits WHERE id=?",(dep_id,)).fetchone()
            if dep_point and dep_point["point_id"] != cp_row["point_id"]:
                flash("Ce dépôt n'appartient pas à votre point de collecte.","error")
                return redirect(url_for("dash.collector"))

    action = request.form.get("action","validate")
    dep = db.execute("SELECT * FROM deposits WHERE id=?",(dep_id,)).fetchone()
    if not dep: flash("Dépôt introuvable.","error"); return redirect(url_for("dash.collector"))

    if action == "validate":
        db.execute("UPDATE deposits SET status='paid',validated_at=datetime('now'),validated_by=? WHERE id=?", (uid,dep_id))
        pts = int(dep["weight_kg"]*10)
        db.execute("UPDATE users SET balance=balance+?,points=points+? WHERE id=?",
                   (dep["total_fcfa"],pts,dep["user_id"]))
        ref = generate_ref()
        db.execute("INSERT INTO transactions (user_id,deposit_id,amount,type,reference,description) VALUES(?,?,?,?,?,?)",
                   (dep["user_id"],dep_id,dep["total_fcfa"],"credit",ref,f"Depot valide {dep['qr_code']}"))
        db.execute("INSERT INTO notifications (user_id,title,message,type) VALUES(?,?,?,?)",
                   (dep["user_id"],"Paiement recu",f"{dep['total_fcfa']:.0f} FCFA credites. Ref:{ref}","success"))
        # Log collector action
        db.execute("INSERT INTO collector_actions (collector_id,deposit_id,action,point_id,amount_fcfa,weight_kg) VALUES(?,?,?,?,?,?)",
                   (uid,dep_id,"validated",dep["point_id"],dep["total_fcfa"],dep["weight_kg"]))
    else:
        db.execute("UPDATE deposits SET status='rejected' WHERE id=?", (dep_id,))
        db.execute("INSERT INTO notifications (user_id,title,message,type) VALUES(?,?,?,?)",
                   (dep["user_id"],"Depot refuse",f"Depot {dep['qr_code']} refuse.","warning"))
        db.execute("INSERT INTO collector_actions (collector_id,deposit_id,action,point_id) VALUES(?,?,?,?)",
                   (uid,dep_id,"rejected",dep["point_id"]))
    db.commit()
    flash("Depot traite.","success")
    return redirect(url_for("dash.collector"))
