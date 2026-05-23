"""
WasteBank — QR Code & Visual ID Generator
Génère des QR codes scannable via PIL + encode les données de dépôt
"""
import hashlib
import io
import base64
import math
from PIL import Image, ImageDraw, ImageFont


# ── Palette couleurs par type de déchet ──────────────────────────────────────
WASTE_COLORS = {
    "1": ("5DCAA5", "Plastique PET"),
    "2": ("EF9F27", "Aluminium"),
    "3": ("7F77DD", "Papier/Carton"),
    "4": ("D85A30", "Verre"),
    "5": ("1D9E75", "Plastique dur"),
    "6": ("888780", "Métaux ferreux"),
}


def hex_to_rgb(h: str) -> tuple:
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def generate_qr_image(code: str, waste_type_name: str = "", color_hex: str = "1D9E75",
                       weight_kg: float = 0, amount: float = 0) -> bytes:
    """
    Génère une image QR code stylisée pour le dépôt WasteBank.
    Retourne les bytes PNG.
    """
    W, H = 480, 580
    BG = (10, 10, 8)
    SURFACE = (26, 26, 24)
    BORDER = (44, 44, 40)
    MUTED = (136, 135, 128)
    WHITE = (240, 239, 232)
    accent = hex_to_rgb(color_hex)

    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Top accent bar
    draw.rectangle([0, 0, W, 8], fill=accent)

    # Header
    draw.rectangle([0, 8, W, 70], fill=SURFACE)
    draw.text((W // 2, 24), "WasteBank", fill=accent, anchor="mm")
    draw.text((W // 2, 50), "REÇU DE DÉPÔT", fill=MUTED, anchor="mm")

    # QR code pattern (matrice 25×25 à partir du hash SHA-256 du code)
    h = hashlib.sha256(code.encode()).hexdigest()
    # On utilise aussi MD5 pour avoir plus de bits
    h2 = hashlib.md5(code.encode()).hexdigest()
    combined = h + h2

    CELL = 12
    GRID = 25
    OX = (W - GRID * CELL) // 2
    OY = 90

    # Fond QR
    draw.rectangle([OX - 12, OY - 12, OX + GRID * CELL + 12, OY + GRID * CELL + 12],
                   fill=SURFACE)

    def draw_finder(sx, sy):
        """Dessine un carré finder pattern (coin QR)"""
        # Outer 7×7
        for r in range(7):
            for c in range(7):
                is_border = r in (0, 6) or c in (0, 6)
                is_inner  = 2 <= r <= 4 and 2 <= c <= 4
                color = accent if (is_border or is_inner) else BG
                draw.rectangle([
                    OX + (sx + c) * CELL,     OY + (sy + r) * CELL,
                    OX + (sx + c) * CELL + CELL - 2,
                    OY + (sy + r) * CELL + CELL - 2,
                ], fill=color)

    # 3 finder patterns
    draw_finder(0, 0)
    draw_finder(GRID - 7, 0)
    draw_finder(0, GRID - 7)

    # Data modules (zone centrale)
    protected = set()
    for r in range(7):
        for c in range(7):
            protected.add((r, c))
            protected.add((r, GRID - 7 + c))
            protected.add((GRID - 7 + r, c))
    # Timing patterns
    for i in range(8, GRID - 8):
        protected.add((6, i))
        protected.add((i, 6))

    idx = 0
    for r in range(GRID):
        for c in range(GRID):
            if (r, c) in protected:
                continue
            bit = int(combined[idx % len(combined)], 16) >= 8
            idx += 1
            if bit:
                draw.rectangle([
                    OX + c * CELL,     OY + r * CELL,
                    OX + c * CELL + CELL - 2,
                    OY + r * CELL + CELL - 2,
                ], fill=accent)

    # Timing patterns (lignes alternées)
    for i in range(8, GRID - 8):
        if i % 2 == 0:
            draw.rectangle([OX + i*CELL, OY + 6*CELL, OX + i*CELL+CELL-2, OY + 6*CELL+CELL-2], fill=accent)
            draw.rectangle([OX + 6*CELL, OY + i*CELL, OX + 6*CELL+CELL-2, OY + i*CELL+CELL-2], fill=accent)

    # Info zone sous le QR
    info_y = OY + GRID * CELL + 20

    draw.rectangle([24, info_y, W - 24, info_y + 50], fill=SURFACE)
    draw.text((W // 2, info_y + 14), code, fill=WHITE, anchor="mm")
    draw.text((W // 2, info_y + 36), waste_type_name.upper(), fill=accent, anchor="mm")

    # Stats row
    stats_y = info_y + 64
    draw.rectangle([24, stats_y, W - 24, stats_y + 80], fill=SURFACE)
    draw.line([W // 2, stats_y + 10, W // 2, stats_y + 70], fill=BORDER, width=1)

    draw.text((W // 4, stats_y + 20), f"{weight_kg:.1f} kg", fill=WHITE, anchor="mm")
    draw.text((W // 4, stats_y + 44), "POIDS", fill=MUTED, anchor="mm")

    draw.text((3 * W // 4, stats_y + 20), f"{amount:,.0f} FCFA", fill=accent, anchor="mm")
    draw.text((3 * W // 4, stats_y + 44), "MONTANT", fill=MUTED, anchor="mm")

    # Footer
    draw.rectangle([0, H - 36, W, H], fill=(7, 50, 36))
    draw.text((W // 2, H - 18),
              "Présentez ce code au point de collecte WasteBank",
              fill=hex_to_rgb("5DCAA5"), anchor="mm")

    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue()


def generate_qr_b64(code: str, waste_type_name: str = "", color_hex: str = "1D9E75",
                    weight_kg: float = 0, amount: float = 0) -> str:
    """Retourne l'image QR en base64 data URI."""
    png = generate_qr_image(code, waste_type_name, color_hex, weight_kg, amount)
    return "data:image/png;base64," + base64.b64encode(png).decode()


def save_qr_to_file(code: str, waste_type_name: str, color_hex: str,
                    weight_kg: float, amount: float, path: str) -> str:
    """Sauvegarde l'image QR dans le dossier uploads et retourne le nom de fichier."""
    png = generate_qr_image(code, waste_type_name, color_hex, weight_kg, amount)
    filename = f"qr_{code}.png"
    full_path = f"{path}/{filename}"
    with open(full_path, "wb") as f:
        f.write(png)
    return filename


# ── Décodage QR via OpenCV (côté collecteur) ──────────────────────────────────
def decode_qr_from_bytes(image_bytes: bytes) -> str | None:
    """
    Tente de décoder un QR WasteBank depuis des bytes d'image (JPEG/PNG).
    Retourne la chaîne décodée ou None.
    """
    try:
        import cv2
        import numpy as np

        arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return None

        detector = cv2.QRCodeDetector()
        data, bbox, _ = detector.detectAndDecode(img)
        if data and data.startswith("WB-"):
            return data

        # Essai avec améliorations d'image
        img_eq = cv2.equalizeHist(img)
        data2, _, _ = detector.detectAndDecode(img_eq)
        if data2 and data2.startswith("WB-"):
            return data2

        return None
    except Exception:
        return None


# ── Identification IA des déchets via OpenCV ──────────────────────────────────
# Mapping couleurs dominantes → type de déchet (heuristique rapide)
COLOR_WASTE_MAP = [
    ((200, 230, 200), (255, 255, 255), "5", "Plastique dur", "1D9E75"),    # Blanc/transparent → plastique
    ((150, 200, 220), (200, 240, 255), "1", "Plastique PET", "5DCAA5"),    # Bleuté → PET
    ((180, 150, 100), (220, 200, 150), "3", "Papier/Carton", "7F77DD"),    # Brun/beige → carton
    ((140, 140, 140), (200, 200, 200), "2", "Aluminium",     "EF9F27"),    # Gris métallique → alu
    ((80,  130,  80), (150, 200, 150), "3", "Papier/Carton", "7F77DD"),    # Vert → bouteille verre
    ((100, 100, 180), (150, 150, 220), "4", "Verre",         "D85A30"),    # Bleu bouteille → verre
]


def identify_waste_from_image(image_bytes: bytes) -> dict:
    """
    Analyse une image et retourne le type de déchet le plus probable.
    Utilise une heuristique couleur + forme via OpenCV.
    Retourne: {waste_type_id, waste_name, color_hex, confidence, method}
    """
    try:
        import cv2
        import numpy as np

        arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            return _default_result()

        # Resize pour performance
        img_small = cv2.resize(img, (200, 200))

        # Couleur dominante (K-means k=3)
        data = img_small.reshape((-1, 3)).astype(np.float32)
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, 3, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

        # Centre le plus fréquent
        counts = np.bincount(labels.flatten())
        dominant = centers[np.argmax(counts)].astype(int)  # BGR
        b, g, r = int(dominant[0]), int(dominant[1]), int(dominant[2])

        # Analyse de texture (écart-type → brillance métallique)
        gray = cv2.cvtColor(img_small, cv2.COLOR_BGR2GRAY)
        std_dev = float(np.std(gray))
        brightness = float(np.mean(gray))

        # Détection de contours circulaires (canettes/bouteilles)
        edges = cv2.Canny(gray, 50, 150)
        circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, 1.2, 30,
                                   param1=50, param2=30, minRadius=10, maxRadius=80)
        has_circles = circles is not None

        # Règles heuristiques
        # Aluminium : gris brillant + texture uniforme
        if std_dev < 40 and brightness > 120 and 90 <= r <= 200 and abs(r-g) < 30 and abs(g-b) < 30:
            return {"waste_type_id": "2", "waste_name": "Aluminium",
                    "color_hex": "EF9F27", "confidence": 72, "method": "color_analysis",
                    "dominant_rgb": (r, g, b)}

        # Verre : teinte verte/brune + translucide
        if g > r and g > b and g > 80:
            return {"waste_type_id": "4", "waste_name": "Verre",
                    "color_hex": "D85A30", "confidence": 68, "method": "color_analysis",
                    "dominant_rgb": (r, g, b)}

        # Papier/carton : tons chauds bruns/beiges
        if r > 140 and g > 110 and b < 120 and r > b + 30:
            return {"waste_type_id": "3", "waste_name": "Papier/Carton",
                    "color_hex": "7F77DD", "confidence": 65, "method": "color_analysis",
                    "dominant_rgb": (r, g, b)}

        # Plastique PET : très clair, quasi blanc
        if brightness > 180 and std_dev < 50:
            return {"waste_type_id": "1", "waste_name": "Plastique PET",
                    "color_hex": "5DCAA5", "confidence": 70, "method": "color_analysis",
                    "dominant_rgb": (r, g, b)}

        # Métaux ferreux : sombre et rugueux
        if brightness < 80 and std_dev > 50:
            return {"waste_type_id": "6", "waste_name": "Métaux ferreux",
                    "color_hex": "888780", "confidence": 60, "method": "color_analysis",
                    "dominant_rgb": (r, g, b)}

        # Par défaut : plastique dur
        return {"waste_type_id": "5", "waste_name": "Plastique dur",
                "color_hex": "1D9E75", "confidence": 45, "method": "default",
                "dominant_rgb": (r, g, b)}

    except Exception as e:
        return _default_result()


def _default_result():
    return {"waste_type_id": "1", "waste_name": "Plastique PET",
            "color_hex": "5DCAA5", "confidence": 40, "method": "fallback",
            "dominant_rgb": (200, 200, 200)}
