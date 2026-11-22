<img src="docs/readme/demo.webp" width="100%" alt="Verde Urbano sendo usado: capa com o mapa de calor de Teresina, mapa de onde falta sombra e feed de demandas da cidade" />

<h1 align="center">Verde Urbano</h1>

<p align="center"><b>Teresina precisa de sombra.</b><br/>
Plataforma colaborativa que mostra, quadra por quadra, onde falta árvore na cidade<br/>
e transforma isso em plantio, mutirão e cobrança aos órgãos certos.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/MapLibre-mapa%20de%20calor-396cb2?style=flat-square&logo=maplibre&logoColor=white" alt="MapLibre" />
  <img src="https://img.shields.io/badge/Supabase-3ecf8e?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PWA-celular-5a0fc8?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/custo-R%240%20(free%20tier)-15803d?style=flat-square" alt="Custo zero" />
</p>

---

## O problema

Teresina é uma das capitais mais quentes do Brasil, e a falta de árvore não é igual em todo lugar: tem bairro com sombra e bairro
onde o chão chega a 46 °C. Sem dado, o plantio vai para onde é mais fácil, e não para onde é mais urgente.

## A solução

O Verde Urbano **mede cada quadra pela imagem de satélite** (onde tem copa, onde o chão esquenta e onde plantar primeiro) e coloca
isso num mapa que qualquer pessoa entende. Em cima do mapa, o cidadão aponta problemas, apoia demandas e se junta a mutirões,
e encontra o órgão certo para pedir muda, poda ou denunciar.

## Telas

<p align="center"><img src="docs/readme/tela-inicio.png" width="100%" alt="Capa com o mapa de calor de Teresina" /></p>
<p align="center">
  <img src="docs/readme/tela-mapa.png" width="49%" alt="Mapa de onde falta sombra, com ranking de bairros" />
  <img src="docs/readme/tela-feed.png" width="49%" alt="Feed de demandas da cidade" />
</p>
<p align="center">
  <img src="docs/readme/cel-inicio.png" width="28%" alt="Capa no celular" />
  <img src="docs/readme/cel-mapear.png" width="28%" alt="Mapa no celular" />
  <img src="docs/readme/cel-feed.png" width="28%" alt="Feed no celular" />
</p>

## O que tem

| Parte | O que faz |
|---|---|
| **Mapa de calor** | Hexágonos por quadra com camadas de prioridade, copa e calor, busca por bairro e ranking dos bairros que mais precisam |
| **Mapear** | O cidadão marca no mapa onde falta árvore, onde tem muda para plantar ou um espaço para revitalizar |
| **Feed da cidade** | Demandas por tipo (terreno baldio, praça, canteiro), "em alta", apoios e mutirões agendados |
| **Guias e órgãos** | Quem cuida de quê (SEMAM e órgãos parceiros), viveiros, perguntas frequentes e como denunciar |
| **Painel de gestão** | Indicadores, mapa de calor, gráficos e exportação em GeoJSON |

## Como foi feito

`Next.js 14` · `Tailwind` · `MapLibre` · `Recharts` · `TanStack Query` · `Supabase` · `PWA`

Roda **sem custo**: Vercel Hobby, Supabase Free e mapas do OpenFreeMap. Funciona com dados de exemplo mesmo sem banco.

## Como rodar

```bash
npm install
npm run dev
```

| Página | Endereço |
|---|---|
| Capa | `http://localhost:3000` |
| Mapa | `/mapear` |
| Feed | `/feed` |
| Guias | `/guias` |
| Painel | `/gestao` |

<sub>Conteúdo institucional baseado nas páginas públicas da SEMAM e da Prefeitura de Teresina. As fotos do feed são públicas, do portal da Prefeitura.</sub>

---

<p align="center">Projeto de extensão universitária · feito por <a href="https://github.com/ymedeiros228"><b>Yuri Medeiros</b></a> · <a href="https://www.linkedin.com/in/yuri-medeiros-1071533b4/">LinkedIn</a></p>
