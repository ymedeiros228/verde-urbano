"""
Gera PNG de cobertura (verde=vegetação, vermelho=casas) alinhado ao bbox,
para overlay raster no MapLibre — sem círculos/heatmap (sem moiré).
"""
from __future__ import annotations

import json
import math
import urllib.request
from pathlib import Path
from PIL import Image, ImageFilter
import io

WEST, SOUTH, EAST, NORTH = -42.90, -5.18, -42.72, -5.02
ZOOM = 15
# resolução da imagem de saída (px)
OUT_W, OUT_H = 1200, 1000
USER_AGENT = "VerdeUrbano/1.0 (pesquisa extensao)"

ROOT = Path(__file__).resolve().parents[1]
OUT_PNG = ROOT / "public" / "map" / "cobertura.png"
OUT_META = ROOT / "public" / "map" / "cobertura-meta.json"


def lng_lat_to_tile(lng: float, lat: float, z: int) -> tuple[float, float]:
    n = 2**z
    x = (lng + 180.0) / 360.0 * n
    lat_rad = math.radians(lat)
    y = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    return x, y


def tile_xy_to_lng_lat(x: float, y: float, z: int) -> tuple[float, float]:
    n = 2**z
    lng = x / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * y / n)))
    return lng, math.degrees(lat_rad)


def fetch_tile(z: int, x: int, y: int) -> Image.Image | None:
    url = (
        "https://server.arcgisonline.com/ArcGIS/rest/services/"
        f"World_Imagery/MapServer/tile/{z}/{y}/{x}"
    )
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=40) as resp:
            return Image.open(io.BytesIO(resp.read())).convert("RGB")
    except Exception as e:
        print(f"fail {z}/{x}/{y}: {e}")
        return None


def classify(r: int, g: int, b: int) -> str | None:
    lum = (r + g + b) / 3.0
    if lum < 18 or lum > 250:
        return None
    if b >= g + 12 and b >= r + 8 and lum < 125:
        return None  # água
    eg = (2 * g - r - b) / 255.0
    mx, mn = max(r, g, b), min(r, g, b)
    chroma = (mx - mn) / max(1, mx)

    if g > r + 2 and g > b + 2 and eg >= 0.045:
        return "veg"
    if eg >= 0.025 and g >= r and g >= b - 2:
        return "veg"
    if r > g + 5 and r > b + 10 and eg < 0.04:
        return "built"
    if chroma < 0.12 and eg < 0.03 and 28 < lum < 200:
        return "built"
    if chroma < 0.15 and eg < 0.015 and 25 < lum < 160:
        return "built"
    if eg < 0.015 and r >= g - 6 and 40 < lum < 220:
        return "bare"
    if eg >= 0.015:
        return "veg"
    return "bare"


# RGBA — semi-transparent, cores limpas
COLORS = {
    "veg": (27, 122, 66, 140),
    "built": (196, 55, 40, 155),
    "bare": (212, 160, 30, 110),
}


def main() -> None:
    x0, y1 = lng_lat_to_tile(WEST, NORTH, ZOOM)
    x1, y0 = lng_lat_to_tile(EAST, SOUTH, ZOOM)
    tx0, tx1 = int(math.floor(x0)), int(math.floor(x1))
    ty0, ty1 = int(math.floor(y0)), int(math.floor(y1))

    # mosaico dos tiles
    tiles: dict[tuple[int, int], Image.Image] = {}
    for ty in range(min(ty0, ty1), max(ty0, ty1) + 1):
        for tx in range(tx0, tx1 + 1):
            img = fetch_tile(ZOOM, tx, ty)
            if img is not None:
                tiles[(tx, ty)] = img
            print(f"fetched {tx},{ty}")

    if not tiles:
        raise SystemExit("sem tiles")

    tw, th = next(iter(tiles.values())).size
    mosaic_w = (tx1 - tx0 + 1) * tw
    mosaic_h = (max(ty0, ty1) - min(ty0, ty1) + 1) * th
    mosaic = Image.new("RGB", (mosaic_w, mosaic_h), (0, 0, 0))
    for (tx, ty), img in tiles.items():
        ox = (tx - tx0) * tw
        oy = (ty - min(ty0, ty1)) * th
        mosaic.paste(img, (ox, oy))

    # recorte exacto do bbox em coords de mosaico
    def lnglat_to_mosaic_px(lng: float, lat: float) -> tuple[float, float]:
        xf, yf = lng_lat_to_tile(lng, lat, ZOOM)
        return (xf - tx0) * tw, (yf - min(ty0, ty1)) * th

    x_w, y_n = lnglat_to_mosaic_px(WEST, NORTH)
    x_e, y_s = lnglat_to_mosaic_px(EAST, SOUTH)
    left, right = int(min(x_w, x_e)), int(max(x_w, x_e))
    top, bottom = int(min(y_n, y_s)), int(max(y_n, y_s))
    crop = mosaic.crop((left, top, right, bottom)).resize(
        (OUT_W, OUT_H), Image.Resampling.BILINEAR
    )

    out = Image.new("RGBA", (OUT_W, OUT_H), (0, 0, 0, 0))
    px_in = crop.load()
    px_out = out.load()
    # amostrar a cada 2 px p/ suavizar; depois blur leve
    for y in range(OUT_H):
        for x in range(OUT_W):
            r, g, b = px_in[x, y]
            kind = classify(r, g, b)
            if kind is None:
                continue
            px_out[x, y] = COLORS[kind]

    # limpar ruído e suavizar (visual limpo no mapa)
    try:
        out = out.filter(ImageFilter.MedianFilter(size=3))
        out = out.filter(ImageFilter.GaussianBlur(1.2))
    except Exception:
        pass

    OUT_PNG.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT_PNG, optimize=True)
    meta = {
        "bbox": [WEST, SOUTH, EAST, NORTH],
        "coordinates": [
            [WEST, NORTH],
            [EAST, NORTH],
            [EAST, SOUTH],
            [WEST, SOUTH],
        ],
        "size": [OUT_W, OUT_H],
        "note": "verde=vegetacao vermelho=casas — overlay raster Esri",
    }
    OUT_META.write_text(json.dumps(meta), encoding="utf-8")
    print(f"wrote {OUT_PNG} ({OUT_PNG.stat().st_size // 1024} KB)")
    print(f"wrote {OUT_META}")


if __name__ == "__main__":
    main()
