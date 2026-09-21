import type { StatusPonto, TipoPonto } from '@/lib/map/terezina';

export type DemandaStep =
  | 'mapeado'
  | 'analise'
  | 'votado'
  | 'mutirao'
  | 'concluido';

export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  local: string;
  bairro: string;
  tipo: TipoPonto;
  status: StatusPonto;
  step: DemandaStep;
  votos: number;
  urgencia: number;
  lng: number;
  lat: number;
  /** caminho local em /public, ex: /fotos/1.jpg */
  foto?: string;
  badge?: string;
  badgeTone?: 'folha' | 'ipe' | 'laterita' | 'rio' | 'muted';
  necessidades: string[];
  ongRecomendado?: boolean;
  mutiraoData?: string;
  /** só entra no heatmap — não aparece no feed */
  heatOnly?: boolean;
}

export interface Mutirao {
  id: string;
  titulo: string;
  local: string;
  bairro: string;
  data: string;
  horario: string;
  voluntarios: number;
  capacidade: number;
  ong: string;
  tipo: string;
  demandaId?: string;
  foto?: string;
}

export const DEMANDA_STEPS_DEFAULT = [
  { id: 'mapeado', label: 'Mapeado' },
  { id: 'votado', label: 'Votado' },
  { id: 'mutirao', label: 'Mutirão' },
  { id: 'concluido', label: 'Concluído' },
];

export const DEMANDA_STEPS_ANALISE = [
  { id: 'mapeado', label: 'Mapeado' },
  { id: 'analise', label: 'Análise técnica' },
  { id: 'votado', label: 'Votação' },
];

export function stepIndex(step: DemandaStep): number {
  const map: Record<DemandaStep, number> = {
    mapeado: 0,
    analise: 1,
    votado: 1,
    mutirao: 2,
    concluido: 3,
  };
  return map[step];
}

/** Demandas do feed — alinhadas aos bairros do StoryStrip (piloto) */
export const DEMANDAS_MOCK: Demanda[] = [
  {
    id: '1',
    titulo: 'Terreno baldio na Quadra 45',
    descricao:
      'Lote abandonado com entulho e foco de mosquito. Vizinhos pedem limpeza, cerca provisória e plantio de mudas nativas com a SEMAM.',
    local: 'Quadra 45 — Dirceu Arcoverde',
    bairro: 'Dirceu Arcoverde',
    tipo: 'terreno_baldio',
    status: 'em_analise',
    step: 'analise',
    votos: 1452,
    urgencia: 88,
    lng: -42.762,
    lat: -5.102,
    foto: '/fotos/1.jpg',
    badge: 'Urgente',
    badgeTone: 'laterita',
    ongRecomendado: true,
    necessidades: ['Limpeza', 'Plantio de mudas', 'Cerca provisória'],
  },
  {
    id: '2',
    titulo: 'Plantio na praça do Dirceu',
    descricao:
      'Praça com solo exposto e pouca sombra. Mutirão já agendado para completar o plantio e instalar irrigação por gotejo.',
    local: 'Praça central — Dirceu',
    bairro: 'Dirceu Arcoverde',
    tipo: 'praca',
    status: 'em_mutirao',
    step: 'mutirao',
    votos: 987,
    urgencia: 90,
    lng: -42.758,
    lat: -5.098,
    foto: '/fotos/2.jpg',
    badge: 'Mutirão',
    badgeTone: 'ipe',
    necessidades: ['Plantio', 'Irrigação', 'Voluntários'],
    mutiraoData: '12/Out',
  },
  {
    id: '3',
    titulo: 'Canteiro na Av. Principal do Parque Piauí',
    descricao:
      'Canteiro central seco. Moradores pedem reposição de mudas, adubação e poda leve nas árvores jovens.',
    local: 'Av. Principal — Parque Piauí',
    bairro: 'Parque Piauí',
    tipo: 'canteiro',
    status: 'em_analise',
    step: 'analise',
    votos: 654,
    urgencia: 70,
    lng: -42.786,
    lat: -5.118,
    foto: '/fotos/3.jpg',
    badge: 'Canteiro',
    badgeTone: 'folha',
    necessidades: ['Reposição de mudas', 'Adubação', 'Poda leve'],
  },
  {
    id: '4',
    titulo: 'Playground sombreado — Parque Piauí',
    descricao:
      'Área infantil sem cobertura arbórea. Demanda por árvores de médio porte e bancos para responsáveis.',
    local: 'Área de lazer — Parque Piauí',
    bairro: 'Parque Piauí',
    tipo: 'lazer_infantil',
    status: 'aprovado',
    step: 'votado',
    votos: 812,
    urgencia: 75,
    lng: -42.79,
    lat: -5.122,
    foto: '/fotos/4.jpg',
    badge: 'Lazer',
    badgeTone: 'rio',
    necessidades: ['Árvores de sombra', 'Bancos', 'Manutenção'],
  },
  {
    id: '5',
    titulo: 'Terreno na Rua das Acácias',
    descricao:
      'Terreno baldio com mato alto. Comunidade quer limpeza SEMAM e plantio coletivo no entorno.',
    local: 'Rua das Acácias — São Joaquim',
    bairro: 'São Joaquim',
    tipo: 'terreno_baldio',
    status: 'aberto',
    step: 'mapeado',
    votos: 534,
    urgencia: 82,
    lng: -42.806,
    lat: -5.076,
    foto: '/fotos/5.jpg',
    badge: 'Aberto',
    badgeTone: 'laterita',
    necessidades: ['Limpeza', 'Plantio', 'Orientação SEMAM'],
  },
  {
    id: '6',
    titulo: 'Praça São Joaquim — revitalização',
    descricao:
      'Praça com bancos quebrados e canteiros vazios. Apoie a revitalização com mudas nativas do viveiro municipal.',
    local: 'Praça São Joaquim',
    bairro: 'São Joaquim',
    tipo: 'praca',
    status: 'em_mutirao',
    step: 'mutirao',
    votos: 721,
    urgencia: 68,
    lng: -42.81,
    lat: -5.08,
    foto: '/fotos/1.jpg',
    badge: 'Mutirão',
    badgeTone: 'ipe',
    necessidades: ['Bancos', 'Mudas', 'Voluntários'],
    mutiraoData: '19/Out',
  },
  {
    id: '7',
    titulo: 'Arborização no Promorar',
    descricao:
      'Calçadas sem sombra no trecho comercial. Pedido de mudas de ipê e oiti com orientação do viveiro.',
    local: 'Trecho comercial — Promorar',
    bairro: 'Promorar',
    tipo: 'canteiro',
    status: 'em_analise',
    step: 'analise',
    votos: 445,
    urgencia: 62,
    lng: -42.75,
    lat: -5.096,
    foto: '/fotos/2.jpg',
    badge: 'Arborização',
    badgeTone: 'folha',
    necessidades: ['Mudas de ipê', 'Irrigação', 'Tutores'],
  },
  {
    id: '8',
    titulo: 'Lote baldio — Todos os Santos',
    descricao:
      'Lote com descarte irregular. Moradores pedem limpeza, fiscalização e plantio de cerca-viva.',
    local: 'Rua Nova — Todos os Santos',
    bairro: 'Todos os Santos',
    tipo: 'terreno_baldio',
    status: 'aberto',
    step: 'mapeado',
    votos: 389,
    urgencia: 85,
    lng: -42.824,
    lat: -5.056,
    foto: '/fotos/3.jpg',
    badge: 'Denúncia',
    badgeTone: 'laterita',
    necessidades: ['Limpeza', 'Fiscalização', 'Cerca-viva'],
  },
  {
    id: '9',
    titulo: 'Praça da Vermelha — sombra e bancos',
    descricao:
      'Praça usada pela comunidade sem cobertura arbórea suficiente. Prioridade: mudas e manutenção dos bancos.',
    local: 'Praça da Vermelha',
    bairro: 'Vermelha',
    tipo: 'praca',
    status: 'aprovado',
    step: 'votado',
    votos: 1120,
    urgencia: 66,
    lng: -42.788,
    lat: -5.058,
    foto: '/fotos/4.jpg',
    badge: 'Prioridade',
    badgeTone: 'folha',
    ongRecomendado: true,
    necessidades: ['Mudas', 'Bancos', 'Poda'],
  },
  {
    id: '10',
    titulo: 'Espaço infantil na Vermelha',
    descricao:
      'Área de lazer infantil pedindo árvores, piso adequado e orientação SEMAM para plantio seguro.',
    local: 'Área infantil — Vermelha',
    bairro: 'Vermelha',
    tipo: 'lazer_infantil',
    status: 'em_analise',
    step: 'analise',
    votos: 298,
    urgencia: 58,
    lng: -42.792,
    lat: -5.062,
    foto: '/fotos/5.jpg',
    badge: 'Lazer',
    badgeTone: 'rio',
    necessidades: ['Árvores', 'Piso', 'Orientação'],
  },
];

/** Pontos extras só para densidade do mapa de calor (bairros piloto) */
const HEAT_CLUSTERS: { bairro: string; lng: number; lat: number; n: number }[] =
  [
    { bairro: 'Dirceu Arcoverde', lng: -42.76, lat: -5.1, n: 6 },
    { bairro: 'Parque Piauí', lng: -42.788, lat: -5.12, n: 5 },
    { bairro: 'São Joaquim', lng: -42.808, lat: -5.078, n: 4 },
    { bairro: 'Promorar', lng: -42.748, lat: -5.098, n: 4 },
    { bairro: 'Todos os Santos', lng: -42.825, lat: -5.058, n: 4 },
    { bairro: 'Vermelha', lng: -42.79, lat: -5.06, n: 3 },
  ];

function buildHeatExtra(): Demanda[] {
  const tipos: TipoPonto[] = [
    'terreno_baldio',
    'praca',
    'canteiro',
    'lazer_infantil',
    'outro',
  ];
  const out: Demanda[] = [];
  let i = 0;
  for (const c of HEAT_CLUSTERS) {
    for (let k = 0; k < c.n; k++) {
      i += 1;
      const urgencia = 40 + ((i * 17) % 55);
      out.push({
        id: `h${i}`,
        titulo: `Ponto calor ${c.bairro} ${k + 1}`,
        descricao: '',
        local: c.bairro,
        bairro: c.bairro,
        tipo: tipos[i % tipos.length],
        status: 'aberto',
        step: 'mapeado',
        votos: 10 + (i % 40),
        urgencia,
        lng: c.lng + (k % 3) * 0.008 - 0.008,
        lat: c.lat + Math.floor(k / 3) * 0.006 - 0.006,
        necessidades: [],
        heatOnly: true,
      });
    }
  }
  return out;
}

export const HEAT_EXTRA_MOCK = buildHeatExtra();

/** Todos os pontos para o mapa (feed + densidade) */
export const MAPA_PONTOS_MOCK: Demanda[] = [
  ...DEMANDAS_MOCK,
  ...HEAT_EXTRA_MOCK,
];

export const MUTIROES_MOCK: Mutirao[] = [
  {
    id: 'm1',
    titulo: 'Plantio na praça do Dirceu',
    local: 'Praça central — Dirceu',
    bairro: 'Dirceu Arcoverde',
    data: '2026-10-12',
    horario: '09:00',
    voluntarios: 28,
    capacidade: 40,
    ong: 'SEMAM + equipes municipais',
    tipo: 'Plantio',
    demandaId: '2',
    foto: '/fotos/m1.jpg',
  },
  {
    id: 'm2',
    titulo: 'Revitalização — Praça São Joaquim',
    local: 'Praça São Joaquim',
    bairro: 'São Joaquim',
    data: '2026-10-19',
    horario: '07:30',
    voluntarios: 42,
    capacidade: 50,
    ong: 'SEMAM, SAADs e parceiros',
    tipo: 'Reflorestamento',
    demandaId: '6',
    foto: '/fotos/m2.jpg',
  },
  {
    id: 'm3',
    titulo: 'Arborização no Promorar',
    local: 'Trecho comercial — Promorar',
    bairro: 'Promorar',
    data: '2026-10-26',
    horario: '08:00',
    voluntarios: 18,
    capacidade: 30,
    ong: 'Viveiro Municipal / SEMAM',
    tipo: 'Plantio',
    demandaId: '7',
    foto: '/fotos/m3.jpg',
  },
];

export const KPI_MOCK = {
  demandasAtivas: 1250,
  arvoresPlantadas: 5400,
  mutiroesAgendados: 8,
  usuariosApp: 15000,
  sparkDemandas: [40, 55, 48, 70, 65, 80, 92],
  sparkArvores: [20, 35, 50, 45, 70, 85, 100],
  sparkMutiroes: [2, 3, 2, 5, 4, 6, 8],
  sparkUsuarios: [2, 4, 6, 8, 10, 12, 15],
};

export const TIPOS_DEMANDA_CHART = [
  { nome: 'Limpeza de terreno', valor: 420 },
  { nome: 'Arborização', valor: 310 },
  { nome: 'Playgrounds', valor: 180 },
  { nome: 'Iluminação', valor: 150 },
  { nome: 'Bancos/equipamentos', valor: 90 },
];

export const STATUS_CHART = [
  { nome: 'Em análise', valor: 320, cor: '#2A6B7C' },
  { nome: 'Aprovado', valor: 280, cor: '#2D8A58' },
  { nome: 'Executando', valor: 210, cor: '#E8B84A' },
  { nome: 'Finalizado', valor: 440, cor: '#1A5C3A' },
];

export const PRIORIDADES_BAIRRO = [
  { demanda: 'Limpeza de terreno', score: 4.0 },
  { demanda: 'Arborização de calçadas', score: 3.7 },
  { demanda: 'Iluminação LED', score: 3.4 },
];

export const COBERTURA_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { nome: 'Parque Poti', cobertura: 0.65 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-42.82, -5.07],
            [-42.8, -5.07],
            [-42.8, -5.09],
            [-42.82, -5.09],
            [-42.82, -5.07],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { nome: 'Dirceu — núcleo', cobertura: 0.35 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-42.77, -5.09],
            [-42.75, -5.09],
            [-42.75, -5.11],
            [-42.77, -5.11],
            [-42.77, -5.09],
          ],
        ],
      },
    },
  ],
};

export const GUIAS_MOCK = [
  {
    id: 'g1',
    titulo: 'Retirar mudas nos viveiros SEMAM',
    categoria: 'Mudas',
    resumo:
      'CPF + comprovante de residência; até 5 mudas. Viveiros: Parque da Cidade, Jardim Botânico e Zona Leste (Ininga, 7h–13h).',
  },
  {
    id: 'g2',
    titulo: 'Planta certa no lugar certo',
    categoria: 'Plantio',
    resumo:
      'Antes de plantar em calçada ou área pública, consulte a SEMAM. Evite grande porte junto a postes e fiação (Lei das Calçadas nº 4.522).',
  },
  {
    id: 'g3',
    titulo: 'Poda e árvore com risco',
    categoria: 'Poda',
    resumo:
      'Autorização SEMAM; risco iminente: 153 (Defesa Civil), SAAD da zona ou Bombeiros. Fiação: concessionária de energia.',
  },
  {
    id: 'g4',
    titulo: 'Denunciar queimada ou corte ilegal',
    categoria: 'Denúncia',
    resumo:
      '153 · Colab · SEMAM · BPA (190) · Linha Verde do MPPI. Guarde foto e endereço.',
  },
];
