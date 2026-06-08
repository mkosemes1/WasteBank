"""
WasteBank Scan Routes v2
- No point_id selection (auto from collector/nearest)
- Citizens see available points info only
"""
import os, secrets, base64
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from models.db import get_db, generate_ref
from routes.auth import login_required
from utils.qr_generator import classify_waste, generate_qr_b64, save_qr_to_file, decode_and_verify_qr

scan_bp = Blueprint("scan", __name__)

@scan_bp.route("/")
@login_required
def scan_home():
    db = get_db()
    collection_points = db.execute("SELECT * FROM collection_points WHERE active=1 ORDER BY city,name").fetchall()
    return render_template("scan/scan_home.html", collection_points=collection_points)

@scan_bp.route("/identify", methods=["POST"])
@login_required
def identify():
    image_data = None
    if request.is_json:
        b64 = request.get_json().get("image_b64","")
        if b64:
            if "," in b64: b64 = b64.split(",")[1]
            try: image_data = base64.b64decode(b64)
            except: return jsonify({"error":"Image invalide"}),400
    elif "photo" in request.files:
        image_data = request.files["photo"].read()
    if not image_data:
        return jsonify({"error":"Aucune image reçue"}),400

    result = classify_waste(image_data)
    # Normalize key
    if "name" in result and "waste_name" not in result:
        result["waste_name"] = result["name"]

    # Enrich with DB price
    db = get_db()
    wt = db.execute("SELECT * FROM waste_types WHERE id=? AND active=1", (result["waste_type_id"],)).fetchone()
    if wt:
        result["price_fcfa"] = wt["price_fcfa"]
        result["unit"]       = wt["unit"]
        result["icon"]       = wt["icon"]
        result["waste_type_id"] = str(wt["id"])
    return jsonify(result)

@scan_bp.route("/confirm", methods=["GET","POST"])
@login_required
def confirm():
    db = get_db(); uid = session["user_id"]

    if request.method == "POST":
        waste_type_id = request.form.get("waste_type_id")
        weight_kg_str = request.form.get("weight_kg","0")
        notes         = request.form.get("notes","")

        try:
            weight_kg = float(weight_kg_str)
            if weight_kg <= 0: raise ValueError
        except ValueError:
            flash("Poids invalide.", "error")
            return redirect(url_for("scan.confirm"))

        wt = db.execute("SELECT * FROM waste_types WHERE id=? AND active=1", (waste_type_id,)).fetchone()
        if not wt:
            flash("Type de déchet invalide.", "error")
            return redirect(url_for("scan.confirm"))

        # Auto-select nearest point (first active one for now; real impl = geoloc)
        # Citizen picks from visible list but stored, not required for deposit flow
        point_id = request.form.get("point_id") or None
        if not point_id:
            cp = db.execute("SELECT id FROM collection_points WHERE active=1 LIMIT 1").fetchone()
            point_id = cp["id"] if cp else 1

        total    = round(weight_kg * wt["price_fcfa"], 2)
        qr_code  = "WB-DEP-" + secrets.token_hex(6).upper()
        ai_method = request.form.get("ai_method","")
        ai_conf   = request.form.get("ai_confidence","0")

        db.execute("""
            INSERT INTO deposits (user_id,point_id,waste_type_id,weight_kg,price_per_kg,
                                  total_fcfa,qr_code,notes,ai_method,ai_confidence)
            VALUES (?,?,?,?,?,?,?,?,?,?)
        """, (uid,point_id,waste_type_id,weight_kg,wt["price_fcfa"],total,qr_code,notes,ai_method,ai_conf))
        db.execute("INSERT INTO notifications (user_id,title,message,type) VALUES(?,?,?,?)",
                   (uid,"Depot enregistre",f"{weight_kg}kg de {wt['name']} — {total:.0f} FCFA en attente. Ref:{qr_code}","info"))
        db.commit()

        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)),"static","uploads")
        os.makedirs(upload_dir,exist_ok=True)
        save_qr_to_file(qr_code,wt["name"],wt["color_hex"],weight_kg,total,upload_dir)

        flash(f"Depot enregistre! Ref: {qr_code}","success")
        return redirect(url_for("scan.receipt", qr=qr_code))

    # GET
    waste_type_id = request.args.get("waste_type_id","1")
    waste_types   = db.execute("SELECT * FROM waste_types WHERE active=1").fetchall()
    # Points shown for info, not required as form field
    collection_points = db.execute("SELECT * FROM collection_points WHERE active=1 ORDER BY city,name").fetchall()
    wt = db.execute("SELECT * FROM waste_types WHERE id=?", (waste_type_id,)).fetchone()

    return render_template("scan/confirm.html",
        waste_types=waste_types,
        collection_points=collection_points,
        prefill_id=waste_type_id,
        prefill_name=request.args.get("waste_name",""),
        prefill_confidence=request.args.get("confidence","0"),
        prefill_method=request.args.get("method",""),
        prefill_wt=wt)

@scan_bp.route("/receipt/<qr>")
@login_required
def receipt(qr):
    db = get_db(); uid = session["user_id"]
    dep = db.execute("""
        SELECT d.*, wt.name as waste_name, wt.color_hex, wt.icon, wt.unit,
               cp.name as point_name, cp.address, cp.city
        FROM deposits d JOIN waste_types wt ON d.waste_type_id=wt.id
        JOIN collection_points cp ON d.point_id=cp.id
        WHERE d.qr_code=? AND d.user_id=?
    """, (qr,uid)).fetchone()
    if not dep:
        flash("Depot introuvable.","error"); return redirect(url_for("dash.home"))
    qr_b64 = generate_qr_b64(qr,dep["waste_name"],dep["color_hex"],dep["weight_kg"],dep["total_fcfa"])
    return render_template("scan/receipt.html", dep=dep, qr_b64=qr_b64)

@scan_bp.route("/price/<int:wt_id>")
def price_for_type(wt_id):
    db = get_db()
    wt = db.execute("SELECT * FROM waste_types WHERE id=? AND active=1",(wt_id,)).fetchone()
    if not wt: return jsonify({"error":"not found"}),404
    return jsonify(dict(wt))
