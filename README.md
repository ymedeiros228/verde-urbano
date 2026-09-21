# Verde Urbano · Teresina/PI

Plataforma colaborativa de mapeamento, arborização e revitalização comunitária.
Trabalho de extensão — **100% free tier**.

## Rodar

```bash
npm install
npm run dev
```

- Landing: [http://localhost:3000](http://localhost:3000)
- App cidadão: [/feed](http://localhost:3000/feed) · [/mapear](http://localhost:3000/mapear) (mapa de **calor** por padrão)
- Guias / SEMAM: [/guias](http://localhost:3000/guias)
- Painel: [/gestao](http://localhost:3000/gestao)

## Fonte institucional (importante)

Conteúdo de competências, viveiros, denúncias e notícias baseado em:

- [SEMAM — Prefeitura de Teresina](https://www.teresina.pi.gov.br/semam/)
- Notícias oficiais (categoria SEMAM) no portal da Prefeitura
- Competências: SEMAM, SAADs (ex-SDUs), BPA/PMPI, DCCA, SEMARH, MPPI

Arquivo: `src/lib/data/semam.ts`

## Fotos

Imagens do feed em `public/fotos/` (`1.jpg`…`5.jpg`, `m1.jpg`…).

Fonte atual: fotos públicas publicadas no portal da [Prefeitura de Teresina](https://www.teresina.pi.gov.br/) (SEMAM / ações de arborização, viveiros, plantios e revitalização). Créditos e links das matérias em `public/fotos/README.txt`.

O mock do feed (`src/lib/data/mock.ts`) espelha locais e ações das fotos oficiais — título e capa devem bater.

Para a caminhada fotográfica do piloto, substitua pelos mesmos nomes com fotos próprias e atualize o texto do card correspondente.

## O que tem

| Área | Conteúdo |
|------|----------|
| App cidadão | Feed + mapa de calor + mutirões + guias SEMAM |
| Painel | KPIs, heatmap, charts, export GeoJSON |
| Dados | Mock tipado; Supabase opcional |

## Stack

Next.js 14 · Tailwind · MapLibre · Recharts · TanStack Query · Supabase SSR · PWA

## Custo

R$ 0 obrigatório — Vercel Hobby + Supabase Free + OpenFreeMap
