import type { LngLatBoundsLike, LngLatLike } from 'maplibre-gl';

/** Bounding box aproximado de Teresina/PI */
export const TERESINA_BOUNDS: LngLatBoundsLike = [
  [-43.0, -5.3], // SW
  [-42.6, -4.88], // NE
];

/** Centro urbano (Praça da Bandeira / região central) */
export const TERESINA_CENTER: LngLatLike = [-42.775, -5.085];

export const DEFAULT_ZOOM = 11.6;
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 18;

/** Bairros do piloto com demanda no feed (coords reais OSM) */
export const BAIRROS_PRIORITARIOS = [
  'Todos os Santos',
  'Parque Piauí',
  'Centro',
  'Ininga',
  'São Cristóvão',
  'Buenos Aires',
  'Primavera',
  'Renascença',
] as const;

/** Centros aproximados p/ flyTo no mapa cidadão */
export const BAIRRO_CENTERS: Record<
  (typeof BAIRROS_PRIORITARIOS)[number],
  [number, number]
> = {
  'Todos os Santos': [-42.825, -5.05],
  'Parque Piauí': [-42.79, -5.118],
  Centro: [-42.808, -5.088],
  Ininga: [-42.794, -5.055],
  'São Cristóvão': [-42.771, -5.077],
  'Buenos Aires': [-42.772, -5.05],
  Primavera: [-42.811, -5.057],
  Renascença: [-42.741, -5.098],
};

export type PorteArvore = 'pequeno' | 'medio' | 'grande';
export type TipoRaiz = 'pivotante' | 'superficial' | 'mista';

export interface EspecieNativa {
  id: string;
  nome: string;
  cientifico: string;
  porte: PorteArvore;
  raiz: TipoRaiz;
  sombra: 'baixa' | 'media' | 'alta';
  observacao?: string;
  /** Foto local em /public/especies */
  foto?: string;
}

/**
 * Espécies iniciais — validar com a ONG na Rodada 8.
 * Inclui nativas/adaptadas comuns em arborização urbana no Piauí.
 * Fotos: Wikimedia Commons (CC) — ver crédito em /guias#especies.
 */
export const ESPECIES_NATIVAS_PIAUI: EspecieNativa[] = [
  {
    id: 'ipe-amarelo',
    nome: 'Ipê-amarelo',
    cientifico: 'Handroanthus chrysotrichus',
    porte: 'medio',
    raiz: 'pivotante',
    sombra: 'media',
    observacao: 'Floração marcante; evitar sob fiação baixa.',
    foto: '/especies/ipe-amarelo.jpg',
  },
  {
    id: 'oiti',
    nome: 'Oiti',
    cientifico: 'Licania tomentosa',
    porte: 'grande',
    raiz: 'superficial',
    sombra: 'alta',
    observacao: 'Boa sombra; atenção a calçadas estreitas.',
    foto: '/especies/oiti.jpg',
  },
  {
    id: 'pau-ferro',
    nome: 'Pau-ferro',
    cientifico: 'Libidibia ferrea',
    porte: 'medio',
    raiz: 'pivotante',
    sombra: 'media',
    foto: '/especies/pau-ferro.jpg',
  },
  {
    id: 'sibipiruna',
    nome: 'Sibipiruna',
    cientifico: 'Cenostigma pluviosum',
    porte: 'grande',
    raiz: 'pivotante',
    sombra: 'alta',
    foto: '/especies/sibipiruna.jpg',
  },
  {
    id: 'ipe-roxo',
    nome: 'Ipê-roxo',
    cientifico: 'Handroanthus impetiginosus',
    porte: 'medio',
    raiz: 'pivotante',
    sombra: 'media',
    foto: '/especies/ipe-roxo.jpg',
  },
  {
    id: 'acaricuara',
    nome: 'Mulungu',
    cientifico: 'Erythrina mulungu',
    porte: 'medio',
    raiz: 'mista',
    sombra: 'media',
    observacao: 'Atrai polinizadores; podas periódicas.',
    foto: '/especies/acaricuara.jpg',
  },
  {
    id: 'caneleiro',
    nome: 'Caneleiro',
    cientifico: 'Cenostigma pyramidale',
    porte: 'medio',
    raiz: 'pivotante',
    sombra: 'media',
    observacao:
      'Nativa citada na distribuição de mudas dos viveiros municipais (SEMAM).',
    foto: '/especies/caneleiro.jpg',
  },
  {
    id: 'sambaiba',
    nome: 'Sambaíba',
    cientifico: 'Curatella americana',
    porte: 'medio',
    raiz: 'mista',
    sombra: 'media',
    observacao: 'Espécie nativa citada nos viveiros municipais de Teresina.',
    foto: '/especies/sambaiba.jpg',
  },
];

export type TipoPonto =
  | 'terreno_baldio'
  | 'praca'
  | 'canteiro'
  | 'lazer_infantil'
  | 'outro';

export type StatusPonto =
  | 'aberto'
  | 'em_analise'
  | 'aprovado'
  | 'em_mutirao'
  | 'concluido';

export const TIPOS_PONTO: Record<
  TipoPonto,
  { label: string; color: string }
> = {
  terreno_baldio: { label: 'Terreno baldio', color: '#B54A2A' },
  praca: { label: 'Praça', color: '#1A5C3A' },
  canteiro: { label: 'Canteiro', color: '#2D8A58' },
  /** Rio — amarelo ipê sumia com ícone branco no mapa */
  lazer_infantil: { label: 'Lazer infantil', color: '#2A6B7C' },
  outro: { label: 'Outro', color: '#4A5C52' },
};

export const STATUS_PONTO: Record<
  StatusPonto,
  { label: string; color: string }
> = {
  aberto: { label: 'Aberto', color: '#B54A2A' },
  em_analise: { label: 'Em análise', color: '#E8B84A' },
  aprovado: { label: 'Aprovado', color: '#2A6B7C' },
  em_mutirao: { label: 'Em mutirão', color: '#2D8A58' },
  concluido: { label: 'Concluído', color: '#1A5C3A' },
};

/** Pontos mock para o mapa na Rodada 1 (sem Supabase ainda) */
export const PONTOS_MOCK = [
  {
    id: '1',
    titulo: 'Terreno na Rua Projetada A',
    tipo: 'terreno_baldio' as TipoPonto,
    status: 'aberto' as StatusPonto,
    bairro: 'Dirceu Arcoverde',
    urgencia: 82,
    lng: -42.762,
    lat: -5.102,
  },
  {
    id: '2',
    titulo: 'Praça sem sombra — Quadra 15',
    tipo: 'praca' as TipoPonto,
    status: 'em_analise' as StatusPonto,
    bairro: 'Parque Piauí',
    urgencia: 71,
    lng: -42.785,
    lat: -5.118,
  },
  {
    id: '3',
    titulo: 'Canteiro central seco',
    tipo: 'canteiro' as TipoPonto,
    status: 'aprovado' as StatusPonto,
    bairro: 'São Joaquim',
    urgencia: 55,
    lng: -42.81,
    lat: -5.075,
  },
  {
    id: '4',
    titulo: 'Área de brincadeira improvisada',
    tipo: 'lazer_infantil' as TipoPonto,
    status: 'aberto' as StatusPonto,
    bairro: 'Promorar',
    urgencia: 88,
    lng: -42.745,
    lat: -5.095,
  },
  {
    id: '5',
    titulo: 'Lote com entulho — próximo à UBS',
    tipo: 'terreno_baldio' as TipoPonto,
    status: 'em_mutirao' as StatusPonto,
    bairro: 'Todos os Santos',
    urgencia: 94,
    lng: -42.828,
    lat: -5.055,
  },
];

export const OPENFREEMAP_STYLE =
  'https://tiles.openfreemap.org/styles/liberty';

/** Base clara e limpa — deixa os dados (hexágonos, parques) serem o destaque */
export const POSITRON_STYLE =
  'https://tiles.openfreemap.org/styles/positron';

/** Visão de satélite (como SIGAPS “de cima”) — Esri World Imagery */
export const SATELLITE_STYLE = {
  version: 8 as const,
  name: 'vu-satellite',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    'esri-world-imagery': {
      type: 'raster' as const,
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        'Tiles © Esri — Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [
    {
      id: 'esri-world-imagery',
      type: 'raster' as const,
      source: 'esri-world-imagery',
    },
  ],
};
