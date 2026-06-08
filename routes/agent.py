"""
WasteBank Agent Routes v2
- QR verification with WasteBank authenticity check
- Live validation with wallet credit
"""
import hashlib, secrets
from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, flash
from models.db import get_db, generate_ref
from routes.auth import login_required
from utils.qr_generator import decode_and_verify_qr

agent_bp = Blueprint("agent", __name__)

def _get_token(point_id):
    from flask import current_app
    return hashlib.sha256(f"agent-{point_id}-{current_app.secret_key}".encode()).hexdigest()[:24]

@agent_bp.route("/scan")
@login_required
def scan_page():
    db = get_db(); uid = session["user_id"]
    user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    if user["role"] not in ("collector","admin"):
        flash("Accès réservé aux agents collecteurs.", "error")
        return redirect(url_for("dash.home"))
    points = db.execute("SELECT * FROM collection_points WHERE active=1 ORDER BY city,name").fetchall()
    links = [{"id":p["id"],"name":p["name"],"city":p["city"],"address":p["address"],
               "token":_get_token(p["id"]),
               "url":url_for("agent.portal",token=_get_token(p["id"]),_external=True)}
             for p in points]
    return render_template("agent/scan_page.html", point_links=links, user=user)

@agent_bp.route("/portal/<token>")
def portal(token):
    db = get_db()
    points = db.execute("SELECT * FROM collection_points WHERE active=1").fetchall()
    point = next((p for p in points if _get_token(p["id"]) == token), None)
    if not point:
        return render_template("agent/invalid.html"), 403
    stats = db.execute("""
        SELECT COUNT(*) as count, COALESCE(SUM(weight_kg),0) as kg,
               COALESCE(SUM(total_fcfa),0) as fcfa
        FROM deposits WHERE point_id=? AND status='paid' AND date(validated_at)=date('now')
    """, (point["id"],)).fetchone()
    return render_template("agent/portal.html", point=point, token=token, stats=stats)

@agent_bp.route("/lookup", methods=["POST"])
def lookup():
    data = request.get_json() or {}
    token = data.get("token","")
    image_b64 = data.get("image_b64","")
    qr_manual = (data.get("qr","") or "").strip().upper()

    db = get_db()
    # Verify portal token
    points = db.execute("SELECT * FROM collection_points WHERE active=1").fetchall()
    point = next((p for p in points if _get_token(p["id"]) == token), None)
    if not point:
        return jsonify({"error":"Portail non autorisé"}), 403

    # Determine QR code to look up
    qr_code = None
    verification_method = "manual"

    if image_b64:
        import base64
        try:
            raw_bytes = base64.b64decode(image_b64.split(",")[1] if "," in image_b64 else image_b64)
            result = decode_and_verify_qr(raw_bytes)
            if not result["found"]:
                return jsonify({"error": "Aucun QR code détecté dans l'image. Essayez de vous rapprocher ou utilisez la saisie manuelle."}), 404
            if not result["valid_wastebank"]:
                return jsonify({
                    "error": f"QR code non reconnu par WasteBank. Ce code ne provient pas de notre plateforme.",
                    "raw": result.get("raw_data",""),
                    "not_wastebank": True
                }), 422
            qr_code = result["qr_code"]
            verification_method = "camera_scan"
        except Exception as e:
            return jsonify({"error": f"Erreur traitement image: {str(e)}"}), 400
    elif qr_manual:
        from utils.qr_generator import WB_DEP_PREFIX
        if not qr_manual.startswith(WB_DEP_PREFIX):
            return jsonify({
                "error": f"Code invalide. Les références WasteBank commencent par WB-DEP-",
                "not_wastebank": True
            }), 422
        qr_code = qr_manual
        verification_method = "manual"
    else:
        return jsonify({"error": "Fournissez une image ou un code manuel"}), 400

    dep = db.execute("""
        SELECT d.*, u.name as citizen_name, u.phone as citizen_phone, u.balance as citizen_balance,
               wt.name as waste_name, wt.icon as waste_icon, wt.color_hex,
               cp.name as point_name
        FROM deposits d JOIN users u ON d.user_id=u.id
        JOIN waste_types wt ON d.waste_type_id=wt.id
        JOIN collection_points cp ON d.point_id=cp.id
        WHERE d.qr_code=?
    """, (qr_code,)).fetchone()

    if not dep:
        return jsonify({"error": f"Aucun dépôt trouvé pour le code « {qr_code} »"}), 404
    if dep["status"] == "paid":
        return jsonify({"error": "Ce dépôt a déjà été payé.", "already_paid": True}), 409
    if dep["status"] == "rejected":
        return jsonify({"error": "Ce dépôt a été refusé."}), 409

    return jsonify({
        "deposit_id":   dep["id"],
        "qr_code":      dep["qr_code"],
        "citizen_name": dep["citizen_name"],
        "citizen_phone":dep["citizen_phone"],
        "waste_name":   dep["waste_name"],
        "waste_icon":   dep["waste_icon"],
        "color_hex":    dep["color_hex"],
        "weight_kg":    dep["weight_kg"],
        "price_per_kg": dep["price_per_kg"],
        "total_fcfa":   dep["total_fcfa"],
        "point_name":   dep["point_name"],
        "created_at":   dep["created_at"][:16],
        "notes":        dep["notes"] or "",
        "verification_method": verification_method,
        "wastebank_verified": True,
    })

@agent_bp.route("/validate", methods=["POST"])
def validate():
    data = request.get_json() or {}
    deposit_id = data.get("deposit_id")
    token = data.get("token","")
    action = data.get("action","validate")

    if not deposit_id:
        return jsonify({"error":"Données manquantes"}), 400

    db = get_db()
    points = db.execute("SELECT * FROM collection_points WHERE active=1").fetchall()
    point = next((p for p in points if _get_token(p["id"]) == token), None)
    if not point:
        return jsonify({"error":"Portail non autorisé"}), 403

    dep = db.execute("SELECT * FROM deposits WHERE id=?", (deposit_id,)).fetchone()
    if not dep:
        return jsonify({"error":"Dépôt introuvable"}), 404
    if dep["status"] in ("paid","rejected"):
        return jsonify({"error":"Dépôt déjà traité"}), 409

    if action == "validate":
        db.execute("UPDATE deposits SET status='paid',validated_at=datetime('now') WHERE id=?", (dep["id"],))
        pts = int(dep["weight_kg"]*10)
        db.execute("UPDATE users SET balance=balance+?,points=points+? WHERE id=?",
                   (dep["total_fcfa"],pts,dep["user_id"]))
        ref = generate_ref()
        db.execute("INSERT INTO transactions (user_id,deposit_id,amount,type,reference,description) VALUES(?,?,?,?,?,?)",
                   (dep["user_id"],dep["id"],dep["total_fcfa"],"credit",ref,f"Depot valide {dep['qr_code']}"))
        db.execute("INSERT INTO notifications (user_id,title,message,type) VALUES(?,?,?,?)",
                   (dep["user_id"],"Paiement recu",f"{dep['total_fcfa']:.0f} FCFA credites. Ref:{ref}","success"))
        # Log as collector action (agent portal = anonymous collector, use point manager or 0)
        try:
            manager = db.execute("SELECT manager_id FROM collection_points WHERE id=?", (point["id"],)).fetchone()
            actor_id = manager["manager_id"] if manager and manager["manager_id"] else 1
            db.execute("INSERT INTO collector_actions (collector_id,deposit_id,action,point_id,amount_fcfa,weight_kg) VALUES(?,?,?,?,?,?)",
                       (actor_id,dep["id"],"validated_agent",point["id"],dep["total_fcfa"],dep["weight_kg"]))
        except Exception:
            pass
        db.commit()
        user = db.execute("SELECT balance FROM users WHERE id=?", (dep["user_id"],)).fetchone()
        return jsonify({"ok":True,"action":"paid","total_fcfa":dep["total_fcfa"],
                        "new_balance":user["balance"],"points_earned":pts,"reference":ref})
    else:
        db.execute("UPDATE deposits SET status='rejected' WHERE id=?", (dep["id"],))
        db.execute("INSERT INTO notifications (user_id,title,message,type) VALUES(?,?,?,?)",
                   (dep["user_id"],"Depot refuse",f"Depot {dep['qr_code']} refuse.","warning"))
        db.commit()
        return jsonify({"ok":True,"action":"rejected"})

@agent_bp.route("/price/<int:wt_id>")
def price_for_type(wt_id):
    db = get_db()
    wt = db.execute("SELECT * FROM waste_types WHERE id=? AND active=1", (wt_id,)).fetchone()
    if not wt: return jsonify({"error":"not found"}),404
    return jsonify(dict(wt))


# ── Direct agent portal for collector (no link needed) ─────────────────────────
@agent_bp.route("/direct")
@login_required
def agent_direct():
    """
    Portail agent directement accessible depuis la sidebar collecteur.
    Redirige vers le portail du point de collecte assigné au collecteur connecté.
    """
    db = get_db()
    uid = session["user_id"]
    user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()

    if user["role"] not in ("collector", "admin"):
        flash("Accès réservé aux collecteurs.", "error")
        return redirect(url_for("dash.home"))

    # Trouver le point assigné
    cp_row = db.execute("""
        SELECT cp.* FROM collector_points cpx
        JOIN collection_points cp ON cpx.point_id = cp.id
        WHERE cpx.collector_id = ?
    """, (uid,)).fetchone()

    if not cp_row:
        flash("Aucun point de collecte assigné. Contactez l'administrateur.", "warning")
        return redirect(url_for("dash.collector"))

    # Générer le token pour ce point et rendre la page directement
    token = _get_token(cp_row["id"])
    stats = db.execute("""
        SELECT COUNT(*) as count, COALESCE(SUM(weight_kg),0) as kg,
               COALESCE(SUM(total_fcfa),0) as fcfa
        FROM deposits
        WHERE point_id=? AND status='paid' AND date(validated_at)=date('now')
    """, (cp_row["id"],)).fetchone()

    # Render portal directly without needing a link
    return render_template("agent/portal.html",
                           point=cp_row, token=token, stats=stats,
                           embedded=True)
