const VOTOS_KEY = 'vu_votos';
const MUTIROES_KEY = 'vu_mutiroes_inscritos';
const SEEDED_KEY = 'vu_warm_seed_v1';
export const ENGAGEMENT_EVENT = 'vu-engagement';

export type VotosMap = Record<string, number>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(ENGAGEMENT_EVENT));
}

/** Preenche apoios/mutirões demo uma vez — app parece já em uso. */
export function ensureWarmEngagement() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEEDED_KEY)) return;

  const votos = readJson<VotosMap>(VOTOS_KEY, {});
  if (Object.keys(votos).length === 0) {
    writeJson(VOTOS_KEY, {
      '1': 2,
      '2': 1,
      '9': 1,
      '4': 1,
    });
  }

  const mutiroes = readJson<string[]>(MUTIROES_KEY, []);
  if (mutiroes.length === 0) {
    writeJson(MUTIROES_KEY, ['m1', 'm2']);
  }

  localStorage.setItem(SEEDED_KEY, '1');
}

export function getVotosExtras(): VotosMap {
  return readJson<VotosMap>(VOTOS_KEY, {});
}

export function getVotoExtra(id: string): number {
  return getVotosExtras()[id] || 0;
}

/** Incrementa apoio local e devolve o novo total extra para o id. */
export function apoiarDemanda(id: string): number {
  const map = getVotosExtras();
  map[id] = (map[id] || 0) + 1;
  writeJson(VOTOS_KEY, map);
  return map[id];
}

export function getApoiosRecentes(): string[] {
  const map = getVotosExtras();
  return Object.keys(map).sort((a, b) => (map[b] || 0) - (map[a] || 0));
}

export function getMutiroesInscritos(): string[] {
  return readJson<string[]>(MUTIROES_KEY, []);
}

export function inscreverMutirao(id: string): string[] {
  const list = getMutiroesInscritos();
  if (!list.includes(id)) {
    list.unshift(id);
    writeJson(MUTIROES_KEY, list.slice(0, 40));
  }
  return list;
}

export function isInscritoMutirao(id: string): boolean {
  return getMutiroesInscritos().includes(id);
}
