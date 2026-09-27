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
  /** caminho local em /public — só se a foto for daquela ação */
  foto?: string;
  badge?: string;
  badgeTone?: 'folha' | 'ipe' | 'laterita' | 'rio' | 'muted';
  necessidades: string[];
  ongRecomendado?: boolean;
  mutiraoData?: string;
  /** só entra no heatmap — não aparece no feed */
  heatOnly?: boolean;
  /** Quem marcou o ponto (perfil do cadastro) */
  autor?: { nome: string; bairro?: string };
  /** ISO — quando foi marcado */
  criadoEm?: string;
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

/**
 * Demandas do feed — fotos oficiais só quando o texto descreve a mesma ação
 * (ver public/fotos/README.txt). Coords: Nominatim/OSM + CEP IBGE (2026).
 */
export const DEMANDAS_MOCK: Demanda[] = [
  {
    id: '1',
    titulo: 'Educação ambiental no Jardim Sensorial',
    descricao:
      'Atividade do Núcleo de Educação Ambiental da SEMAM no Parque da Cidade: crianças exploram o Jardim Sensorial e o vínculo com a arborização urbana.',
    local: 'Jardim Sensorial — Parque da Cidade',
    bairro: 'Primavera',
    tipo: 'praca',
    status: 'aprovado',
    step: 'votado',
    votos: 1452,
    urgencia: 55,
    lng: -42.8106,
    lat: -5.0571,
    foto: '/fotos/1.jpg',
    badge: 'Educação',
    badgeTone: 'folha',
    ongRecomendado: true,
    necessidades: ['Voluntários', 'Mediação SEMAM', 'Material educativo'],
  },
  {
    id: '2',
    titulo: 'Plantio nas margens do Poty',
    descricao:
      'Reflorestamento na zona norte com órgãos públicos e comunidade às margens do Rio Poty. Mutirão para completar mudas e irrigação inicial.',
    local: 'Margens do Rio Poty — zona norte',
    bairro: 'Todos os Santos',
    tipo: 'canteiro',
    status: 'em_mutirao',
    step: 'mutirao',
    votos: 987,
    urgencia: 90,
    lng: -42.826,
    lat: -5.048,
    foto: '/fotos/2.jpg',
    badge: 'Mutirão',
    badgeTone: 'ipe',
    necessidades: ['Plantio', 'Irrigação', 'Voluntários'],
    mutiraoData: '12/Out',
  },
  {
    id: '3',
    titulo: 'Canteiro revitalizado na Frei Serafim',
    descricao:
      'Entrega da SDU Centro no canteiro central da Av. Frei Serafim: mobiliário, calçada e arborização no eixo. Apoie a manutenção das mudas jovens.',
    local: 'Av. Frei Serafim — eixo central',
    bairro: 'Centro',
    tipo: 'canteiro',
    status: 'em_analise',
    step: 'analise',
    votos: 654,
    urgencia: 70,
    lng: -42.8071,
    lat: -5.0886,
    foto: '/fotos/3.jpg',
    badge: 'Canteiro',
    badgeTone: 'folha',
    necessidades: ['Manutenção', 'Rega', 'Poda leve'],
  },
  {
    id: '4',
    titulo: 'Calçadão sombreado — Frei Serafim',
    descricao:
      'Trecho complementar do eixo Frei Serafim após a revitalização. Foco em sombra contínua e cuidado com as mudas do canteiro central.',
    local: 'Calçadão Frei Serafim',
    bairro: 'Centro',
    tipo: 'canteiro',
    status: 'aprovado',
    step: 'votado',
    votos: 812,
    urgencia: 65,
    lng: -42.809,
    lat: -5.0895,
    foto: '/fotos/4.jpg',
    badge: 'Eixo',
    badgeTone: 'rio',
    necessidades: ['Sombra', 'Bancos', 'Manutenção'],
  },
  {
    id: '5',
    titulo: 'Mudas gratuitas — Viveiro da Zona Leste',
    descricao:
      'Viveiro municipal em Ininga produz cerca de 4 mil mudas/mês. Retirada com CPF e comprovante de residência, até 5 mudas por pessoa (7h–13h).',
    local: 'Viveiro Zona Leste — Av. Raul Lopes, Ininga',
    bairro: 'Ininga',
    tipo: 'outro',
    status: 'aberto',
    step: 'mapeado',
    votos: 534,
    urgencia: 48,
    lng: -42.785,
    lat: -5.06,
    foto: '/fotos/5.jpg',
    badge: 'Mudas',
    badgeTone: 'folha',
    necessidades: ['Retirada de mudas', 'Orientação SEMAM', 'Plantio seguro'],
  },
  {
    id: '6',
    titulo: 'Plantio de mudas — Zona Norte (ETURB)',
    descricao:
      'ETURB e parceiros realizaram plantio de mudas e conscientização ambiental na zona norte. Apoie a manutenção das mudas jovens.',
    local: 'Ação ETURB — margem Poty, zona norte',
    bairro: 'Todos os Santos',
    tipo: 'canteiro',
    status: 'em_mutirao',
    step: 'mutirao',
    votos: 721,
    urgencia: 78,
    lng: -42.822,
    lat: -5.052,
    foto: '/fotos/6.jpg',
    badge: 'Plantio',
    badgeTone: 'ipe',
    necessidades: ['Mudas', 'Irrigação', 'Voluntários'],
    mutiraoData: '19/Out',
  },
  {
    id: '7',
    titulo: 'Praça 16 de Agosto revitalizada',
    descricao:
      'SDU Leste entregou a Praça 16 de Agosto revitalizada. Apoie a conservação do paisagismo e dos equipamentos.',
    local: 'Praça 16 de Agosto — São Cristóvão',
    bairro: 'São Cristóvão',
    tipo: 'praca',
    status: 'aprovado',
    step: 'votado',
    votos: 890,
    urgencia: 58,
    lng: -42.7705,
    lat: -5.077,
    foto: '/fotos/7.jpg',
    badge: 'Praça Viva',
    badgeTone: 'folha',
    necessidades: ['Manutenção', 'Rega', 'Poda leve'],
  },
  {
    id: '8',
    titulo: 'Lixo Zero — Praça Aerolino de Abreu',
    descricao:
      'Programa Lixo Zero transformou o cenário de descarte irregular na Praça Aerolino de Abreu. Fiscalização e cuidado contínuos.',
    local: 'Praça Aerolino de Abreu — Centro',
    bairro: 'Centro',
    tipo: 'terreno_baldio',
    status: 'aberto',
    step: 'mapeado',
    votos: 512,
    urgencia: 84,
    lng: -42.804,
    lat: -5.0865,
    foto: '/fotos/8.jpg',
    badge: 'Limpeza',
    badgeTone: 'laterita',
    necessidades: ['Limpeza', 'Fiscalização', 'Educação ambiental'],
  },
  {
    id: '9',
    titulo: 'Praça das Palmeiras — melhorias',
    descricao:
      'SDU Norte fez vistoria técnica e definiu melhorias para a Praça das Palmeiras. Apoie o acompanhamento das obras.',
    local: 'Praça das Palmeiras — Buenos Aires',
    bairro: 'Buenos Aires',
    tipo: 'praca',
    status: 'em_analise',
    step: 'analise',
    votos: 634,
    urgencia: 70,
    lng: -42.772,
    lat: -5.05,
    foto: '/fotos/9.jpg',
    badge: 'Vistoria',
    badgeTone: 'folha',
    ongRecomendado: true,
    necessidades: ['Mudas', 'Bancos', 'Iluminação'],
  },
  {
    id: '10',
    titulo: 'Plantio em calçada — Morada Nova',
    descricao:
      'Paisagismo e plantio em calçada na zona sul, no entorno do mercado. Ação alinhada ao mutirão municipal de arborização.',
    local: 'Calçada — Morada Nova / Parque Piauí',
    bairro: 'Parque Piauí',
    tipo: 'canteiro',
    status: 'em_mutirao',
    step: 'mutirao',
    votos: 298,
    urgencia: 72,
    lng: -42.79,
    lat: -5.118,
    foto: '/fotos/m3.jpg',
    badge: 'Plantio',
    badgeTone: 'ipe',
    necessidades: ['Mudas', 'Tutores', 'Voluntários'],
    mutiraoData: '26/Out',
  },
  {
    id: '11',
    titulo: 'Praça Áurea Brandão — Praça Viva',
    descricao:
      'SDU Leste entregou a revitalização da Praça Áurea Brandão pelo Projeto Praça Viva. Ajude a manter o espaço cuidado.',
    local: 'Praça Áurea Brandão — Planalto Ininga',
    bairro: 'Ininga',
    tipo: 'praca',
    status: 'aprovado',
    step: 'votado',
    votos: 478,
    urgencia: 55,
    lng: -42.7805,
    lat: -5.0573,
    foto: '/fotos/11.jpg',
    badge: 'Praça Viva',
    badgeTone: 'folha',
    necessidades: ['Manutenção', 'Rega', 'Voluntários'],
  },
  {
    id: '12',
    titulo: 'Obras na Praça do Fripisa',
    descricao:
      'Reforma da Praça do Fripisa (Demóstenes Avelino) em andamento. Acompanhe e apoie o espaço.',
    local: 'Praça Demóstenes Avelino — Fripisa, Centro',
    bairro: 'Centro',
    tipo: 'praca',
    status: 'em_analise',
    step: 'analise',
    votos: 956,
    urgencia: 68,
    lng: -42.8101,
    lat: -5.0874,
    foto: '/fotos/12.jpg',
    badge: 'Obras',
    badgeTone: 'rio',
    necessidades: ['Acompanhamento', 'Acessibilidade', 'Paisagismo'],
  },
  {
    id: '13',
    titulo: 'Lazer na Praça do Renascença II',
    descricao:
      'SEMEL Lazer e Cidadania levou atividades à Praça do Renascença II. Espaço pedindo sombra e manutenção contínua.',
    local: 'Segunda Praça do Renascença II',
    bairro: 'Renascença',
    tipo: 'lazer_infantil',
    status: 'aberto',
    step: 'mapeado',
    votos: 355,
    urgencia: 64,
    lng: -42.7408,
    lat: -5.0977,
    foto: '/fotos/13.jpg',
    badge: 'Lazer',
    badgeTone: 'folha',
    necessidades: ['Sombra', 'Bancos', 'Manutenção'],
  },
  {
    id: '14',
    titulo: 'Limpeza urbana — SDU Leste',
    descricao:
      'SDU Leste amplia ações de limpeza urbana e ciclos de manutenção nos bairros. Apoie a continuidade e a fiscalização do descarte irregular.',
    local: 'Ações SDU Leste — Ininga',
    bairro: 'Ininga',
    tipo: 'terreno_baldio',
    status: 'aberto',
    step: 'mapeado',
    votos: 241,
    urgencia: 80,
    lng: -42.7938,
    lat: -5.0552,
    foto: '/fotos/14.jpg',
    badge: 'Limpeza',
    badgeTone: 'laterita',
    necessidades: ['Limpeza', 'Fiscalização', 'Educação ambiental'],
  },
];

/** Pins do mapa = só demandas reais da comunidade (o "calor" agora vem de satélite: lib/map/verde.ts) */
export const MAPA_PONTOS_MOCK: Demanda[] = DEMANDAS_MOCK;

export const MUTIROES_MOCK: Mutirao[] = [
  {
    id: 'm1',
    titulo: 'Plantio nas margens do Poty',
    local: 'Margens do Rio Poty — zona norte',
    bairro: 'Todos os Santos',
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
    titulo: 'Mutirão multi-órgãos — zona norte',
    local: 'Entorno do Poty — zona norte',
    bairro: 'Todos os Santos',
    data: '2026-10-19',
    horario: '07:30',
    voluntarios: 42,
    capacidade: 50,
    ong: 'SEMAM, SAADs e parceiros',
    tipo: 'Reflorestamento',
    demandaId: '2',
    foto: '/fotos/m2.jpg',
  },
  {
    id: 'm3',
    titulo: 'Plantio em calçada — Morada Nova',
    local: 'Calçada — Morada Nova',
    bairro: 'Parque Piauí',
    data: '2026-10-26',
    horario: '08:00',
    voluntarios: 18,
    capacidade: 30,
    ong: 'Viveiro Municipal / SEMAM',
    tipo: 'Plantio',
    demandaId: '10',
    foto: '/fotos/m3.jpg',
  },
];

function sparkAround(n: number): number[] {
  const base = Math.max(1, n);
  return [0.55, 0.65, 0.6, 0.78, 0.72, 0.88, 1].map((f) =>
    Math.round(base * f)
  );
}

/** KPIs alinhados ao mock visível no app */
export const KPI_MOCK = {
  demandasAtivas: DEMANDAS_MOCK.length,
  arvoresPlantadas: MUTIROES_MOCK.length * 120 + 80,
  mutiroesAgendados: MUTIROES_MOCK.length,
  usuariosApp: DEMANDAS_MOCK.reduce((s, d) => s + d.votos, 0),
  get sparkDemandas() {
    return sparkAround(this.demandasAtivas);
  },
  get sparkArvores() {
    return sparkAround(this.arvoresPlantadas);
  },
  get sparkMutiroes() {
    return sparkAround(this.mutiroesAgendados);
  },
  get sparkUsuarios() {
    return sparkAround(this.usuariosApp);
  },
};

const TIPO_CHART_LABEL: Record<string, string> = {
  terreno_baldio: 'Terreno baldio',
  praca: 'Praça',
  canteiro: 'Canteiro',
  lazer_infantil: 'Lazer infantil',
  outro: 'Outro',
};

export const TIPOS_DEMANDA_CHART = (() => {
  const counts: Record<string, number> = {};
  for (const d of DEMANDAS_MOCK) {
    counts[d.tipo] = (counts[d.tipo] || 0) + 1;
  }
  return Object.entries(counts).map(([tipo, valor]) => ({
    nome: TIPO_CHART_LABEL[tipo] || tipo,
    valor,
  }));
})();

const STATUS_CHART_META: Record<string, { nome: string; cor: string }> = {
  aberto: { nome: 'Aberto', cor: '#B54A2A' },
  em_analise: { nome: 'Em análise', cor: '#E8B84A' },
  aprovado: { nome: 'Aprovado', cor: '#2A6B7C' },
  em_mutirao: { nome: 'Em mutirão', cor: '#2D8A58' },
  concluido: { nome: 'Concluído', cor: '#1A5C3A' },
};

export const STATUS_CHART = (() => {
  const counts: Record<string, number> = {};
  for (const d of DEMANDAS_MOCK) {
    counts[d.status] = (counts[d.status] || 0) + 1;
  }
  return Object.entries(counts).map(([status, valor]) => ({
    nome: STATUS_CHART_META[status]?.nome || status,
    valor,
    cor: STATUS_CHART_META[status]?.cor || '#4A5C52',
  }));
})();

export const PRIORIDADES_BAIRRO = DEMANDAS_MOCK.filter((d) => !d.heatOnly)
  .slice()
  .sort(
    (a, b) =>
      b.urgencia / 100 +
      b.votos / 5000 -
      (a.urgencia / 100 + a.votos / 5000)
  )
  .slice(0, 3)
  .map((d) => ({
    demanda: d.titulo.length > 28 ? `${d.titulo.slice(0, 26)}…` : d.titulo,
    score: Math.round((d.urgencia / 25 + d.votos / 400) * 10) / 10,
  }));

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
