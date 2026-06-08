"""WasteBank — Routes API IA étendue"""
from flask import Blueprint, jsonify, request, session
from models.db import get_db
from routes.auth import login_required
from utils.ai_engine import (
    suggest_dynamic_price, suggest_all_prices,
    detect_deposit_anomaly, predict_monthly_collection,
    compute_citizen_score, suggest_nearest_point, AI_MODULES
)

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/modules")
def modules():
    return jsonify(AI_MODULES)

@ai_bp.route("/prices/dynamic")
def dynamic_prices():
    db = get_db()
    return jsonify(suggest_all_prices(db))

@ai_bp.route("/prices/dynamic/<int:wt_id>")
def dynamic_price_one(wt_id):
    db = get_db()
    vol = float(request.args.get("volume_today", 0))
    return jsonify(suggest_dynamic_price(wt_id, db, vol))

@ai_bp.route("/anomaly/check", methods=["POST"])
@login_required
def check_anomaly():
    data = request.get_json() or {}
    db = get_db()
    uid = data.get("user_id") or session["user_id"]
    r = detect_deposit_anomaly(
        float(data.get("weight_kg", 0)),
        int(data.get("waste_type_id", 1)),
        int(uid), db
    )
    return jsonify(r)

@ai_bp.route("/predict/monthly")
@login_required
def predict_monthly():
    db = get_db()
    point_id = request.args.get("point_id")
    r = predict_monthly_collection(db, int(point_id) if point_id else None)
    return jsonify(r)

@ai_bp.route("/citizen/score")
@login_required
def citizen_score():
    db = get_db()
    uid = request.args.get("user_id") or session["user_id"]
    return jsonify(compute_citizen_score(int(uid), db))

@ai_bp.route("/points/suggest")
def suggest_points():
    db = get_db()
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    wt  = request.args.get("waste_type_id", type=int)
    return jsonify(suggest_nearest_point(lat, lng, db, wt))
