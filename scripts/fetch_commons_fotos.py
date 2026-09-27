"""Baixa fotos CC do Wikimedia Commons para o demo Verde Urbano."""
from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path

UA = "VerdeUrbanoExtensao/1.0 (trabalho de extensao; contato: ymedeiros228@gmail.com)"
OUT = Path(__file__).resolve().parents[1] / "public" / "fotos"

# nome_local -> título File: no Commons
FILES: dict[str, str] = {
    "7.jpg": "Bairro Promorar em 2018.jpg",
    "6.jpg": "Mauricio Pokemon Parque da Cidade Teresina PI (40827528164).jpg",
    "9.jpg": "Lagoa do Norte (THE-PI).jpg",
    "11.jpg": "Teresina, palms, moon, wires.jpg",
    "12.jpg": "Fátima, Teresina, flowers.jpg",
    "13.jpg": "Um parque com carros estacionados em Teresina.jpg",
    "8.jpg": "Encontro dos Rios Parnaíba e Poty no ano de 2025, em outubro.jpg",
    "14.jpg": "Ermita Franciscana, Teresina, garden.jpg",
}


def api(params: dict) -> dict:
    q = urllib.parse.urlencode(params)
    req = urllib.request.Request(
        f"https://commons.wikimedia.org/w/api.php?{q}",
        headers={"User-Agent": UA},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        dest.write_bytes(r.read())


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    titles = "|".join(f"File:{n}" for n in FILES.values())
    data = api(
        {
            "action": "query",
            "titles": titles,
            "prop": "imageinfo",
            "iiprop": "url|size|mime",
            "format": "json",
        }
    )
    by_title = {p["title"]: p for p in data["query"]["pages"].values()}
    for local, commons_name in FILES.items():
        page = by_title.get(f"File:{commons_name}")
        if not page or "imageinfo" not in page:
            print("MISSING", commons_name)
            continue
        url = page["imageinfo"][0]["url"]
        dest = OUT / local
        print("GET", commons_name, "->", local)
        download(url, dest)
        print(" OK", dest.stat().st_size, "bytes")

    # remove AI placeholders
    for n in list(OUT.glob("*.png")):
        if n.stem.isdigit() or n.stem in {"6", "7", "8", "9", "11", "12", "13", "14"}:
            print("DEL", n.name)
            n.unlink()


if __name__ == "__main__":
    main()
