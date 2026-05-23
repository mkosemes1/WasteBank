from flask import Blueprint, jsonify, request, session
from models.db import get_db

api_bp = Blueprint("api", __name__)


@api_bp.route("/prices")
def api_prices():
    db = get_db()
    wts = db.execute("SELECT id,name,price_fcfa,unit,icon,color_hex FROM waste_types WHERE active=1").fetchall()
    return jsonify([dict(w) for w in wts])


@api_bp.route("/points")
def api_points():
    db = get_db()
    pts = db.execute("SELECT id,name,address,city,lat,lng FROM collection_points WHERE active=1").fetchall()
    return jsonify([dict(p) for p in pts])


@api_bp.route("/stats")
def api_stats():
    db = get_db()
    s = db.execute("""
        SELECT
          (SELECT COUNT(*) FROM users WHERE role='citizen') as citizens,
          (SELECT COALESCE(SUM(weight_kg),0) FROM deposits WHERE status='paid') as kg_collected,
          (SELECT COALESCE(SUM(total_fcfa),0) FROM deposits WHERE status='paid') as fcfa_paid,
          (SELECT COUNT(*) FROM collection_points WHERE active=1) as points
    """).fetchone()
    return jsonify(dict(s))


@api_bp.route("/calculate", methods=["POST"])
def api_calculate():
    data = request.get_json() or {}
    db = get_db()
    wt_id = data.get("waste_type_id")
    weight = float(data.get("weight_kg", 0))
    wt = db.execute("SELECT price_fcfa FROM waste_types WHERE id=? AND active=1", (wt_id,)).fetchone()
    if not wt:
        return jsonify({"error": "invalid waste type"}), 400
    total = round(weight * wt["price_fcfa"], 2)
    return jsonify({"total_fcfa": total, "price_per_kg": wt["price_fcfa"], "weight_kg": weight})
