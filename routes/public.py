from flask import Blueprint, render_template, jsonify
from models.db import get_db

public_bp = Blueprint("public", __name__)


@public_bp.route("/")
def index():
    db = get_db()
    waste_types = db.execute("SELECT * FROM waste_types WHERE active=1").fetchall()
    points = db.execute("SELECT * FROM collection_points WHERE active=1").fetchall()
    stats = db.execute("""
        SELECT
          (SELECT COUNT(*) FROM users WHERE role='citizen') as citizens,
          (SELECT COALESCE(SUM(weight_kg),0) FROM deposits WHERE status='paid') as kg_collected,
          (SELECT COALESCE(SUM(total_fcfa),0) FROM deposits WHERE status='paid') as fcfa_paid,
          (SELECT COUNT(*) FROM collection_points WHERE active=1) as points
    """).fetchone()
    return render_template("public/index.html",
        waste_types=waste_types, points=points, stats=stats)


@public_bp.route("/how-it-works")
def how_it_works():
    return render_template("public/how_it_works.html")


@public_bp.route("/points")
def points_map():
    db = get_db()
    points = db.execute("SELECT * FROM collection_points WHERE active=1 ORDER BY city").fetchall()
    return render_template("public/points.html", points=points)


@public_bp.route("/prices")
def prices():
    db = get_db()
    waste_types = db.execute("SELECT * FROM waste_types WHERE active=1 ORDER BY price_fcfa DESC").fetchall()
    return render_template("public/prices.html", waste_types=waste_types)
