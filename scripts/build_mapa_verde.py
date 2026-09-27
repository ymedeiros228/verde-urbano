# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "numpy",
#   "rasterio",
#   "h3>=4",
#   "shapely>=2",
#   "pystac-client",
#   "planetary-computer",
#   "requests",
# ]
# ///
"""
Mapa verde REAL de Teresina — sem pontos inventados.

Fontes (todas abertas/gratuitas):
  - ESA WorldCover 2021 v200 (10 m): árvore, construção, água, campo…
  - Landsat 8/9 C2 L2 (Planetary Computer): temperatura de superfície na seca
  - OpenStreetMap (Overpass): limite do município, bairros, parques e praças

Saídas em public/map/:
  - hex-verde.geojson   grade H3 res 9 (~0,1 km²) com % de copa, % construído,
                        temperatura e índice de prioridade de arborização
  - areas-verdes.geojson parques/praças/bosques mapeados no OSM
  - bairros-verde.json  ranking por bairro
  - meta.json           fontes, datas e totais

Rodar:  uv run scripts/build_mapa_verde.py
"""
from __future__ import annotations

import json
import math
import time
from collections import defaultdict
from datetime import date
from pathlib import Path

import h3
import numpy as np
import planetary_computer
import rasterio
import requests
from pystac_client import Client
from rasterio.warp import transform as warp_transform
from rasterio.windows import from_bounds
from shapely.geometry import LineString, Point, Polygon, shape, mapping
from shapely.ops import polygonize, unary_union
from shapely.prepared import prep

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "map"
CACHE = ROOT / "scripts" / ".cache"
OUT.mkdir(parents=True, exist_ok=True)
CACHE.mkdir(parents=True, exist_ok=True)

# Área urbana de Teresina (com folga); Timon/MA é cortado pelo limite municipal
W, S, E, N = -42.90, -5.22, -42.66, -4.93
H3_RES = 9
TERESINA_REL = 302749

WORLDCOVER_URL = (
    "https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/"
    "ESA_WorldCover_10m_2021_v200_S06W045_Map.tif"
)
# Classes WorldCover
TREE, SHRUB, GRASS, CROP, BUILT, BARE, WATER, WETLAND = 10, 20, 30, 40, 50, 60, 80, 90

OVERPASS = [
    "https://overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]
UA = {"User-Agent": "VerdeUrbano/1.0 (trabalho de extensao, Teresina)", "Accept": "application/json"}


def overpass(query: str, cache_name: str) -> dict:
    cached = CACHE / cache_name
    if cached.exists():
        return json.loads(cached.read_text(encoding="utf-8"))
    last = None
    for attempt in range(6):
        ep = OVERPASS[attempt % len(OVERPASS)]
        try:
            r = requests.post(ep, data={"data": query}, headers=UA, timeout=180)
            if r.status_code == 200 and r.text.lstrip().startswith("{"):
                cached.write_text(r.text, encoding="utf-8")
                return r.json()
            last = f"{ep} -> {r.status_code}"
        except requests.RequestException as e:  # rede instável: tenta o espelho
            last = f"{ep} -> {e}"
        time.sleep(8 + attempt * 6)
    raise RuntimeError(f"Overpass falhou: {last}")


# ---------------------------------------------------------------- OSM
def municipio_polygon():
    data = overpass(
        f"[out:json][timeout:120];rel({TERESINA_REL});out geom;", "teresina_rel.json"
    )
    lines = []
    for m in data["elements"][0]["members"]:
        if m["type"] == "way" and m.get("role") in ("outer", ""):
            lines.append(LineString([(p["lon"], p["lat"]) for p in m["geometry"]]))
    polys = list(polygonize(unary_union(lines)))
    return unary_union(polys)


def bairros_nodes():
    data = overpass(
        f"[out:json][timeout:120];area({3600000000 + TERESINA_REL})->.a;"
        'node["place"~"suburb|neighbourhood|quarter"](area.a);out;',
        "teresina_bairros.json",
    )
    out = []
    for el in data["elements"]:
        name = el.get("tags", {}).get("name")
        if name and W <= el["lon"] <= E and S <= el["lat"] <= N:
            out.append((name, el["lon"], el["lat"], el["tags"].get("place")))
    return out


def areas_verdes(muni) -> dict:
    data = overpass(
        f"[out:json][timeout:180];area({3600000000 + TERESINA_REL})->.a;("
        'way["leisure"~"^(park|garden|nature_reserve)$"](area.a);'
        'rel["leisure"~"^(park|garden|nature_reserve)$"](area.a);'
        'way["landuse"~"^(forest|recreation_ground|village_green)$"](area.a);'
        'way["natural"="wood"](area.a);'
        'way["place"="square"](area.a);'
        'way["leisure"="playground"](area.a);'
        ");out geom;",
        "teresina_verdes.json",
    )
    feats = []
    for el in data["elements"]:
        tags = el.get("tags", {})
        geom = None
        try:
            if el["type"] == "way" and len(el.get("geometry", [])) >= 4:
                coords = [(p["lon"], p["lat"]) for p in el["geometry"]]
                if coords[0] == coords[-1]:
                    geom = Polygon(coords)
            elif el["type"] == "relation":
                rings = [
                    LineString([(p["lon"], p["lat"]) for p in m["geometry"]])
                    for m in el.get("members", [])
                    if m["type"] == "way" and m.get("role") == "outer" and m.get("geometry")
                ]
                if rings:
                    geom = unary_union(list(polygonize(unary_union(rings))))
        except Exception:
            geom = None
        if geom is None or geom.is_empty or not geom.is_valid:
            continue
        if not muni.intersects(geom):
            continue
        kind = (
            "parque" if tags.get("leisure") in ("park", "nature_reserve")
            else "praca" if tags.get("place") == "square" or tags.get("leisure") == "garden"
            else "bosque" if tags.get("landuse") == "forest" or tags.get("natural") == "wood"
            else "lazer"
        )
        # área aproximada em m² (latitude ~ -5°)
        area_m2 = geom.area * (111_320 ** 2) * math.cos(math.radians(5.08))
        if area_m2 < 150:
            continue
        feats.append(
            {
                "type": "Feature",
                "properties": {
                    "id": f"osm-{el['type'][0]}{el['id']}",
                    "nome": tags.get("name") or None,
                    "tipo": kind,
                    "area_m2": round(area_m2),
                },
                "geometry": round_geom(mapping(geom.simplify(0.00002))),
            }
        )
    return {"type": "FeatureCollection", "features": feats}


def round_geom(g, nd=5):
    def r(c):
        if isinstance(c, (list, tuple)) and c and isinstance(c[0], (int, float)):
            return [round(c[0], nd), round(c[1], nd)]
        return [r(x) for x in c]

    return {"type": g["type"], "coordinates": r(g["coordinates"])}


# ---------------------------------------------------------------- Raster
def worldcover():
    print("WorldCover: lendo janela 10 m…")
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR"):
        with rasterio.open(WORLDCOVER_URL) as src:
            win = from_bounds(W, S, E, N, transform=src.transform)
            arr = src.read(1, window=win)
            tr = src.window_transform(win)
    print("  shape", arr.shape)
    return arr, tr


def landsat_lst():
    """Mediana da temperatura de superfície (°C) em cenas da seca, pouca nuvem."""
    print("Landsat: buscando cenas de seca…")
    cat = Client.open(
        "https://planetarycomputer.microsoft.com/api/stac/v1",
        modifier=planetary_computer.sign_inplace,
    )
    items = []
    for yr in (2025, 2024):
        search = cat.search(
            collections=["landsat-c2-l2"],
            bbox=[W, S, E, N],
            datetime=f"{yr}-08-01/{yr}-10-31",
            query={"eo:cloud_cover": {"lt": 10}, "platform": {"in": ["landsat-8", "landsat-9"]}},
        )
        items += list(search.items())
        if len(items) >= 4:
            break
    items = sorted(items, key=lambda i: i.properties["eo:cloud_cover"])[:5]
    if not items:
        print("  nenhuma cena — seguindo sem temperatura")
        return None
    print("  cenas:", [i.datetime.date().isoformat() for i in items])
    stack, ref = [], None
    for it in items:
        href = it.assets["lwir11"].href
        with rasterio.open(href) as src:
            if ref is None:
                xs, ys = warp_transform("EPSG:4326", src.crs, [W, E], [S, N])
                ref = {"crs": src.crs, "bounds": (min(xs), min(ys), max(xs), max(ys))}
            elif src.crs != ref["crs"]:
                continue
            win = from_bounds(*ref["bounds"], transform=src.transform)
            a = src.read(1, window=win, boundless=True, fill_value=0).astype("float32")
            ref.setdefault("transform", src.window_transform(win))
            ref.setdefault("shape", a.shape)
            if a.shape != ref["shape"]:
                continue
            a[a == 0] = np.nan
            stack.append(a * 0.00341802 + 149.0 - 273.15)
    lst = np.nanmedian(np.stack(stack), axis=0)
    return {
        "arr": lst,
        "crs": ref["crs"],
        "transform": ref["transform"],
        "datas": [i.datetime.date().isoformat() for i in items],
    }


def sample_lst(lst, lngs, lats):
    xs, ys = warp_transform("EPSG:4326", lst["crs"], list(lngs), list(lats))
    inv = ~lst["transform"]
    h, w = lst["arr"].shape
    out = []
    for x, y in zip(xs, ys):
        c, r = inv * (x, y)
        r, c = int(r), int(c)
        if 1 <= r < h - 1 and 1 <= c < w - 1:
            out.append(float(np.nanmean(lst["arr"][r - 1 : r + 2, c - 1 : c + 2])))
        else:
            out.append(float("nan"))
    return out


# ---------------------------------------------------------------- Main
def main():
    muni = municipio_polygon()
    muni_p = prep(muni)
    bairros = bairros_nodes()
    print(f"OSM: {len(bairros)} bairros/localidades")
    verdes = areas_verdes(muni)
    print(f"OSM: {len(verdes['features'])} áreas verdes")

    wc, tr = worldcover()
    h, w = wc.shape
    # centro de cada pixel -> célula H3 (a cada 2 px = 20 m, suficiente p/ fração)
    step = 2
    rows = np.arange(0, h, step)
    cols = np.arange(0, w, step)
    lons = tr.c + (cols + 0.5) * tr.a
    lats = tr.f + (rows + 0.5) * tr.e
    counts: dict[str, np.ndarray] = defaultdict(lambda: np.zeros(8, dtype=np.int32))
    idx = {TREE: 0, SHRUB: 1, GRASS: 2, CROP: 3, BUILT: 4, BARE: 5, WATER: 6, WETLAND: 7}
    print("Agregando pixels em hexágonos H3…")
    for ri, lat in zip(rows, lats):
        line = wc[ri, cols]
        for lon, cls in zip(lons, line):
            k = idx.get(int(cls))
            if k is None:
                continue
            counts[h3.latlng_to_cell(float(lat), float(lon), H3_RES)][k] += 1

    cells = []
    for cell, c in counts.items():
        lat, lng = h3.cell_to_latlng(cell)
        if not muni_p.contains(Point(lng, lat)):
            continue
        total = int(c.sum())
        if total < 50:
            continue
        land = total - int(c[6])
        water_frac = c[6] / total
        if land < 30 or water_frac > 0.6:
            continue  # rio/lagoa: não entra no mapa
        tree = c[0] / land
        verde = (c[0] + c[1] + c[2] + c[7]) / land
        built = c[4] / land
        if built < 0.03:
            continue  # zona rural distante: fora do recorte urbano
        cells.append(
            {"cell": cell, "lat": lat, "lng": lng, "tree": tree, "verde": verde,
             "built": built, "water": float(water_frac)}
        )
    print(f"  {len(cells)} hexágonos no município")

    lst = None
    try:
        lst = landsat_lst()
    except Exception as e:  # Planetary Computer fora do ar não pode quebrar o build
        print("  Landsat indisponível:", e)
    if lst:
        temps = sample_lst(lst, [c["lng"] for c in cells], [c["lat"] for c in cells])
        for c, t in zip(cells, temps):
            c["lst"] = None if math.isnan(t) else t

    # bairro = localidade OSM mais próxima (suburb tem prioridade sobre neighbourhood)
    b_arr = np.array([[b[1], b[2]] for b in bairros]) if bairros else None
    for c in cells:
        if b_arr is None:
            c["bairro"] = None
            continue
        d = (b_arr[:, 0] - c["lng"]) ** 2 + (b_arr[:, 1] - c["lat"]) ** 2
        c["bairro"] = bairros[int(np.argmin(d))][0]

    urban = [c for c in cells if c["built"] >= 0.25]
    temps_u = [c["lst"] for c in urban if c.get("lst") is not None]
    t_lo, t_hi = (np.percentile(temps_u, 5), np.percentile(temps_u, 95)) if temps_u else (0, 1)

    feats = []
    for c in cells:
        is_urban = bool(c["built"] >= 0.25)
        tree = c["tree"]
        if tree >= 0.25:
            classe = "arborizada"
        elif tree >= 0.12:
            classe = "moderada"
        elif tree >= 0.05:
            classe = "pouca"
        else:
            classe = "critica"
        heat = 0.5
        if c.get("lst") is not None:
            heat = float(np.clip((c["lst"] - t_lo) / max(t_hi - t_lo, 0.1), 0, 1))
        # Prioridade: só faz sentido onde há gente/construção
        falta = 1 - min(tree / 0.3, 1)
        score = (0.6 * falta + 0.4 * heat) * min(c["built"] / 0.5, 1) * 100 if is_urban else 0
        boundary = [[round(lng, 5), round(lat, 5)] for lat, lng in h3.cell_to_boundary(c["cell"])]
        boundary.append(boundary[0])
        feats.append(
            {
                "type": "Feature",
                "id": int(c["cell"], 16) % 2_147_483_647,
                "properties": {
                    "h3": c["cell"],
                    "bairro": c["bairro"],
                    "copa": round(tree * 100, 1),
                    "verde": round(c["verde"] * 100, 1),
                    "construido": round(c["built"] * 100, 1),
                    "temp": None if c.get("lst") is None else round(c["lst"], 1),
                    "urbano": is_urban,
                    "classe": classe,
                    "prioridade": round(score),
                },
                "geometry": {"type": "Polygon", "coordinates": [boundary]},
            }
        )

    # ranking por bairro (só urbano)
    agg: dict[str, list] = defaultdict(list)
    for f in feats:
        p = f["properties"]
        if p["urbano"] and p["bairro"]:
            agg[p["bairro"]].append(p)
    ranking = []
    for nome, ps in agg.items():
        if len(ps) < 4:
            continue
        ts = [p["temp"] for p in ps if p["temp"] is not None]
        lat = np.mean([h3.cell_to_latlng(p["h3"])[0] for p in ps])
        lng = np.mean([h3.cell_to_latlng(p["h3"])[1] for p in ps])
        ranking.append(
            {
                "bairro": nome,
                "hexagonos": len(ps),
                "copa": round(float(np.mean([p["copa"] for p in ps])), 1),
                "temp": round(float(np.mean(ts)), 1) if ts else None,
                "prioridade": round(float(np.mean([p["prioridade"] for p in ps]))),
                "criticos": sum(1 for p in ps if p["classe"] == "critica"),
                "centro": [round(float(lng), 5), round(float(lat), 5)],
            }
        )
    ranking.sort(key=lambda r: -r["prioridade"])

    urb = [f["properties"] for f in feats if f["properties"]["urbano"]]
    meta = {
        "gerado_em": date.today().isoformat(),
        "fontes": {
            "cobertura": "ESA WorldCover 2021 v200 (10 m) — CC BY 4.0",
            "temperatura": (
                f"Landsat 8/9 C2 L2, temperatura de superfície (mediana de {len(lst['datas'])} cenas: "
                + ", ".join(lst["datas"]) + ") — USGS via Microsoft Planetary Computer"
            ) if lst else None,
            "osm": "© OpenStreetMap contributors (ODbL)",
        },
        "h3_res": H3_RES,
        "totais": {
            "hexagonos": len(feats),
            "urbanos": len(urb),
            "copa_urbana_media": round(float(np.mean([p["copa"] for p in urb])), 1) if urb else None,
            "temp_urbana_media": round(float(np.mean([p["temp"] for p in urb if p["temp"] is not None])), 1)
            if any(p["temp"] is not None for p in urb) else None,
            "criticos": sum(1 for p in urb if p["classe"] == "critica"),
            "arborizados": sum(1 for p in urb if p["classe"] == "arborizada"),
            "areas_verdes_osm": len(verdes["features"]),
            "areas_verdes_ha": round(sum(f["properties"]["area_m2"] for f in verdes["features"]) / 10_000),
        },
        "temp_escala": [round(float(t_lo), 1), round(float(t_hi), 1)],
    }

    dump = lambda p, o: p.write_text(json.dumps(o, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    dump(OUT / "hex-verde.geojson", {"type": "FeatureCollection", "features": feats})
    dump(OUT / "areas-verdes.geojson", verdes)
    dump(OUT / "bairros-verde.json", ranking)
    (OUT / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(meta["totais"], ensure_ascii=False, indent=2))
    print("Top 10 prioridade:", [(r["bairro"], r["prioridade"], r["copa"], r["temp"]) for r in ranking[:10]])


if __name__ == "__main__":
    main()
