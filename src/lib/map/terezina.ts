import type { LngLatBoundsLike, LngLatLike } from 'maplibre-gl';

/** Bounding box aproximado de Teresina/PI */
export const TERESINA_BOUNDS: LngLatBoundsLike = [
  [-42.95, -5.25], // SW
  [-42.7, -4.95], // NE
];

/** Centro urbano (Praça da Bandeira / região central) */
export const TERESINA_CENTER: LngLatLike = [-42.8019, -5.0892];

export const DEFAULT_ZOOM = 12;
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 18;

/** Bairros prioritários para o piloto (IBGE + contexto local) */
export const BAIRROS_PRIORITARIOS = [
  'Dirceu Arcoverde',
  'Parque Piauí',
  'São Joaquim',
  'Promorar',
  'Todos os Santos',
  'Vermelha',
] as const;

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
}

/**
 * Espécies iniciais — validar com a ONG na Rodada 8.
 * Inclui nativas/adaptadas comuns em arborização urbana no Piauí.
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
  },
  {
    id: 'oiti',
    nome: 'Oiti',
    cientifico: 'Licania tomentosa',
    porte: 'grande',
    raiz: 'superficial',
    sombra: 'alta',
    observacao: 'Boa sombra; atenção a calçadas estreitas.',
  },
  {
    id: 'pau-ferro',
    nome: 'Pau-ferro',
    cientifico: 'Libidibia ferrea',
    porte: 'medio',
    raiz: 'pivotante',
    sombra: 'media',
  },
  {
    id: 'sibipiruna',
    nome: 'Sibipiruna',
    cientifico: 'Cenostigma pluviosum',
    porte: 'grande',
    raiz: 'pivotante',
    sombra: 'alta',
  },
  {
    id: 'ipe-roxo',
    nome: 'Ipê-roxo',
    cientifico: 'Handroanthus impetiginosus',
    porte: 'medio',
    raiz: 'pivotante',
    sombra: 'media',
  },
  {
    id: 'acaricuara',
    nome: 'Mulungu',
    cientifico: 'Erythrina mulungu',
    porte: 'medio',
    raiz: 'mista',
    sombra: 'media',
    observacao: 'Atrai polinizadores; podas periódicas.',
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
  },
  {
    id: 'sambaiba',
    nome: 'Sambaíba',
    cientifico: 'Curatella americana',
    porte: 'medio',
    raiz: 'mista',
    sombra: 'media',
    observacao: 'Espécie nativa citada nos viveiros municipais de Teresina.',
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
  lazer_infantil: { label: 'Lazer infantil', color: '#E8B84A' },
  outro: { label: 'Outro', color: '#2A6B7C' },
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
