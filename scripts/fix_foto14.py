import re
import urllib.request
from pathlib import Path

UA = {"User-Agent": "VerdeUrbanoExtensao/1.0"}
OUT = Path(__file__).resolve().parents[1] / "public" / "fotos" / "14.jpg"

URLS = [
    "https://www.teresina.pi.gov.br/sdu-leste-amplia-acoes-de-limpeza-urbana-e-conclui-ciclos-de-manutencao-em-bairros-de-teresina/",
    "https://www.teresina.pi.gov.br/prefeitura-de-teresina-adota-novo-modelo-de-mutirao-de-limpeza-em-parceria-com-as-sdus/",
    "https://www.teresina.pi.gov.br/sdu-nos-bairros-quatro-bairros-da-zona-sudeste-recebem-mutirao-de-limpeza-neste-fim-de-semana/",
]


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", "ignore")


def og_image(html: str) -> str | None:
    m = re.search(
        r'property=["\']og:image["\']\s+content=["\']([^"\']+)', html, re.I
    ) or re.search(
        r'content=["\']([^"\']+)["\']\s+property=["\']og:image["\']', html, re.I
    )
    return m.group(1) if m else None


def main() -> None:
    best = None
    best_size = 0
    best_url = None
    best_article = None
    for u in URLS:
        try:
            html = fetch(u)
        except Exception as e:
            print("fail", u, e)
            continue
        img = og_image(html)
        print(u.split("/")[-2], "->", img)
        if not img:
            continue
        req = urllib.request.Request(img, headers=UA)
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        print("  bytes", len(data))
        if len(data) > best_size:
            best = data
            best_size = len(data)
            best_url = img
            best_article = u

    if not best:
        raise SystemExit("no image")
    OUT.write_bytes(best)
    print("WROTE", OUT, best_size, "from", best_url)
    meta = Path(__file__).resolve().parents[1] / "public" / "fotos" / "_14_source.txt"
    meta.write_text(f"{best_article}\n{best_url}\n", encoding="utf-8")


if __name__ == "__main__":
    main()
