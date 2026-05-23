"""
WasteBank — Scan & Identify Routes
Flux complet : scan QR produit → identification IA → dépôt → QR reçu
"""
import os
import secrets
import base64
from flask import (Blueprint, render_template, request, redirect,
                   url_for, session, flash, jsonify)
from models.db import get_db, generate_ref
from routes.auth import login_required
from utils.qr_generator import (
    generate_qr_b64, save_qr_to_file,
    identify_waste_from_image, decode_qr_from_bytes
)

scan_bp = Blueprint("scan", __name__)


# ── ÉTAPE 1 : Page principale scan ──────────────────────────────────────────
@scan_bp.route("/")
@login_required
def scan_home():
    """Hub central — choisir entre scan QR produit ou photo IA."""
    db = get_db()
    collection_points = db.execute(
        "SELECT * FROM collection_points WHERE active=1 ORDER BY city, name"
    ).fetchall()
    return render_template("scan/scan_home.html",
                           collection_points=collection_points)


# ── ÉTAPE 2A : Identifier par photo IA ──────────────────────────────────────
@scan_bp.route("/identify", methods=["POST"])
@login_required
def identify():
    """
    Reçoit une image (caméra ou upload), identifie le type de déchet via IA
    et retourne le résultat + prix en JSON.
    """
    image_data = None

    # Source 1 : base64 depuis JS (caméra)
    if request.is_json:
        data = request.get_json()
        b64 = data.get("image_b64", "")
        if b64:
            # Nettoyer le header data URI
            if "," in b64:
                b64 = b64.split(",")[1]
            image_data = base64.b64decode(b64)

    # Source 2 : fichier uploadé
    elif "photo" in request.files:
        f = request.files["photo"]
        image_data = f.read()

    if not image_data:
        return jsonify({"error": "Aucune image reçue"}), 400

    result = identify_waste_from_image(image_data)

    # Enrichir avec le prix depuis la DB
    db = get_db()
    wt = db.execute(
        "SELECT * FROM waste_types WHERE id=? AND active=1",
        (result["waste_type_id"],)
    ).fetchone()

    if wt:
        result["price_fcfa"] = wt["price_fcfa"]
        result["unit"]       = wt["unit"]
        result["icon"]       = wt["icon"]
    else:
        result["price_fcfa"] = 120.0
        result["unit"]       = "kg"
        result["icon"]       = "♻️"

    return jsonify(result)


# ── ÉTAPE 2B : Décoder un QR code produit ───────────────────────────────────
@scan_bp.route("/decode-qr", methods=["POST"])
@login_required
def decode_qr():
    """
    Reçoit une image contenant un QR code WasteBank Produit,
    décode les infos et retourne le type de déchet pré-rempli.
    """
    image_data = None

    if request.is_json:
        b64 = request.get_json().get("image_b64", "")
        if "," in b64:
            b64 = b64.split(",")[1]
        try:
            image_data = base64.b64decode(b64)
        except Exception:
            return jsonify({"error": "Image invalide"}), 400
    elif "photo" in request.files:
        image_data = request.files["photo"].read()

    if not image_data:
        return jsonify({"error": "Aucune image"}), 400

    qr_data = decode_qr_from_bytes(image_data)
    if not qr_data:
        return jsonify({"error": "Aucun QR WasteBank détecté. Essayez la photo IA."}), 404

    # Format QR produit : WB-PROD-{type_id}-{sku}
    # Ex: WB-PROD-1-BOTTLE500ML
    parts = qr_data.split("-")
    waste_type_id = parts[2] if len(parts) >= 3 else "1"

    db = get_db()
    wt = db.execute(
        "SELECT * FROM waste_types WHERE id=? AND active=1", (waste_type_id,)
    ).fetchone()

    if not wt:
        return jsonify({"error": f"Type de déchet inconnu: {waste_type_id}"}), 404

    return jsonify({
        "waste_type_id": str(wt["id"]),
        "waste_name":    wt["name"],
        "color_hex":     wt["color_hex"],
        "icon":          wt["icon"],
        "price_fcfa":    wt["price_fcfa"],
        "unit":          wt["unit"],
        "confidence":    99,
        "method":        "qr_scan",
        "qr_raw":        qr_data,
    })


# ── ÉTAPE 3 : Confirmer le dépôt ────────────────────────────────────────────
@scan_bp.route("/confirm", methods=["GET", "POST"])
@login_required
def confirm():
    """
    Page de confirmation avec poids + point de collecte.
    Reçoit waste_type_id et confidence depuis l'étape précédente.
    """
    db = get_db()
    uid = session["user_id"]

    if request.method == "POST":
        waste_type_id = request.form.get("waste_type_id")
        point_id      = request.form.get("point_id")
        weight_kg_str = request.form.get("weight_kg", "0")
        notes         = request.form.get("notes", "")

        # Validation
        try:
            weight_kg = float(weight_kg_str)
            if weight_kg <= 0:
                raise ValueError
        except ValueError:
            flash("Poids invalide — entrez un nombre positif.", "error")
            return redirect(url_for("scan.confirm"))

        wt = db.execute(
            "SELECT * FROM waste_types WHERE id=? AND active=1", (waste_type_id,)
        ).fetchone()
        cp = db.execute(
            "SELECT * FROM collection_points WHERE id=? AND active=1", (point_id,)
        ).fetchone()

        if not wt or not cp:
            flash("Données invalides.", "error")
            return redirect(url_for("scan.scan_home"))

        price_per_kg = wt["price_fcfa"]
        total        = round(weight_kg * price_per_kg, 2)
        qr_code      = "WB-DEP-" + secrets.token_hex(6).upper()

        # Enregistrer le dépôt
        db.execute("""
            INSERT INTO deposits
              (user_id, point_id, waste_type_id, weight_kg,
               price_per_kg, total_fcfa, qr_code, notes)
            VALUES (?,?,?,?,?,?,?,?)
        """, (uid, point_id, waste_type_id, weight_kg,
              price_per_kg, total, qr_code, notes))

        # Notification
        db.execute("""
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?,?,?,?)
        """, (uid,
              "📦 Dépôt enregistré",
              f"{weight_kg}kg de {wt['name']} — {total:.0f} FCFA en attente. Réf: {qr_code}",
              "info"))
        db.commit()

        # Générer et sauvegarder le QR code image
        upload_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), "static", "uploads"
        )
        os.makedirs(upload_dir, exist_ok=True)
        save_qr_to_file(qr_code, wt["name"], wt["color_hex"],
                        weight_kg, total, upload_dir)

        flash(f"Dépôt enregistré ! Ref: {qr_code}", "success")
        return redirect(url_for("scan.receipt", qr=qr_code))

    # GET : pré-remplissage depuis query params
    waste_type_id = request.args.get("waste_type_id", "1")
    waste_name    = request.args.get("waste_name", "")
    confidence    = request.args.get("confidence", "0")
    method        = request.args.get("method", "")

    waste_types = db.execute("SELECT * FROM waste_types WHERE active=1").fetchall()
    collection_points = db.execute(
        "SELECT * FROM collection_points WHERE active=1 ORDER BY city, name"
    ).fetchall()
    wt = db.execute("SELECT * FROM waste_types WHERE id=?", (waste_type_id,)).fetchone()

    return render_template("scan/confirm.html",
        waste_types=waste_types,
        collection_points=collection_points,
        prefill_id=waste_type_id,
        prefill_name=waste_name,
        prefill_confidence=confidence,
        prefill_method=method,
        prefill_wt=wt,
    )


# ── ÉTAPE 4 : Reçu avec QR code ─────────────────────────────────────────────
@scan_bp.route("/receipt/<qr>")
@login_required
def receipt(qr):
    """Page de reçu avec QR code à présenter au collecteur."""
    db = get_db()
    uid = session["user_id"]

    dep = db.execute("""
        SELECT d.*,
               wt.name as waste_name, wt.color_hex, wt.icon, wt.unit,
               cp.name as point_name, cp.address, cp.city
        FROM   deposits d
        JOIN   waste_types wt ON d.waste_type_id = wt.id
        JOIN   collection_points cp ON d.point_id = cp.id
        WHERE  d.qr_code = ? AND d.user_id = ?
    """, (qr, uid)).fetchone()

    if not dep:
        flash("Dépôt introuvable.", "error")
        return redirect(url_for("dash.home"))

    # Générer le QR en base64 pour l'affichage inline
    qr_b64 = generate_qr_b64(
        qr, dep["waste_name"], dep["color_hex"],
        dep["weight_kg"], dep["total_fcfa"]
    )

    return render_template("scan/receipt.html", dep=dep, qr_b64=qr_b64)


# ── API : prix instantané pour un type ─────────────────────────────────────
@scan_bp.route("/price/<int:wt_id>")
def price_for_type(wt_id):
    db = get_db()
    wt = db.execute(
        "SELECT id, name, price_fcfa, unit, icon, color_hex FROM waste_types WHERE id=? AND active=1",
        (wt_id,)
    ).fetchone()
    if not wt:
        return jsonify({"error": "not found"}), 404
    return jsonify(dict(wt))
