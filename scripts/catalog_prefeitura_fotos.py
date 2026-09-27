"""Lista matérias da Prefeitura (busca) e baixa og:images únicas."""
from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

UA = {"User-Agent": "VerdeUrbanoExtensao/1.0 (educacional; ymedeiros228@gmail.com)"}
OUT = Path(__file__).resolve().parents[1] / "public" / "fotos"

QUERIES = [
    "plantio",
    "mudas",
    "praça",
    "paisagismo",
    "canteiro",
    "limpeza",
    "lagoa",
    "parque",
    "arborização",
    "SEMAM",
]


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=35) as r:
        return r.read().decode("utf-8", "ignore")


def article_links(html: str) -> list[str]:
    links = re.findall(
        r'https://www\.teresina\.pi\.gov\.br/[a-z0-9\-]+/?',
        html,
        re.I,
    )
    skip = {
        "https://www.teresina.pi.gov.br/",
        "https://www.teresina.pi.gov.br/teresina/",
        "https://www.teresina.pi.gov.br/prefeito/",
        "https://www.teresina.pi.gov.br/secretarias-e-orgaos/",
        "https://www.teresina.pi.gov.br/editais/",
    }
    out: list[str] = []
    seen: set[str] = set()
    for u in links:
        u = u.rstrip("/") + "/"
        if u in skip or u in seen:
            continue
        if "/wp-" in u or "/category/" in u or "/tag/" in u or "/page/" in u:
            continue
        seen.add(u)
        out.append(u)
    return out


def og_image(html: str) -> str | None:
    m = re.search(
        r'property=["\']og:image["\']\s+content=["\']([^"\']+)', html, re.I
    ) or re.search(
        r'content=["\']([^"\']+)["\']\s+property=["\']og:image["\']', html, re.I
    )
    return m.group(1) if m else None


def title(html: str) -> str:
    m = re.search(r"<title>([^<]+)", html, re.I)
    if not m:
        return "?"
    t = m.group(1)
    t = re.sub(r"\s*[–\-].*$", "", t)
    return re.sub(r"&#\d+;", "", t).strip()


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        dest.write_bytes(r.read())


def main() -> None:
    articles: list[str] = []
    for q in QUERIES:
        url = "https://www.teresina.pi.gov.br/?s=" + urllib.parse.quote(q)
        try:
            html = fetch(url)
        except Exception as e:
            print("search fail", q, e)
            continue
        articles.extend(article_links(html))

    # dedupe preserve order
    seen: set[str] = set()
    uniq = []
    for a in articles:
        if a not in seen:
            seen.add(a)
            uniq.append(a)

    print(f"articles found: {len(uniq)}")
    catalog: list[dict] = []
    used_imgs: set[str] = set()
    for a in uniq[:40]:
        try:
            html = fetch(a)
        except Exception as e:
            print("fail", a, e)
            continue
        img = og_image(html)
        if not img or img in used_imgs:
            continue
        if "LOGO" in img.upper() or "brasao" in img.lower() or "cropped-" in img:
            continue
        used_imgs.add(img)
        t = title(html)
        catalog.append({"title": t, "url": a, "image": img})
        print(f"- {t[:70]}")
        print(f"  {img}")

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "prefeitura_catalog.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("saved", len(catalog), "to prefeitura_catalog.json")


if __name__ == "__main__":
    main()
