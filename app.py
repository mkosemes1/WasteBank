"""
WasteBank — Plateforme de valorisation des déchets
Flask Application Factory
"""
import os
import sqlite3
from flask import Flask, g, session
from routes.auth import auth_bp
from routes.dashboard import dash_bp
from routes.admin import admin_bp
from routes.public import public_bp
from routes.api import api_bp
from routes.scan import scan_bp
from models.db import init_db

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("SECRET_KEY", "wastebank-dev-secret-2026")
    app.config["DATABASE"] = os.path.join(app.root_path, "wastebank.db")
    app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, "static", "uploads")
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Register blueprints
    app.register_blueprint(public_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(dash_bp, url_prefix="/dashboard")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(scan_bp, url_prefix="/scan")

    # DB lifecycle
    @app.teardown_appcontext
    def close_db(error):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    # Inject current user into all templates
    @app.context_processor
    def inject_user():
        user = None
        if "user_id" in session:
            from models.db import get_db
            db = get_db()
            user = db.execute(
                "SELECT * FROM users WHERE id = ?", (session["user_id"],)
            ).fetchone()
        return dict(current_user=user)

    with app.app_context():
        init_db()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
