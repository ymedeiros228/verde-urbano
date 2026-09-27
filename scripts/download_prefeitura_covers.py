"""Baixa fotos oficiais da Prefeitura para demandas 6–14."""
from __future__ import annotations

import urllib.request
from pathlib import Path

UA = {"User-Agent": "VerdeUrbanoExtensao/1.0 (educacional; ymedeiros228@gmail.com)"}
OUT = Path(__file__).resolve().parents[1] / "public" / "fotos"

# local -> url (matérias distintas das fotos 1–5 / m*)
FILES = {
    "6.jpg": "https://www.teresina.pi.gov.br/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-22-at-11.04.54-e1779459160370.jpeg",
    "7.jpg": "https://www.teresina.pi.gov.br/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-27-at-13.05.42-3.jpeg",
    "8.jpg": "https://www.teresina.pi.gov.br/wp-content/uploads/2026/08/1-2.jpg",
    "9.jpg": "https://www.teresina.pi.gov.br/wp-content/uploads/2026/07/IMG_2200-scaled.jpg",
    "11.jpg": "https://www.teresina.pi.gov.br/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-02-at-11.21.06.jpeg",
    "12.jpg": "https://www.teresina.pi.gov.br/wp-content/uploads/2026/09/e6f7113c-3e14-4848-89c0-009058d51e57-scaled.jpeg",
    "13.jpg": "https://www.teresina.pi.gov.br/wp-content/uploads/2026/08/IMG-20260802-WA0007-scaled.jpg",
    "14.jpg": "https://www.teresina.pi.gov.br/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-04-at-10.19.08-1.jpeg",
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, url in FILES.items():
        dest = OUT / name
        print("GET", name)
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=90) as r:
            dest.write_bytes(r.read())
        print(" OK", dest.stat().st_size)
    # cleanup leftovers
    for p in OUT.glob("*.png"):
        p.unlink(missing_ok=True)
        print("DEL", p.name)
    cat = OUT / "prefeitura_catalog.json"
    if cat.exists():
        cat.unlink()
        print("DEL catalog")


if __name__ == "__main__":
    main()
