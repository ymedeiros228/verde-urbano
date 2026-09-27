import json
import time
import urllib.parse
import urllib.request

UA = {"User-Agent": "VerdeUrbanoExtensao/1.0 (educacional; ymedeiros228@gmail.com)"}

QUERIES = [
    "Parque da Cidade, Teresina, Piauí",
    "Avenida Frei Serafim, Centro, Teresina",
    "Viveiro Zona Leste, Ininga, Teresina",
    "Praça 16 de Agosto, São Cristóvão, Teresina",
    "Praça Aerolino de Abreu, Teresina",
    "Praça das Palmeiras, Buenos Aires, Teresina",
    "Mercado do Morada Nova, Teresina",
    "Praça Áurea Brandão, Teresina",
    "Praça Demóstenes Avelino, Teresina",
    "Renascença II, Teresina, Piauí",
    "Jockey Club, Teresina",
    "Parque Potycabana, Teresina",
    "Rio Poti, Todos os Santos, Teresina",
    "Ininga, Teresina",
    "Fátima, Teresina, Piauí",
]


def main() -> None:
    for q in QUERIES:
        url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
            {"q": q, "format": "json", "limit": 2, "countrycodes": "br"}
        )
        req = urllib.request.Request(url, headers=UA)
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                data = json.load(r)
        except Exception as e:
            print("ERR", q, e)
            time.sleep(1.2)
            continue
        print("---", q)
        if not data:
            print("  NOT FOUND")
        for d in data:
            print(
                f"  {d['lat']}, {d['lon']} | {d.get('display_name', '')[:90]}"
            )
        time.sleep(1.15)


if __name__ == "__main__":
    main()
