# Gera todas as figuras da documentação (código, diagramas, mapa, QR).
import json, re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from pygments import lex
from pygments.lexers import get_lexer_by_name
from pygments.token import Token
import qrcode
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.path import Path as MPath
from matplotlib.patches import PathPatch, Circle, Polygon as MPoly
from matplotlib.collections import PolyCollection

ROOT = Path(r"C:\Users\Yuri\Documents\trabalho de extensao")
OUT = Path(__file__).parent / "figs"
OUT.mkdir(exist_ok=True)
F = r"C:\Windows\Fonts"
MONO = F + r"\CascadiaMono.ttf"
ARIAL, ARIALB = F + r"\arial.ttf", F + r"\arialbd.ttf"

FOLHA, FOLHA_L, IPE, LATERITA, RIO, TINTA, SOL = "#1A5C3A", "#2D8A58", "#E8B84A", "#B54A2A", "#2A6B7C", "#1C2B22", "#F3F6F1"

# ------------------------------------------------------------------ código
THEME = {  # One Dark adaptado
    "bg": "#1E2227", "bar": "#16191D", "fg": "#ABB2BF", "ln": "#4B5263",
    Token.Keyword: "#C678DD", Token.Keyword.Type: "#E5C07B", Token.Name.Function: "#61AFEF",
    Token.Name.Builtin: "#56B6C2", Token.Name.Class: "#E5C07B", Token.String: "#98C379",
    Token.Literal.String: "#98C379", Token.Number: "#D19A66", Token.Literal.Number: "#D19A66",
    Token.Comment: "#7F848E", Token.Operator: "#56B6C2", Token.Name.Tag: "#E06C75",
    Token.Name.Attribute: "#D19A66", Token.Name.Decorator: "#61AFEF",
    Token.Name.Other: "#E06C75", Token.Name.Property: "#E06C75",
}

def color_for(tt):
    while tt is not Token:
        if tt in THEME:
            return THEME[tt]
        tt = tt.parent
    return THEME["fg"]

def extract(rel, start, end):
    lines = (ROOT / rel).read_text(encoding="utf8").splitlines()
    return "\n".join(lines[start - 1:end]), start

def code_image(name, rel, start, end, lang, skip=None, first_line=None):
    src, _ = extract(rel, start, end)
    lines = src.split("\n")
    if skip:  # remove intervalos (1-based relativos ao arquivo) e marca com "…"
        keep, cur = [], start
        for ln in lines:
            if any(a <= cur <= b for a, b in skip):
                if any(cur == a for a, b in skip):
                    keep.append((None, "-- … (demais políticas omitidas)" if lang == "sql" else "// …"))
            else:
                keep.append((cur, ln))
            cur += 1
    else:
        keep = [(start + i, l) for i, l in enumerate(lines)]
    S = 2  # escala retina
    fs = 15 * S
    font = ImageFont.truetype(MONO, fs)
    fb = ImageFont.truetype(ARIAL, 13 * S)
    lh = int(fs * 1.5)
    cw = font.getlength("M")
    maxlen = max(len(l.expandtabs(2)) for _, l in keep)
    gutter = int(cw * 4.5)
    pad = 22 * S
    bar = 38 * S
    W = max(int(pad * 2 + gutter + cw * max(maxlen, 60)), 1000 * S // 1)
    H = bar + pad * 2 + lh * len(keep)
    img = Image.new("RGB", (W, H), THEME["bg"])
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, bar], fill=THEME["bar"])
    for i, c in enumerate(["#FF5F57", "#FEBC2E", "#28C840"]):
        cx = 22 * S + i * 20 * S
        d.ellipse([cx - 6 * S, bar / 2 - 6 * S, cx + 6 * S, bar / 2 + 6 * S], fill=c)
    title = rel.replace("\\", "/")
    tw = fb.getlength(title)
    d.text(((W - tw) / 2, bar / 2 - 8 * S), title, font=fb, fill="#9DA5B4")
    lexer = get_lexer_by_name(lang)
    y = bar + pad
    for num, text in keep:
        if num is None:
            d.text((pad + gutter, y), text, font=font, fill=THEME["ln"])
            y += lh
            continue
        n = str(num)
        d.text((pad + gutter - cw * (len(n) + 1.5), y), n, font=font, fill=THEME["ln"])
        x = pad + gutter
        for tt, val in lex(text.expandtabs(2), lexer):
            val = val.rstrip("\n")
            if not val:
                continue
            d.text((x, y), val, font=font, fill=color_for(tt))
            x += font.getlength(val)
        y += lh
    img.save(OUT / f"{name}.png", dpi=(300, 300))
    print("ok", name, img.size)

def loc(rel, pat, after=1):
    """Número (1-based) da primeira linha que contém `pat`, a partir de `after`."""
    lines = (ROOT / rel).read_text(encoding="utf8").splitlines()
    for i in range(after - 1, len(lines)):
        if pat in lines[i]:
            return i + 1
    raise ValueError(f"âncora não encontrada: {rel}: {pat}")

def rng(rel, start_pat, end_pat, end_offset=0):
    s = loc(rel, start_pat)
    return s, loc(rel, end_pat, s) + end_offset

def _codes():
    sch = "supabase/migrations/001_initial_schema.sql"
    mig2 = "supabase/migrations/002_autor_e_fotos.sql"
    mw = "src/middleware.ts"
    ud = "src/hooks/useDemandas.ts"
    py = "scripts/build_mapa_verde.py"
    vd = "src/lib/map/verde.ts"
    mp = "src/components/mapa/Mapa.tsx"
    nv = "src/app/(cidadao)/pontos/novo/page.tsx"
    lp = "src/lib/localPontos.ts"
    gj = "src/lib/map/exportGeoJSON.ts"
    s_rls, e_rls = loc(sch, "alter table public.perfis enable"), loc(sch, "execute function public.handle_new_user")
    sk = (loc(sch, 'create policy "votos_select"'), loc(sch, 'create policy "perfis_update_own"') - 1)
    s_mp = loc(mp, "lente / camadas")
    return [
        ("code_schema", sch, *rng(sch, "create table if not exists public.pontos", ");"), "sql", None),
        ("code_rls", sch, s_rls, e_rls, "sql", [sk]),
        ("code_storage", mig2, *rng(mig2, "-- bucket público", "storage.foldername"), "sql", None),
        ("code_middleware", mw, 1, len((ROOT / mw).read_text(encoding="utf8").splitlines()), "tsx", None),
        ("code_usedemandas", ud, *rng(ud, "async function fetchDemandasFeed", "return mergeWithLocal(base)", 1), "tsx", None),
        ("code_prioridade", py, *rng(py, "urban = [c for c in cells", '"geometry": {"type": "Polygon"'), "python", None),
        ("code_corexpr", vd, *rng(vd, "export function corExpr", "return interp;", 1), "tsx", None),
        ("code_mapa", mp, s_mp, loc(mp, "}, [ready, styleEpoch, lente", s_mp), "tsx", None),
        ("code_gps", nv, *rng(nv, "function capturarGPS", "router.push(", 1), "tsx", None),
        ("code_localpontos", lp, *rng(lp, "export function addLocalPonto", "return [...local.filter", 1), "tsx", None),
        ("code_geojson", gj, 1, len((ROOT / gj).read_text(encoding="utf8").splitlines()), "tsx", None),
    ]

CODES = _codes()

# ------------------------------------------------------------------ diagramas (matplotlib)
plt.rcParams["font.family"] = "Arial"

def box(ax, x, y, w, h, title, lines=(), fc="#FFFFFF", ec=FOLHA, tc=FOLHA, lw=1.6, head=None):
    from matplotlib.patches import FancyBboxPatch
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=0.12",
                                fc=fc, ec=ec, lw=lw, zorder=2))
    if head:
        ax.add_patch(FancyBboxPatch((x, y + h - 0.42), w, 0.42, boxstyle="round,pad=0,rounding_size=0.12",
                                    fc=head, ec=head, lw=0, zorder=3))
        ax.add_patch(plt.Rectangle((x, y + h - 0.42), w, 0.2, fc=head, ec=head, zorder=3))
        ax.text(x + w / 2, y + h - 0.21, title, ha="center", va="center", fontsize=10.5,
                fontweight="bold", color="white", zorder=4)
        n = len(lines)
        ty = y + (h - 0.42) / 2 + (n - 1) * 0.28 / 2
    else:
        ax.text(x + w / 2, y + h - 0.25, title, ha="center", va="center", fontsize=10.5,
                fontweight="bold", color=tc, zorder=4)
        ty = y + h - 0.55
    for i, l in enumerate(lines):
        ax.text(x + w / 2, ty - i * 0.28, l, ha="center", va="center", fontsize=8.6, color=TINTA, zorder=4)

def arrow(ax, a, b, text=None, color="#4A5C52", style="-|>", ls="-", off=(0, 0.12)):
    ax.annotate("", xy=b, xytext=a, arrowprops=dict(arrowstyle=style, color=color, lw=1.4,
                ls=ls, shrinkA=2, shrinkB=2), zorder=1)
    if text:
        mx, my = (a[0] + b[0]) / 2 + off[0], (a[1] + b[1]) / 2 + off[1]
        ax.text(mx, my, text, ha="center", va="center", fontsize=7.8, color="#4A5C52",
                bbox=dict(fc="white", ec="none", pad=1.2), zorder=5)

def arquitetura():
    fig, ax = plt.subplots(figsize=(11, 6.6), dpi=220)
    ax.set_xlim(0, 16.6); ax.set_ylim(0, 9.4); ax.axis("off")
    bands = [(6.4, "#EEF5EF", FOLHA, "APRESENTAÇÃO\n(cliente · PWA)"),
             (3.3, "#F7F3E6", "#C98A2E", "APLICAÇÃO\n(Vercel · Next.js)"),
             (0.2, "#EAF1F3", RIO, "DADOS E\nSERVIÇOS")]
    for y, fc, c, t in bands:
        ax.add_patch(plt.Rectangle((0.2, y), 16.2, 2.8, fc=fc, ec="none"))
        ax.add_patch(plt.Rectangle((0.2, y), 0.9, 2.8, fc=c, ec="none"))
        ax.text(0.65, y + 1.4, t, rotation=90, ha="center", va="center", fontsize=7.6, fontweight="bold", color="white", linespacing=1.1)
    X = [1.5, 6.5, 11.5]; W = 4.5; H = 2.05
    rows = [
        (6.78, FOLHA, [("App Cidadão", ["Feed · Mapear · Mutirões", "Guias SEMAM · Perfil", "rotas (cidadao)/*"], FOLHA),
                       ("Painel de Gestão", ["KPIs · Demandas · Mapa", "Relatórios · Espécies", "rotas (gestao)/gestao/*"], FOLHA_L),
                       ("Motor de Mapas", ["MapLibre GL JS (WebGL)", "Hexágonos H3 · pins", "lentes prioridade/copa/calor"], RIO)]),
        (3.68, "#C98A2E", [("Next.js App Router", ["React 18 · TypeScript", "Tailwind CSS · Recharts", "Server + Client Components"], "#C98A2E"),
                           ("Middleware (Edge)", ["Sessão Supabase SSR", "Renovação de cookies/JWT", "Redirecionamentos"], "#C98A2E"),
                           ("Camada de Dados", ["TanStack Query (cache)", "Fallback: mock tipado", "localStorage (demo offline)"], "#C98A2E")]),
        (0.58, RIO, [("Supabase", ["PostgreSQL + RLS", "Auth (JWT) · Storage", "Trigger de perfis"], RIO),
                     ("Mapa Verde (estático)", ["/public/map/*.geojson", "Pipeline Python offline", "ESA · Landsat · OSM"], RIO),
                     ("Tiles de Mapa", ["OpenFreeMap (vetorial)", "Esri World Imagery", "Sem chave de API"], RIO)]),
    ]
    for y, _, items in rows:
        for x, (t, l, c) in zip(X, items):
            box(ax, x, y, W, H, t, l, ec=c, head=c)
    for x in X:
        arrow(ax, (x + W / 2, 6.78), (x + W / 2, 5.73))
    ax.text(X[0] + W / 2 + 0.1, 6.25, "HTTPS", fontsize=7.6, color="#4A5C52", ha="left", va="center")
    ax.text(X[1] + W / 2 + 0.1, 6.25, "HTTPS", fontsize=7.6, color="#4A5C52", ha="left", va="center")
    ax.text(X[2] + W / 2 + 0.1, 6.25, "hooks React", fontsize=7.6, color="#4A5C52", ha="left", va="center")
    arrow(ax, (X[0] + W, 4.7), (X[1], 4.7)); arrow(ax, (X[1] + W, 4.7), (X[2], 4.7))
    arrow(ax, (X[2] + 0.8, 3.68), (X[0] + W / 2, 2.63))
    arrow(ax, (X[2] + 1.6, 3.68), (X[1] + W / 2, 2.63))
    arrow(ax, (X[2] + W - 0.5, 3.68), (X[2] + W - 0.5, 2.63), ls="--", color=RIO)
    ax.text(X[0] + W + 0.9, 3.05, "SQL / Auth", fontsize=7.6, color="#4A5C52", bbox=dict(fc="#EAF1F3", ec="none", pad=1))
    ax.text(X[1] + W / 2 + 1.3, 2.9, "GeoJSON", fontsize=7.6, color="#4A5C52", bbox=dict(fc="#EAF1F3", ec="none", pad=1))
    ax.text(X[2] + W - 0.4, 3.1, "tiles", fontsize=7.6, color=RIO)
    fig.savefig(OUT / "diag_arquitetura.png", bbox_inches="tight", facecolor="white")
    plt.close(fig)

def pipeline():
    fig, ax = plt.subplots(figsize=(11, 4.4), dpi=220)
    ax.set_xlim(0, 17); ax.set_ylim(0, 6.4); ax.axis("off")
    box(ax, 0.2, 4.1, 3.6, 1.9, "ESA WorldCover", ["Cobertura do solo 10 m", "Árvore · construído · água"], ec=FOLHA, head=FOLHA)
    box(ax, 0.2, 2.1, 3.6, 1.9, "Landsat 8/9 (USGS)", ["Temperatura de superfície", "Mediana · seca ago–out"], ec=LATERITA, head=LATERITA)
    box(ax, 0.2, 0.1, 3.6, 1.9, "OpenStreetMap", ["Limite municipal · bairros", "Parques e praças"], ec=RIO, head=RIO)
    box(ax, 5.0, 1.2, 3.9, 3.9, "Agregação H3", ["Grade hexagonal res. 9", "(≈ 0,1 km² por célula)", "", "% copa · % verde", "% construído · °C", "bairro mais próximo"], ec="#C98A2E", head="#C98A2E")
    box(ax, 10.0, 1.2, 3.2, 3.9, "Índice (0–100)", ["prioridade de plantio", "", "0,6 × falta de copa", "+ 0,4 × calor", "× densidade urbana"], ec=FOLHA_L, head=FOLHA_L)
    box(ax, 14.2, 0.1, 2.6, 5.9, "Saídas", ["hex-verde", ".geojson", "", "areas-verdes", ".geojson", "", "bairros-verde", ".json", "", "meta.json"], ec=TINTA, head=TINTA)
    for y in (5.05, 3.05, 1.05):
        arrow(ax, (3.8, y), (5.0, 3.15))
    arrow(ax, (8.9, 3.15), (10.0, 3.15))
    arrow(ax, (13.2, 3.15), (14.2, 3.15))
    fig.savefig(OUT / "diag_pipeline.png", bbox_inches="tight", facecolor="white")
    plt.close(fig)

def er():
    fig, ax = plt.subplots(figsize=(11, 6.4), dpi=220)
    ax.set_xlim(0, 17); ax.set_ylim(0, 10); ax.axis("off")
    def ent(x, y, w, name, cols):
        h = 0.5 + 0.34 * len(cols)
        box(ax, x, y, w, h, name, [], ec=FOLHA, head=FOLHA)
        for i, (c, t) in enumerate(cols):
            yy = y + h - 0.68 - i * 0.34
            bold = c.startswith("🔑") or c.startswith("PK") or c.startswith("FK")
            ax.text(x + 0.15, yy, c, fontsize=8.2, color=LATERITA if c.startswith(("PK", "FK")) else TINTA,
                    fontweight="bold" if bold else "normal", va="center", zorder=5)
            ax.text(x + w - 0.15, yy, t, fontsize=7.8, color="#7A8B82", ha="right", va="center", zorder=5)
        return h
    ent(0.2, 5.6, 4.2, "auth.users", [("PK id", "uuid"), ("email", "text"), ("raw_user_meta_data", "jsonb")])
    ent(0.2, 1.0, 4.2, "perfis", [("PK/FK id", "uuid"), ("nome", "text"), ("role", "user_role"), ("bairro", "text"), ("created_at", "timestamptz")])
    ent(6.2, 0.4, 4.6, "pontos", [("PK id", "uuid"), ("FK user_id", "uuid"), ("titulo · descricao", "text"), ("bairro · local", "text"),
                                 ("tipo", "tipo_ponto"), ("status", "status_ponto"), ("votos · urgencia", "int"),
                                 ("lng · lat", "double"), ("foto_url", "text"), ("necessidades", "text[]"),
                                 ("ong_recomendado", "boolean"), ("mutirao_data", "text"), ("autor_nome", "text")])
    ent(12.4, 6.0, 4.4, "votos", [("PK id", "uuid"), ("FK ponto_id", "uuid"), ("FK user_id", "uuid"), ("UNIQUE(ponto,user)", "")])
    ent(12.4, 0.6, 4.4, "mutiroes", [("PK id", "uuid"), ("FK demanda_id", "uuid"), ("titulo · local · bairro", "text"),
                                   ("data · horario", "date/text"), ("voluntarios", "int"), ("capacidade", "int"), ("ong · tipo", "text")])
    ent(6.2, 6.9, 4.6, "especies", [("PK id", "text"), ("nome · cientifico", "text"), ("porte · raiz · sombra", "text"), ("observacao", "text")])
    arrow(ax, (2.3, 5.6), (2.3, 3.2), "1 : 1  (trigger)", style="-")
    arrow(ax, (4.4, 6.3), (6.2, 4.5), "1 : N", style="-")
    arrow(ax, (10.8, 3.3), (12.4, 6.6), "1 : N", style="-")
    arrow(ax, (10.8, 2.0), (12.4, 2.0), "1 : N", style="-")
    ax.plot([1.2, 1.2, 14.6, 14.6], [6.88, 9.75, 9.75, 7.94], color="#4A5C52", lw=1.4, zorder=1)
    ax.text(8.5, 9.75, "1 : N  (usuário apoia pontos)", ha="center", va="center", fontsize=7.8, color="#4A5C52", bbox=dict(fc="white", ec="none", pad=1.2))
    fig.savefig(OUT / "diag_er.png", bbox_inches="tight", facecolor="white")
    plt.close(fig)

# ------------------------------------------------------------------ mapa real
def mapa_prioridade():
    hexes = json.loads((ROOT / "public/map/hex-verde.geojson").read_text(encoding="utf8"))
    areas = json.loads((ROOT / "public/map/areas-verdes.geojson").read_text(encoding="utf8"))
    from matplotlib.colors import LinearSegmentedColormap
    stops = [(0, "#CFE3C8"), (30, "#E9D9A0"), (55, "#EDAF5B"), (75, "#D0683A"), (90, "#9E3322")]
    cmap = LinearSegmentedColormap.from_list("p", [(v / 90, c) for v, c in stops])
    polys, vals, rural = [], [], []
    for f in hexes["features"]:
        ring = f["geometry"]["coordinates"][0]
        p = f["properties"]
        if p["urbano"]:
            polys.append(ring); vals.append(min(p["prioridade"], 90))
        else:
            rural.append(ring)
    fig, ax = plt.subplots(figsize=(8, 9.4), dpi=220)
    ax.add_collection(PolyCollection(rural, facecolors="#DDEBD6", edgecolors="white", linewidths=0.25))
    pc = PolyCollection(polys, array=vals, cmap=cmap, edgecolors="white", linewidths=0.25)
    pc.set_clim(0, 90)
    ax.add_collection(pc)
    for f in areas["features"]:
        g = f["geometry"]
        rings = [g["coordinates"][0]] if g["type"] == "Polygon" else [pp[0] for pp in g["coordinates"]]
        for r in rings:
            ax.add_patch(MPoly(r, closed=True, fc=FOLHA_L, ec=FOLHA, lw=0.3, alpha=0.8))
    xs=[c[0] for r in polys+rural for c in r]; ys=[c[1] for r in polys+rural for c in r]
    ax.set_xlim(min(xs)-0.01, max(xs)+0.01); ax.set_ylim(min(ys)-0.01, max(ys)+0.035); ax.set_aspect(1 / abs(__import__("math").cos(5.09 * 3.14159 / 180)))
    ax.axis("off")
    cb = fig.colorbar(pc, ax=ax, orientation="horizontal", fraction=0.035, pad=0.02, aspect=40)
    cb.set_label("Índice de prioridade de arborização (0 = baixa · 90+ = urgente)", fontsize=9)
    cb.ax.tick_params(labelsize=8)
    # norte
    ax.annotate("N", xy=(0.95, 0.97), xytext=(0.95, 0.9), xycoords="axes fraction", ha="center", fontsize=11,
                fontweight="bold", arrowprops=dict(arrowstyle="-|>", color=TINTA, lw=1.6))
    fig.savefig(OUT / "mapa_prioridade.png", bbox_inches="tight", facecolor="white")
    plt.close(fig)

def ranking():
    b = json.loads((ROOT / "public/map/bairros-verde.json").read_text(encoding="utf8"))
    b = [x for x in b if x["hexagonos"] >= 3][:12][::-1]
    fig, ax = plt.subplots(figsize=(9, 5.2), dpi=220)
    cols = ["#9E3322" if x["prioridade"] >= 88 else "#D0683A" for x in b]
    ax.barh([x["bairro"] for x in b], [x["prioridade"] for x in b], color=cols, height=0.62)
    for i, x in enumerate(b):
        ax.text(x["prioridade"] + 0.8, i, f'{x["prioridade"]}  ·  copa {str(x["copa"]).replace(".", ",")}%  ·  {str(x["temp"]).replace(".", ",")} °C',
                va="center", fontsize=8.3, color=TINTA)
    ax.set_xlim(0, 125); ax.set_xticks([0, 20, 40, 60, 80, 100])
    ax.set_xlabel("Índice médio de prioridade (0–100)", fontsize=9.5)
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    ax.tick_params(labelsize=9)
    ax.grid(axis="x", color="#E5E9E3", lw=0.8); ax.set_axisbelow(True)
    fig.savefig(OUT / "ranking_bairros.png", bbox_inches="tight", facecolor="white")
    plt.close(fig)

# ------------------------------------------------------------------ logo + QR
def logo():
    fig, ax = plt.subplots(figsize=(4, 4), dpi=300)
    ax.set_xlim(0, 512); ax.set_ylim(512, 0); ax.axis("off")
    ax.add_patch(Circle((256, 256), 200, fc=FOLHA))
    C = MPath.CURVE4
    right = MPath([(256, 380), (256, 290), (326, 230), (396, 210), (376, 290), (326, 350), (256, 380)],
                  [MPath.MOVETO, C, C, C, C, C, C])
    left = MPath([(256, 380), (256, 290), (186, 230), (116, 210), (136, 290), (186, 350), (256, 380)],
                 [MPath.MOVETO, C, C, C, C, C, C])
    ax.add_patch(PathPatch(right, fc=FOLHA_L, ec="none"))
    ax.add_patch(PathPatch(left, fc="#3E9E6A", ec="none", alpha=0.85))
    ax.plot([256, 256], [380, 180], color=SOL, lw=9, solid_capstyle="round")
    ax.add_patch(Circle((340, 150), 28, fc=IPE))
    fig.savefig(OUT / "logo.png", transparent=True, bbox_inches="tight", pad_inches=0)
    plt.close(fig)

def qr(name, url, color):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=20, border=2)
    q.add_data(url); q.make(fit=True)
    img = q.make_image(fill_color=color, back_color="white").convert("RGB")
    # selo central com o logo
    lg = Image.open(OUT / "logo.png").convert("RGBA")
    s = img.size[0] // 4
    lg = lg.resize((s, s), Image.LANCZOS)
    pad = Image.new("RGBA", (s + 24, s + 24), (255, 255, 255, 255))
    pad.paste(lg, (12, 12), lg)
    img.paste(pad, ((img.size[0] - pad.size[0]) // 2, (img.size[1] - pad.size[1]) // 2))
    img.save(OUT / f"{name}.png")

if __name__ == "__main__":
    for c in CODES:
        code_image(*c)
    arquitetura(); pipeline(); er(); mapa_prioridade(); ranking(); logo()
    qr("qr_site", "https://vu-teresina.vercel.app", FOLHA)
    qr("qr_github", "https://github.com/ymedeiros228/verde-urbano", TINTA)
    print("fim")
