# Verde Urbano — plano de melhorias (set/2026)

Objetivo: app bonito, fluido e honesto sobre Teresina — mapear onde há e onde falta árvore com **dados reais**, e transformar isso em pedidos e mutirões.

## Feito nesta rodada

### 1. Mapa com dados reais (substitui o "calor" inventado)
- `scripts/build_mapa_verde.py` gera `public/map/*` a partir de:
  - **ESA WorldCover 2021 (10 m)** → % de copa, % construído, água (rio/lagoas saem do mapa)
  - **Landsat 8/9 (Planetary Computer)** → temperatura de superfície, mediana da seca 2025
  - **OpenStreetMap** → limite do município (corta Timon), 458 bairros, 680 parques/praças
- Grade **H3 res 9** (~0,1 km²): 1.884 hexágonos, 1.247 urbanos.
- **Índice de prioridade** = 60% falta de copa + 40% calor, ponderado pela densidade construída.
- Rodar de novo: `uv run scripts/build_mapa_verde.py` (cache OSM em `scripts/.cache/`).

### 2. Tela do mapa (`/mapear`)
- 3 lentes (Prioridade · Copa · Calor) com troca suave, legenda com a mesma escala de cor.
- Hover com tooltip, clique abre o "raio-x" da quadra comparando com a média da cidade.
- Parques/praças do OSM com nome, satélite, modo 3D, busca por bairro, ranking de bairros.
- **Marcar ponto**: pino fixo no centro → arrasta até o local → foto real (câmera) → demanda.
  O ponto sai assinado com nome/bairro do perfil e a urgência parte do índice de satélite.

### 3. Perfil e contas
- Cadastro pede nome + bairro; `useAuth().perfil`, `updatePerfil`.
- Modo demo (sem Supabase): perfil e pontos no aparelho, foto comprimida (não some ao recarregar).
- Com Supabase: `supabase/migrations/002_autor_e_fotos.sql` (coluna `autor_nome`, bucket `fotos`, RLS por pasta do usuário).

### 4. Front
- Landing nova: Teresina em 3D girando, números reais, ranking, "três jeitos de ler a cidade".
- Feed: saudação + retrato do bairro do usuário, cards novos, faixa de bairros corrigida.
- Guias: galeria de árvores nativas com fotos novas (Commons, créditos em `public/especies/CREDITOS.txt`).
- Mutirões: selo de data, vagas, estado "você vai participar".
- Detalhe do ponto: mini-mapa + raio-x da quadra + autor.
- Correções: hydration (engajamento e pontos locais), números em pt-BR.

## Próximos passos (em ordem de impacto)
1. **Supabase de verdade** — criar projeto free, rodar migrations 001 e 002, preencher `.env.local` (e na Vercel). Aí os pontos marcados viram públicos para todos.
2. **Deploy** — commit + push e deploy na Vercel (o site atual está com uma versão antiga que não existe mais no código local).
3. **Moderação leve** — painel de gestão: fila de pontos novos com foto (aprovar/recusar).
4. **Atualização anual dos dados** — rodar o script com a nova seca (ago–out) e comparar anos ("Teresina ganhou X ha de copa").
5. **Compartilhar** — imagem de card do bairro (OG image) para WhatsApp/Instagram.
6. **Performance** — carregar o MapLibre sob demanda na landing (hoje ~420 kB no first load).
