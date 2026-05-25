#!/usr/bin/env python3
"""
WasteBank — Lanceur complet avec Ngrok
Démarre Flask + expose via ngrok pour tests multi-appareils
"""
import os, sys, time, socket, threading, subprocess, hashlib
from app import create_app

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def get_ngrok_url():
    """Tente de récupérer l'URL ngrok active."""
    try:
        import urllib.request, json
        with urllib.request.urlopen("http://localhost:4040/api/tunnels", timeout=2) as r:
            data = json.loads(r.read())
            tunnels = data.get("tunnels", [])
            for t in tunnels:
                if t.get("proto") == "https":
                    return t["public_url"]
            if tunnels:
                return tunnels[0]["public_url"]
    except:
        pass
    return None

def start_ngrok(port):
    """Lance ngrok en arrière-plan si disponible."""
    ngrok_paths = ["ngrok", "/usr/local/bin/ngrok", os.path.expanduser("~/ngrok")]
    for path in ngrok_paths:
        if os.path.exists(path) or path == "ngrok":
            try:
                proc = subprocess.Popen(
                    [path, "http", str(port)],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                time.sleep(2.5)
                url = get_ngrok_url()
                if url:
                    return url, proc
            except FileNotFoundError:
                continue
    return None, None

def get_agent_links(app, base_url):
    """Génère les liens agent pour tous les points de collecte."""
    from routes.agent import _get_agent_token
    links = []
    with app.app_context():
        from models.db import get_db
        with app.test_request_context():
            from flask import g
            import sqlite3
            db = sqlite3.connect(app.config["DATABASE"])
            db.row_factory = sqlite3.Row
            points = db.execute(
                "SELECT * FROM collection_points WHERE active=1 ORDER BY city, name"
            ).fetchall()
            db.close()
            for p in points:
                token = _get_agent_token(p["id"])
                links.append({
                    "name": p["name"],
                    "city": p["city"],
                    "url":  f"{base_url}/agent/portal/{token}"
                })
    return links

def print_banner(local_ip, port, ngrok_url, agent_links):
    W = "\033[0m"
    BOLD = "\033[1m"
    COP  = "\033[38;5;208m"  # cuivre
    GRN  = "\033[38;5;78m"
    DIM  = "\033[38;5;240m"
    RED  = "\033[38;5;167m"
    BLU  = "\033[38;5;75m"
    YEL  = "\033[38;5;220m"

    print(f"\n{COP}{'━'*62}{W}")
    print(f"{BOLD}{COP}  ♻  WasteBank Platform{W}")
    print(f"{DIM}  Obsidian Edition — Prêt pour le hackathon{W}")
    print(f"{COP}{'━'*62}{W}\n")

    print(f"{BOLD}  Accès local{W}")
    print(f"  {GRN}●{W} Application    {BOLD}http://{local_ip}:{port}{W}")
    print(f"  {GRN}●{W} Localhost      {BOLD}http://localhost:{port}{W}")

    if ngrok_url:
        print(f"\n{BOLD}  Tunnel ngrok (accès depuis n'importe quel appareil){W}")
        print(f"  {YEL}◉{W} URL publique   {BOLD}{ngrok_url}{W}")
        print(f"  {DIM}  Partagez ce lien pour tester sur mobile{W}")
    else:
        print(f"\n  {DIM}  Ngrok non détecté — accès réseau local uniquement{W}")
        print(f"  {DIM}  Installez ngrok : https://ngrok.com/download{W}")

    base = ngrok_url or f"http://{local_ip}:{port}"

    print(f"\n{BOLD}  Comptes de démonstration{W}")
    print(f"  {DIM}┌──────────────┬──────────────────────────────┬──────────────{W}")
    print(f"  {DIM}│{W} Rôle         {DIM}│{W} Email                        {DIM}│{W} Mot de passe")
    print(f"  {DIM}├──────────────┼──────────────────────────────┼──────────────{W}")
    print(f"  {DIM}│{W} {GRN}Citoyen{W}       {DIM}│{W} moussa@demo.com              {DIM}│{W} demo123")
    print(f"  {DIM}│{W} {BLU}Collecteur{W}    {DIM}│{W} fatou@wastebank.africa       {DIM}│{W} collector123")
    print(f"  {DIM}│{W} {RED}Admin{W}         {DIM}│{W} admin@wastebank.africa       {DIM}│{W} admin123")
    print(f"  {DIM}└──────────────┴──────────────────────────────┴──────────────{W}")

    print(f"\n{BOLD}  Portails Agent QR (sans compte requis){W}")
    print(f"  {DIM}  Envoyez ces liens aux agents de collecte :{W}")
    for i, lnk in enumerate(agent_links):
        ico = "◉" if i == 0 else "◎"
        print(f"  {COP}{ico}{W} {lnk['name']} ({lnk['city']})")
        print(f"    {BOLD}{lnk['url']}{W}")

    print(f"\n{BOLD}  Pages utiles{W}")
    print(f"  {DIM}→{W} API des prix   {base}/api/prices")
    print(f"  {DIM}→{W} Admin          {base}/admin")
    print(f"  {DIM}→{W} Prix du jour   {base}/prices")

    print(f"\n{COP}{'━'*62}{W}")
    print(f"  {DIM}Ctrl+C pour arrêter{W}\n")

if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 5000))

    # Créer l'app
    app = create_app()

    # IP locale
    local_ip = get_local_ip()

    # Démarrer ngrok (optionnel)
    ngrok_url, ngrok_proc = start_ngrok(PORT)

    # URL de base pour les liens
    base_url = ngrok_url or f"http://{local_ip}:{PORT}"

    # Liens agent
    try:
        agent_links = get_agent_links(app, base_url)
    except Exception:
        agent_links = []

    # Afficher le banner
    print_banner(local_ip, PORT, ngrok_url, agent_links)

    # Lancer Flask
    try:
        app.run(debug=False, host="0.0.0.0", port=PORT, use_reloader=False)
    except KeyboardInterrupt:
        if ngrok_proc:
            ngrok_proc.terminate()
        print("\n\033[38;5;208m  WasteBank arrêté.\033[0m\n")
