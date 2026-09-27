'use client';

import { useQuery } from '@tanstack/react-query';
import type { ExpressionSpecification } from 'maplibre-gl';

/**
 * Mapa verde real de Teresina — gerado por scripts/build_mapa_verde.py
 * (ESA WorldCover 10 m + Landsat temperatura de superfície + OSM).
 */
export const HEX_URL = '/map/hex-verde.geojson';
export const AREAS_URL = '/map/areas-verdes.geojson';

export type Lente = 'prioridade' | 'copa' | 'calor';

export type ClasseCopa = 'arborizada' | 'moderada' | 'pouca' | 'critica';

export interface HexProps {
  h3: string;
  bairro: string | null;
  /** % de copa de árvore (WorldCover classe 10) */
  copa: number;
  /** % de qualquer vegetação (árvore + arbusto + campo) */
  verde: number;
  construido: number;
  /** °C — temperatura de superfície na seca */
  temp: number | null;
  urbano: boolean;
  classe: ClasseCopa;
  /** 0–100: falta de copa × calor × densidade urbana */
  prioridade: number;
}

export interface AreaVerdeProps {
  id: string;
  nome: string | null;
  tipo: 'parque' | 'praca' | 'bosque' | 'lazer';
  area_m2: number;
}

export interface BairroVerde {
  bairro: string;
  hexagonos: number;
  copa: number;
  temp: number | null;
  prioridade: number;
  criticos: number;
  centro: [number, number];
}

export interface MapaVerdeMeta {
  gerado_em: string;
  fontes: { cobertura: string; temperatura: string | null; osm: string };
  totais: {
    hexagonos: number;
    urbanos: number;
    copa_urbana_media: number;
    temp_urbana_media: number | null;
    criticos: number;
    arborizados: number;
    areas_verdes_osm: number;
    areas_verdes_ha: number;
  };
  temp_escala: [number, number];
}

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Falha ao carregar ${url}`);
  return r.json() as Promise<T>;
}

export function useMapaVerdeMeta() {
  return useQuery({
    queryKey: ['mapa-verde', 'meta'],
    queryFn: () => getJSON<MapaVerdeMeta>('/map/meta.json'),
    staleTime: Infinity,
  });
}

export function useBairrosVerde() {
  return useQuery({
    queryKey: ['mapa-verde', 'bairros'],
    queryFn: () => getJSON<BairroVerde[]>('/map/bairros-verde.json'),
    staleTime: Infinity,
  });
}

/* ------------------------------------------------------------------ escalas */

interface Escala {
  titulo: string;
  descricao: string;
  /** paradas [valor, cor] — usadas no MapLibre e no gradiente da legenda */
  stops: [number, string][];
  rotulos: [string, string];
  prop: keyof Pick<HexProps, 'prioridade' | 'copa' | 'temp'>;
}

export const ESCALAS: Record<Lente, Escala> = {
  prioridade: {
    titulo: 'Onde plantar primeiro',
    descricao: 'Pouca copa + superfície quente + muita construção',
    prop: 'prioridade',
    stops: [
      [0, '#CFE3C8'],
      [30, '#E9D9A0'],
      [55, '#EDAF5B'],
      [75, '#D0683A'],
      [90, '#9E3322'],
    ],
    rotulos: ['Baixa', 'Urgente'],
  },
  copa: {
    titulo: 'Cobertura de copa',
    descricao: '% da quadra coberta por árvores (satélite, 10 m)',
    prop: 'copa',
    stops: [
      [0, '#EFE3C8'],
      [5, '#DCCB94'],
      [12, '#A9C37C'],
      [25, '#5C9B5A'],
      [45, '#1A5C3A'],
    ],
    rotulos: ['0%', '45%+'],
  },
  calor: {
    titulo: 'Temperatura da superfície',
    descricao: 'Média da seca (ago–out), Landsat 8/9',
    prop: 'temp',
    stops: [
      [41.5, '#FBF1CF'],
      [44, '#F6CB73'],
      [46, '#E98C45'],
      [47.8, '#C95231'],
      [49.5, '#7E2418'],
    ],
    rotulos: ['41 °C', '49 °C+'],
  },
};

export function gradienteCSS(lente: Lente): string {
  const { stops } = ESCALAS[lente];
  const min = stops[0][0];
  const max = stops[stops.length - 1][0];
  return `linear-gradient(90deg, ${stops
    .map(([v, c]) => `${c} ${Math.round(((v - min) / (max - min)) * 100)}%`)
    .join(', ')})`;
}

/** Cor do hexágono para a lente — interpolação suave */
export function corExpr(lente: Lente): ExpressionSpecification {
  const { stops, prop } = ESCALAS[lente];
  const flat = stops.flatMap(([v, c]) => [v, c]);
  const valor: ExpressionSpecification =
    prop === 'temp'
      ? ['coalesce', ['get', 'temp'], 44]
      : ['get', prop];
  const interp = ['interpolate', ['linear'], valor, ...flat] as unknown as ExpressionSpecification;
  if (lente === 'prioridade') {
    // fora da mancha urbana: verde bem leve (não é alvo de plantio)
    return ['case', ['get', 'urbano'], interp, '#DDEBD6'] as ExpressionSpecification;
  }
  return interp;
}

export function corHex(lente: Lente, p: Pick<HexProps, 'prioridade' | 'copa' | 'temp'>): string {
  const { stops, prop } = ESCALAS[lente];
  const v = (p[prop] ?? 44) as number;
  let cor = stops[0][1];
  for (const [s, c] of stops) if (v >= s) cor = c;
  return cor;
}

export const CLASSE_LABEL: Record<ClasseCopa, { label: string; tom: string }> = {
  arborizada: { label: 'Bem arborizada', tom: '#1A5C3A' },
  moderada: { label: 'Copa moderada', tom: '#5C9B5A' },
  pouca: { label: 'Pouca sombra', tom: '#C98A2E' },
  critica: { label: 'Sem sombra', tom: '#B54A2A' },
};

export function nivelPrioridade(p: number): { label: string; tom: string } {
  if (p >= 80) return { label: 'Urgente', tom: '#9E3322' };
  if (p >= 60) return { label: 'Alta', tom: '#D0683A' };
  if (p >= 35) return { label: 'Média', tom: '#C98A2E' };
  return { label: 'Baixa', tom: '#2D8A58' };
}

export function formatHa(m2: number): string {
  const ha = m2 / 10_000;
  if (ha >= 10) return `${Math.round(ha).toLocaleString('pt-BR')} ha`;
  if (ha >= 1) return `${ha.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ha`;
  return `${Math.round(m2).toLocaleString('pt-BR')} m²`;
}
