"""
WasteBank — Agent Route
Page dédiée aux agents aux points de collecte pour scanner les QR codes
et valider les dépôts avec versement instantané au portefeuille citoyen.
Accessible via lien sécurisé : /agent/<token>
"""
import secrets, hashlib
from flask import (Blueprint, render_template, request, jsonify,
                   session, redirect, url_for, flash)
from models.db import get_db, generate_ref
from routes.auth import login_required

agent_bp = Blueprint("agent", __name__)


def _get_agent_token(point_id: int) -> str:
    """Génère un token stable par point de collecte (basé sur son ID + clé secrète)."""
    from flask import current_app
    secret = current_app.secret_key
    raw = f"agent-{point_id}-{secret}"
    return hashlib.sha256(raw.encode()).hexdigest()[:24]


# ── Page scanner QR agent (accès via lien ou session) ─────────────────────
@agent_bp.route("/scan")
@login_required
def scan_page():
    db = get_db()
    uid = session["user_id"]
    user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    if user["role"] not in ("collector", "admin"):
        flash("Accès réservé aux agents collecteurs.", "error")
        return redirect(url_for("dash.home"))

    points = db.execute(
        "SELECT * FROM collection_points WHERE active=1 ORDER BY city, name"
    ).fetchall()

    # Générer les liens par point
    point_links = []
    for p in points:
        token = _get_agent_token(p["id"])
        point_links.append({
            "id":      p["id"],
            "name":    p["name"],
            "city":    p["city"],
            "address": p["address"],
            "token":   token,
            "url":     url_for("agent.agent_portal", token=token, _external=True),
        })

    return render_template("agent/scan_page.html", point_links=point_links, user=user)


# ── Portail agent (lien direct, pas besoin d'être connecté) ───────────────
@agent_bp.route("/portal/<token>")
def agent_portal(token):
    """
    Page accessible via lien sécurisé envoyé à l'agent.
    L'agent n'a pas besoin de compte — il scanne et valide.
    """
    db = get_db()
    # Trouver le point correspondant au token
    points = db.execute("SELECT * FROM collection_points WHERE active=1").fetchall()
    point = None
    for p in points:
        if _get_agent_token(p["id"]) == token:
            point = p
            break

    if not point:
        return render_template("agent/invalid.html"), 403

    # Stats du jour pour ce point
    stats = db.execute("""
        SELECT COUNT(*) as count,
               COALESCE(SUM(weight_kg),0) as kg,
               COALESCE(SUM(total_fcfa),0) as fcfa
        FROM deposits
        WHERE point_id=? AND status='paid' AND date(validated_at)=date('now')
    """, (point["id"],)).fetchone()

    return render_template("agent/portal.html",
                           point=point, token=token, stats=stats)


# ── API : Chercher un dépôt par QR code ───────────────────────────────────
@agent_bp.route("/lookup", methods=["POST"])
def lookup():
    data  = request.get_json() or {}
    qr    = (data.get("qr") or "").strip().upper()
    token = data.get("token", "")

    if not qr:
        return jsonify({"error": "QR code vide"}), 400

    # Vérifier le token du portail
    db = get_db()
    points = db.execute("SELECT * FROM collection_points WHERE active=1").fetchall()
    point = None
    for p in points:
        if _get_agent_token(p["id"]) == token:
            point = p
            break

    if not point:
        return jsonify({"error": "Portail non autorisé"}), 403

    dep = db.execute("""
        SELECT d.*,
               u.name  as citizen_name,
               u.phone as citizen_phone,
               u.balance as citizen_balance,
               wt.name  as waste_name,
               wt.icon  as waste_icon,
               wt.color_hex,
               cp.name  as point_name
        FROM   deposits d
        JOIN   users u  ON d.user_id = u.id
        JOIN   waste_types wt ON d.waste_type_id = wt.id
        JOIN   collection_points cp ON d.point_id = cp.id
        WHERE  d.qr_code = ?
    """, (qr,)).fetchone()

    if not dep:
        return jsonify({"error": f"Aucun dépôt trouvé pour le code « {qr} »"}), 404

    if dep["status"] == "paid":
        return jsonify({"error": "Ce dépôt a déjà été payé.", "already_paid": True}), 409

    if dep["status"] == "rejected":
        return jsonify({"error": "Ce dépôt a été refusé."}), 409

    return jsonify({
        "deposit_id":      dep["id"],
        "qr_code":         dep["qr_code"],
        "citizen_name":    dep["citizen_name"],
        "citizen_phone":   dep["citizen_phone"],
        "waste_name":      dep["waste_name"],
        "waste_icon":      dep["waste_icon"],
        "color_hex":       dep["color_hex"],
        "weight_kg":       dep["weight_kg"],
        "price_per_kg":    dep["price_per_kg"],
        "total_fcfa":      dep["total_fcfa"],
        "point_name":      dep["point_name"],
        "created_at":      dep["created_at"][:16],
        "notes":           dep["notes"] or "",
    })


# ── API : Valider le dépôt et créditer le portefeuille ────────────────────
@agent_bp.route("/validate", methods=["POST"])
def validate():
    data       = request.get_json() or {}
    deposit_id = data.get("deposit_id")
    token      = data.get("token", "")
    action     = data.get("action", "validate")   # validate | reject

    if not deposit_id:
        return jsonify({"error": "Données manquantes"}), 400

    db = get_db()

    # Vérifier token
    points = db.execute("SELECT * FROM collection_points WHERE active=1").fetchall()
    point = None
    for p in points:
        if _get_agent_token(p["id"]) == token:
            point = p
            break
    if not point:
        return jsonify({"error": "Portail non autorisé"}), 403

    dep = db.execute("SELECT * FROM deposits WHERE id=?", (deposit_id,)).fetchone()
    if not dep:
        return jsonify({"error": "Dépôt introuvable"}), 404
    if dep["status"] in ("paid", "rejected"):
        return jsonify({"error": "Dépôt déjà traité"}), 409

    if action == "validate":
        # ── VALIDER ET CRÉDITER ─────────────────────────────────────────
        db.execute("""
            UPDATE deposits
            SET status='paid', validated_at=datetime('now')
            WHERE id=?
        """, (dep["id"],))

        # Crédit portefeuille + points éco
        points_earned = int(dep["weight_kg"] * 10)
        db.execute("""
            UPDATE users
            SET balance = balance + ?,
                points  = points  + ?
            WHERE id = ?
        """, (dep["total_fcfa"], points_earned, dep["user_id"]))

        # Transaction
        ref = generate_ref()
        db.execute("""
            INSERT INTO transactions
              (user_id, deposit_id, amount, type, reference, description)
            VALUES (?,?,?,?,?,?)
        """, (dep["user_id"], dep["id"], dep["total_fcfa"], "credit", ref,
              f"Dépôt validé — {dep['qr_code']}"))

        # Notification citoyen
        db.execute("""
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?,?,?,?)
        """, (dep["user_id"],
              "💰 Paiement reçu !",
              f"{dep['total_fcfa']:.0f} FCFA crédités pour {dep['weight_kg']}kg. Réf: {ref}",
              "success"))
        db.commit()

        # Récupérer nouveau solde
        user = db.execute("SELECT balance FROM users WHERE id=?", (dep["user_id"],)).fetchone()

        return jsonify({
            "ok":           True,
            "action":       "paid",
            "total_fcfa":   dep["total_fcfa"],
            "new_balance":  user["balance"],
            "points_earned":points_earned,
            "reference":    ref,
        })

    else:
        # ── REJETER ────────────────────────────────────────────────────
        db.execute("UPDATE deposits SET status='rejected' WHERE id=?", (dep["id"],))
        db.execute("""
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?,?,?,?)
        """, (dep["user_id"],
              "Dépôt refusé",
              f"Dépôt {dep['qr_code']} refusé par le point de collecte {point['name']}.",
              "warning"))
        db.commit()
        return jsonify({"ok": True, "action": "rejected"})
