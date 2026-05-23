from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from models.db import get_db, hash_password, check_password

auth_bp = Blueprint("auth", __name__)


def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            flash("Connectez-vous pour accéder à cette page.", "warning")
            return redirect(url_for("auth.login"))
        return f(*args, **kwargs)
    return decorated


def role_required(*roles):
    from functools import wraps
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if "user_id" not in session:
                return redirect(url_for("auth.login"))
            db = get_db()
            user = db.execute("SELECT role FROM users WHERE id=?", (session["user_id"],)).fetchone()
            if not user or user["role"] not in roles:
                flash("Accès non autorisé.", "error")
                return redirect(url_for("dash.home"))
            return f(*args, **kwargs)
        return decorated
    return decorator


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if "user_id" in session:
        return redirect(url_for("dash.home"))
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        db = get_db()
        user = db.execute("SELECT * FROM users WHERE email=? AND active=1", (email,)).fetchone()
        if user and check_password(password, user["password"]):
            session["user_id"] = user["id"]
            session["user_role"] = user["role"]
            session["user_name"] = user["name"]
            flash(f"Bienvenue, {user['name']} !", "success")
            if user["role"] == "admin":
                return redirect(url_for("admin.dashboard"))
            return redirect(url_for("dash.home"))
        flash("Email ou mot de passe incorrect.", "error")
    return render_template("auth/login.html")


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name     = request.form.get("name", "").strip()
        email    = request.form.get("email", "").strip().lower()
        phone    = request.form.get("phone", "").strip()
        password = request.form.get("password", "")
        city     = request.form.get("city", "Dakar")
        if not all([name, email, phone, password]):
            flash("Tous les champs sont obligatoires.", "error")
            return render_template("auth/register.html")
        db = get_db()
        existing = db.execute("SELECT id FROM users WHERE email=? OR phone=?", (email, phone)).fetchone()
        if existing:
            flash("Email ou téléphone déjà utilisé.", "error")
            return render_template("auth/register.html")
        pw_hash = hash_password(password)
        db.execute(
            "INSERT INTO users (name,email,phone,password,city) VALUES (?,?,?,?,?)",
            (name, email, phone, pw_hash, city),
        )
        db.commit()
        flash("Compte créé ! Connectez-vous.", "success")
        return redirect(url_for("auth.login"))
    return render_template("auth/register.html")


@auth_bp.route("/logout")
def logout():
    session.clear()
    flash("Déconnexion réussie.", "info")
    return redirect(url_for("public.index"))
