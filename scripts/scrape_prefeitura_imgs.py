"""Scrape Prefeitura/noticias for featured images."""
from __future__ import annotations

import re
import urllib.request

UA = {"User-Agent": "VerdeUrbanoExtensao/1.0 (educacional)"}

URLS = [
    "https://www.teresina.pi.gov.br/primeiro-dia-do-mutirao-de-limpeza-na-zona-norte-de-teresina/",
    "https://www.teresina.pi.gov.br/dia-d-de-atividades-do-projeto-sdu-nos-bairros-mobiliza-a-zona-norte/",
    "https://www.teresina.pi.gov.br/lagoa-do-sao-joaquim-ganha-cor-e-expressao-cultural-atraves-do-grafite/",
    "https://www.teresina.pi.gov.br/mercado-do-morada-nova-ganha-paisagismo-e-se-prepara-para-receber-novo-food-park-da-zona-sul/",
    "https://www.teresina.pi.gov.br/viveiro-de-plantas-da-zona-leste-de-teresina-disponibiliza-mudas-gratuitas-para-a-populacao/",
    "https://www.teresina.pi.gov.br/reflorestamento-na-zona-norte-une-orgaos-publicos-e-beneficia-comunidade-as-margens-do-rio-poty/",
    "https://www.teresina.pi.gov.br/sdu-centro-entrega-revitalizacao-do-canteiro-central-da-avenida-frei-serafim/",
    "https://www.pi.gov.br/semarh-realiza-blitz-ecologica-com-distribuicao-de-mudas-de-arvores-na-zona-leste-de-teresina/",
    "https://cidadeverde.com/geral/412962/apos-coleta-de-sementes-viveiro-inicia-producao-de-mudas-de-arvores-nativas-para-distribuir-em-teresina",
    "https://cidadeverde.com/geral/412639/mutirao-vai-coletar-sementes-de-arvores-nativas-para-plantio-em-teresina",
    "https://www.teresina.pi.gov.br/?s=pra%C3%A7a+dirceu",
    "https://www.teresina.pi.gov.br/?s=arboriza%C3%A7%C3%A3o",
]


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "ignore")


def main() -> None:
    for u in URLS:
        try:
            html = fetch(u)
        except Exception as e:
            print("FAIL", u, e)
            continue
        title_m = re.search(r"<title>([^<]+)", html, re.I)
        og = re.search(
            r'property=["\']og:image["\']\s+content=["\']([^"\']+)', html, re.I
        ) or re.search(
            r'content=["\']([^"\']+)["\']\s+property=["\']og:image["\']', html, re.I
        )
        print("---")
        print((title_m.group(1) if title_m else "?")[:90])
        print("URL:", u)
        print("OG:", og.group(1) if og else None)
        imgs = re.findall(
            r"https?://[^\"'\s]+(?:wp-content/uploads|cdn)[^\"'\s]+\.(?:jpg|jpeg|png|webp)",
            html,
            re.I,
        )
        seen: set[str] = set()
        for i in imgs:
            if i not in seen:
                seen.add(i)
                print(" ", i[:140])
                if len(seen) >= 8:
                    break


if __name__ == "__main__":
    main()
