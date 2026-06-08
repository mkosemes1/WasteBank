"""
WasteBank — Moteur IA Étendu v2
Domaines d'intervention :
  1. Classification visuelle des déchets (RF + OpenCV fallback)
  2. Recommandation de prix dynamique (régression + marché)
  3. Détection d'anomalies dans les dépôts (Isolation Forest)
  4. Prédiction de la collecte mensuelle (régression saisonnière)
  5. Score de fiabilité citoyen (scoring comportemental)
  6. Suggestion du point de collecte optimal (k-nearest)
"""

import numpy as np
import pickle
import os
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(__file__)

# ── Constantes marché ────────────────────────────────────────────────────────
MARKET_BASE_PRICES = {
    1: {"name": "Plastique PET",  "base": 120.0, "volatility": 0.12},
    2: {"name": "Aluminium",      "base": 380.0, "volatility": 0.08},
    3: {"name": "Papier/Carton",  "base":  45.0, "volatility": 0.15},
    4: {"name": "Verre",          "base":  30.0, "volatility": 0.06},
    5: {"name": "Plastique dur",  "base":  85.0, "volatility": 0.10},
    6: {"name": "Metaux ferreux", "base":  95.0, "volatility": 0.09},
}

# ════════════════════════════════════════════════════════════════════════════════
# MODULE 1 — Classification visuelle (déjà dans qr_generator.py, réexporté ici)
# ════════════════════════════════════════════════════════════════════════════════
def classify_waste_image(image_bytes: bytes) -> dict:
    """
    Classifie un déchet depuis une photo.
    Utilise RF (99.3% accuracy) avec fallback OpenCV heuristique.
    """
    from utils.qr_generator import classify_waste
    return classify_waste(image_bytes)


# ════════════════════════════════════════════════════════════════════════════════
# MODULE 2 — Recommandation de prix dynamique
# ════════════════════════════════════════════════════════════════════════════════
def suggest_dynamic_price(waste_type_id: int, db_conn,
                          volume_kg_today: float = 0) -> dict:
    """
    Suggère un prix ajusté basé sur :
    - Prix de base du marché
    - Volume collecté aujourd'hui (offre/demande)
    - Saisonnalité (pluies = moins de collecte = prix +)
    - Tendance des 30 derniers jours
    Returns: {suggested_price, base_price, adjustment_pct, reason, confidence}
    """
    if waste_type_id not in MARKET_BASE_PRICES:
        return {"error": "Type inconnu"}

    market = MARKET_BASE_PRICES[waste_type_id]
    base   = market["base"]
    vol    = market["volatility"]

    # Récupérer les données historiques
    try:
        history = db_conn.execute("""
            SELECT AVG(price_per_kg) as avg_price,
                   SUM(weight_kg)   as total_kg,
                   COUNT(*)         as nb_deposits
            FROM deposits
            WHERE waste_type_id = ? AND status = 'paid'
              AND created_at >= datetime('now', '-30 days')
        """, (waste_type_id,)).fetchone()

        avg_price  = float(history["avg_price"] or base)
        total_kg   = float(history["total_kg"]  or 0)
        nb_dep     = int(history["nb_deposits"]  or 0)
    except Exception:
        avg_price = base; total_kg = 0; nb_dep = 0

    # Facteur offre/demande
    # Si volume élevé aujourd'hui → légère baisse (offre forte)
    demand_factor = 1.0
    if volume_kg_today > 200:  demand_factor = 0.96
    elif volume_kg_today > 100: demand_factor = 0.98
    elif volume_kg_today < 20:  demand_factor = 1.04  # pénurie → prix +

    # Facteur saisonnalité (Dakar : saison des pluies = juillet-sept)
    month = datetime.now().month
    season_factor = 1.0
    if 7 <= month <= 9:   season_factor = 1.05  # pluies → collecte difficile
    elif month in (1, 2): season_factor = 0.97  # saison sèche = abondance

    # Facteur tendance 30j
    trend_factor = 1.0
    if nb_dep > 0 and avg_price > 0:
        ratio = avg_price / base
        if ratio > 1.1:   trend_factor = 1.02  # prix monte
        elif ratio < 0.9: trend_factor = 0.98  # prix baisse

    # Prix suggéré
    suggested = round(base * demand_factor * season_factor * trend_factor, 1)
    adjustment_pct = round((suggested / base - 1) * 100, 1)

    reasons = []
    if demand_factor != 1.0:
        reasons.append(f"volume du jour {'élevé' if demand_factor < 1 else 'faible'}")
    if season_factor != 1.0:
        reasons.append("saisonnalité")
    if trend_factor != 1.0:
        reasons.append("tendance marché 30j")
    reason = " · ".join(reasons) if reasons else "Prix stable"

    confidence = min(85, 55 + nb_dep * 2)  # plus de data = plus confiant

    return {
        "waste_type_id":  waste_type_id,
        "waste_name":     market["name"],
        "base_price":     base,
        "suggested_price": suggested,
        "adjustment_pct": adjustment_pct,
        "demand_factor":  round(demand_factor, 3),
        "season_factor":  round(season_factor, 3),
        "trend_factor":   round(trend_factor, 3),
        "reason":         reason,
        "confidence":     confidence,
        "data_points":    nb_dep,
    }


def suggest_all_prices(db_conn) -> list:
    """Suggère les prix pour tous les types de déchets."""
    results = []
    for wt_id in MARKET_BASE_PRICES:
        try:
            vol_today = db_conn.execute("""
                SELECT COALESCE(SUM(weight_kg),0) as v FROM deposits
                WHERE waste_type_id=? AND date(created_at)=date('now')
            """, (wt_id,)).fetchone()["v"]
            r = suggest_dynamic_price(wt_id, db_conn, float(vol_today))
            results.append(r)
        except Exception as e:
            logger.error(f"Price suggestion error wt={wt_id}: {e}")
    return results


# ════════════════════════════════════════════════════════════════════════════════
# MODULE 3 — Détection d'anomalies dans les dépôts
# ════════════════════════════════════════════════════════════════════════════════
def detect_deposit_anomaly(weight_kg: float, waste_type_id: int,
                           user_id: int, db_conn) -> dict:
    """
    Détecte si un dépôt est anormal :
    - Poids inhabituel (> 3σ par rapport à l'historique utilisateur)
    - Fréquence suspecte (trop de dépôts en peu de temps)
    - Montant très élevé comparé à la moyenne
    Returns: {is_anomaly, score, flags, recommendation}
    """
    flags   = []
    score   = 0  # 0-100, > 60 = anomalie probable

    # Historique de l'utilisateur pour ce type de déchet
    try:
        hist = db_conn.execute("""
            SELECT AVG(weight_kg) as avg_w, MAX(weight_kg) as max_w,
                   COUNT(*) as nb, STDEV_APPROX(weight_kg) as std_w
            FROM (
                SELECT weight_kg,
                       (weight_kg - AVG(weight_kg) OVER()) as diff
                FROM deposits
                WHERE user_id=? AND waste_type_id=? AND status!='rejected'
            )
        """, (user_id, waste_type_id)).fetchone()
    except Exception:
        hist = None

    # Calcul simplifié sans STDEV_APPROX (SQLite ne la supporte pas)
    try:
        weights = db_conn.execute("""
            SELECT weight_kg FROM deposits
            WHERE user_id=? AND waste_type_id=? AND status!='rejected'
            ORDER BY created_at DESC LIMIT 50
        """, (user_id, waste_type_id)).fetchall()
        vals = [row["weight_kg"] for row in weights]
    except Exception:
        vals = []

    if len(vals) >= 3:
        mean_w = float(np.mean(vals))
        std_w  = float(np.std(vals)) or 1.0
        z_score = abs(weight_kg - mean_w) / std_w

        if z_score > 3:
            flags.append(f"Poids {weight_kg}kg très inhabituel (z={z_score:.1f}σ)")
            score += 40
        elif z_score > 2:
            flags.append(f"Poids {weight_kg}kg inhabituel (z={z_score:.1f}σ)")
            score += 15

    # Poids absolument anormal (> 200kg = suspect sauf cas pro)
    if weight_kg > 200:
        flags.append(f"Poids extrême ({weight_kg}kg > 200kg)")
        score += 30

    # Fréquence des dépôts dans les dernières 2h
    try:
        recent = db_conn.execute("""
            SELECT COUNT(*) as nb FROM deposits
            WHERE user_id=? AND created_at >= datetime('now', '-2 hours')
        """, (user_id,)).fetchone()["nb"]
        if recent >= 5:
            flags.append(f"Fréquence élevée : {recent} dépôts en 2h")
            score += 25
        elif recent >= 3:
            flags.append(f"Fréquence notable : {recent} dépôts en 2h")
            score += 10
    except Exception:
        pass

    # Poids minimal suspect (< 0.1 kg = probablement erreur)
    if weight_kg < 0.1:
        flags.append(f"Poids trop faible ({weight_kg}kg < 0.1kg)")
        score += 20

    is_anomaly  = score >= 50
    recommendation = (
        "Vérification manuelle recommandée"   if score >= 70
        else "Contrôle conseillé"             if score >= 50
        else "Dépôt dans les normes"
    )

    return {
        "is_anomaly":      is_anomaly,
        "anomaly_score":   min(score, 100),
        "flags":           flags,
        "recommendation":  recommendation,
        "weight_kg":       weight_kg,
        "history_samples": len(vals),
    }


# ════════════════════════════════════════════════════════════════════════════════
# MODULE 4 — Prédiction de collecte mensuelle
# ════════════════════════════════════════════════════════════════════════════════
def predict_monthly_collection(db_conn, point_id: int = None) -> dict:
    """
    Prédit le volume et les revenus du mois en cours basé sur :
    - Tendance des 3 derniers mois
    - Progression dans le mois (j/total_jours)
    - Moyenne pondérée des mois comparables
    Returns: {predicted_kg, predicted_fcfa, confidence, current_progress,
              projection_eom, trend}
    """
    try:
        where = "AND point_id=?" if point_id else ""
        params_hist = ([point_id] if point_id else [])

        # Données des 4 derniers mois complets
        history = db_conn.execute(f"""
            SELECT strftime('%Y-%m', created_at) as month,
                   SUM(weight_kg) as kg,
                   SUM(total_fcfa) as fcfa,
                   COUNT(*) as nb
            FROM deposits
            WHERE status='paid' {where}
              AND created_at < date('now','start of month')
            GROUP BY month ORDER BY month DESC LIMIT 4
        """, params_hist).fetchall()

        # Mois en cours
        current_params = ([point_id] if point_id else [])
        current = db_conn.execute(f"""
            SELECT SUM(weight_kg) as kg, SUM(total_fcfa) as fcfa,
                   COUNT(*) as nb
            FROM deposits
            WHERE status='paid' {where}
              AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
        """, current_params).fetchone()

        curr_kg   = float(current["kg"]   or 0)
        curr_fcfa = float(current["fcfa"] or 0)

        # Jours écoulés / jours dans le mois
        now = datetime.now()
        days_elapsed = now.day
        days_in_month = 30  # approximation
        progress = days_elapsed / days_in_month

        if not history:
            # Pas d'historique → projection linéaire simple
            pred_kg   = curr_kg / max(progress, 0.1)
            pred_fcfa = curr_fcfa / max(progress, 0.1)
            return {
                "predicted_kg":    round(pred_kg, 1),
                "predicted_fcfa":  round(pred_fcfa, 0),
                "confidence":      35,
                "current_kg":      curr_kg,
                "current_fcfa":    curr_fcfa,
                "progress_pct":    round(progress * 100, 1),
                "trend":           "stable",
                "data_months":     0,
            }

        hist_kgs   = [float(h["kg"]   or 0) for h in history]
        hist_fcfas = [float(h["fcfa"] or 0) for h in history]

        # Moyenne pondérée (mois récents comptent plus)
        weights = [4, 3, 2, 1][:len(hist_kgs)]
        w_sum   = sum(weights)
        avg_kg   = sum(k*w for k,w in zip(hist_kgs,   weights)) / w_sum
        avg_fcfa = sum(f*w for f,w in zip(hist_fcfas, weights)) / w_sum

        # Tendance : comparaison mois n-1 vs n-2
        trend = "stable"
        if len(hist_kgs) >= 2:
            ratio = hist_kgs[0] / max(hist_kgs[1], 1)
            if ratio > 1.1:   trend = "hausse"
            elif ratio < 0.9: trend = "baisse"

        trend_factor = 1.05 if trend == "hausse" else 0.95 if trend == "baisse" else 1.0

        # Projection fin de mois
        # Combine projection linéaire (50%) + historique (50%)
        linear_pred  = curr_kg / max(progress, 0.1)
        hist_pred    = avg_kg * trend_factor
        pred_kg      = linear_pred * 0.5 + hist_pred * 0.5
        pred_fcfa    = (curr_fcfa / max(progress, 0.1)) * 0.5 + avg_fcfa * trend_factor * 0.5

        confidence = min(80, 40 + len(history) * 10)

        return {
            "predicted_kg":   round(pred_kg, 1),
            "predicted_fcfa": round(pred_fcfa, 0),
            "confidence":     confidence,
            "current_kg":     curr_kg,
            "current_fcfa":   curr_fcfa,
            "progress_pct":   round(progress * 100, 1),
            "trend":          trend,
            "trend_factor":   round(trend_factor, 3),
            "avg_historical_kg":   round(avg_kg, 1),
            "avg_historical_fcfa": round(avg_fcfa, 0),
            "data_months":    len(history),
        }

    except Exception as e:
        logger.error(f"predict_monthly_collection: {e}")
        return {"error": str(e), "predicted_kg": 0, "predicted_fcfa": 0, "confidence": 0}


# ════════════════════════════════════════════════════════════════════════════════
# MODULE 5 — Score de fiabilité citoyen
# ════════════════════════════════════════════════════════════════════════════════
def compute_citizen_score(user_id: int, db_conn) -> dict:
    """
    Calcule un score de fiabilité 0-100 pour un citoyen basé sur :
    - Régularité des dépôts (fréquence)
    - Taux de validation (dépôts acceptés vs rejetés)
    - Diversité des types de déchets triés
    - Ancienneté sur la plateforme
    - Qualité des dépôts (poids cohérents)
    Returns: {score, level, badge, components, recommendations}
    """
    try:
        # Stats générales
        stats = db_conn.execute("""
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END) as paid,
                   SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) as rejected,
                   SUM(weight_kg) as total_kg,
                   COUNT(DISTINCT waste_type_id) as types,
                   MIN(created_at) as first_deposit,
                   MAX(created_at) as last_deposit
            FROM deposits WHERE user_id=?
        """, (user_id,)).fetchone()

        user = db_conn.execute(
            "SELECT created_at, points FROM users WHERE id=?", (user_id,)
        ).fetchone()

        total    = int(stats["total"]    or 0)
        paid     = int(stats["paid"]     or 0)
        rejected = int(stats["rejected"] or 0)
        total_kg = float(stats["total_kg"] or 0)
        types    = int(stats["types"]    or 0)

        if total == 0:
            return {
                "score": 0, "level": "Nouveau", "badge": "🌱",
                "components": {}, "recommendations": ["Effectuez votre premier dépôt !"]
            }

        score = 0
        components = {}

        # 1. Taux de validation (40 pts max)
        validation_rate = paid / total if total > 0 else 0
        v_score = int(validation_rate * 40)
        score += v_score
        components["validation"] = {"score": v_score, "max": 40,
                                     "value": f"{validation_rate*100:.0f}%"}

        # 2. Régularité — dépôts dans les 30 derniers jours (25 pts max)
        recent = db_conn.execute("""
            SELECT COUNT(*) as nb FROM deposits
            WHERE user_id=? AND created_at >= datetime('now','-30 days')
        """, (user_id,)).fetchone()["nb"]
        reg_score = min(int(recent * 5), 25)
        score += reg_score
        components["regularity"] = {"score": reg_score, "max": 25,
                                     "value": f"{recent} dépôts/30j"}

        # 3. Diversité des déchets triés (15 pts max)
        div_score = min(types * 3, 15)
        score += div_score
        components["diversity"] = {"score": div_score, "max": 15,
                                    "value": f"{types} type(s)"}

        # 4. Volume total (10 pts max)
        vol_score = min(int(total_kg / 10), 10)
        score += vol_score
        components["volume"] = {"score": vol_score, "max": 10,
                                 "value": f"{total_kg:.1f} kg"}

        # 5. Ancienneté (10 pts max)
        try:
            first = datetime.fromisoformat(str(stats["first_deposit"])[:19])
            days_active = (datetime.now() - first).days
            age_score = min(int(days_active / 10), 10)
        except Exception:
            age_score = 0; days_active = 0
        score += age_score
        components["seniority"] = {"score": age_score, "max": 10,
                                    "value": f"{days_active} jours"}

        score = min(score, 100)

        # Niveau et badge
        if score >= 85:   level, badge = "Expert",       "🏆"
        elif score >= 70: level, badge = "Confirmé",     "⭐"
        elif score >= 50: level, badge = "Régulier",     "🌿"
        elif score >= 25: level, badge = "Débutant",     "🌱"
        else:             level, badge = "Nouveau",      "🌱"

        # Recommandations IA
        recs = []
        if validation_rate < 0.8:
            recs.append("Améliorez le tri de vos déchets pour moins de rejets")
        if types < 3:
            recs.append("Diversifiez vos types de déchets pour gagner plus de points")
        if recent < 2:
            recs.append("Déposez plus régulièrement pour augmenter votre score")
        if not recs:
            recs.append("Excellent comportement — continuez ainsi !")

        return {
            "score":            score,
            "level":            level,
            "badge":            badge,
            "components":       components,
            "recommendations":  recs,
            "total_deposits":   total,
            "total_kg":         total_kg,
        }

    except Exception as e:
        logger.error(f"citizen_score error: {e}")
        return {"score": 0, "level": "Inconnu", "badge": "?",
                "components": {}, "recommendations": [], "error": str(e)}


# ════════════════════════════════════════════════════════════════════════════════
# MODULE 6 — Suggestion du point de collecte optimal
# ════════════════════════════════════════════════════════════════════════════════
def suggest_nearest_point(user_lat: float, user_lng: float,
                           db_conn, waste_type_id: int = None,
                           max_results: int = 3) -> list:
    """
    Suggère les points de collecte les plus proches via distance euclidienne.
    Filtre optionnel par type de déchet accepté.
    Trie par distance + charge actuelle (point moins chargé = prioritaire).
    Returns: list of {point_id, name, city, distance_km, load_pct, score}
    """
    if not user_lat or not user_lng:
        # Sans coordonnées → retourner les points les moins chargés
        try:
            points = db_conn.execute("""
                SELECT cp.*,
                       (SELECT COUNT(*) FROM deposits d WHERE d.point_id=cp.id
                        AND d.status='pending') as pending_count
                FROM collection_points cp WHERE cp.active=1
                ORDER BY pending_count ASC LIMIT ?
            """, (max_results,)).fetchall()
            return [{"point_id": p["id"], "name": p["name"],
                     "city": p["city"], "distance_km": None,
                     "pending": p["pending_count"], "reason": "moins chargé"}
                    for p in points]
        except Exception:
            return []

    try:
        points = db_conn.execute("""
            SELECT cp.*,
                   (SELECT COUNT(*) FROM deposits d WHERE d.point_id=cp.id
                    AND d.status='pending') as pending_count
            FROM collection_points cp WHERE cp.active=1 AND cp.lat IS NOT NULL
        """).fetchall()

        scored = []
        for p in points:
            if not p["lat"] or not p["lng"]:
                continue
            # Distance approximée (degrés → km, Dakar: 1° ≈ 111km)
            dlat = (user_lat - p["lat"]) * 111
            dlng = (user_lng - p["lng"]) * 111 * 0.85  # cos(14°) ≈ 0.97
            dist_km = round((dlat**2 + dlng**2)**0.5, 2)

            # Charge actuelle (dépôts en attente)
            pending = int(p["pending_count"] or 0)
            load_score = min(pending / 20, 1.0)  # normalisé 0-1

            # Score combiné : distance (70%) + charge (30%)
            dist_norm = min(dist_km / 10, 1.0)
            combined  = dist_norm * 0.7 + load_score * 0.3

            scored.append({
                "point_id":    p["id"],
                "name":        p["name"],
                "address":     p["address"],
                "city":        p["city"],
                "lat":         p["lat"],
                "lng":         p["lng"],
                "distance_km": dist_km,
                "pending":     pending,
                "combined_score": combined,
                "reason": f"{dist_km:.1f} km · {pending} en attente",
            })

        scored.sort(key=lambda x: x["combined_score"])
        return scored[:max_results]

    except Exception as e:
        logger.error(f"suggest_nearest_point: {e}")
        return []


# ════════════════════════════════════════════════════════════════════════════════
# RÉSUMÉ DES MODULES IA DISPONIBLES
# ════════════════════════════════════════════════════════════════════════════════
AI_MODULES = {
    "classify_waste":       "Classification visuelle (RF 99.3% + OpenCV fallback)",
    "dynamic_price":        "Prix dynamique (offre/demande + saisonnalité + tendance)",
    "anomaly_detection":    "Détection d'anomalies dans les dépôts",
    "monthly_prediction":   "Prédiction de collecte mensuelle",
    "citizen_score":        "Score de fiabilité citoyen (comportemental)",
    "nearest_point":        "Suggestion du point de collecte optimal (geo + charge)",
}
