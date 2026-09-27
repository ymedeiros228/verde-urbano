/** Pontos mapeados neste aparelho (demo sem backend). */

import type { Demanda } from '@/lib/data/mock';

const KEY = 'vu-local-pontos-v1';
export const LOCAL_PONTOS_EVENT = 'vu-local-pontos';

function readRaw(): Demanda[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Demanda[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLocalPontos(): Demanda[] {
  return readRaw();
}

export function addLocalPonto(
  input: Omit<Demanda, 'id' | 'votos' | 'status' | 'step' | 'necessidades'> & {
    necessidades?: string[];
  }
): Demanda {
  const ponto: Demanda = {
    ...input,
    id: `local-${Date.now()}`,
    votos: 1,
    urgencia: input.urgencia ?? 70,
    status: 'aberto',
    step: 'mapeado',
    necessidades: input.necessidades ?? [],
    badge: input.badge ?? 'Novo',
    badgeTone: input.badgeTone ?? 'folha',
  };
  // fotos ficam como dataURL: limita a fila para caber no localStorage
  let next = [ponto, ...readRaw()].slice(0, 20);
  for (;;) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      break;
    } catch (e) {
      if (next.length <= 1) throw e;
      next = next.slice(0, -1); // cota estourada: descarta o mais antigo
    }
  }
  window.dispatchEvent(new Event(LOCAL_PONTOS_EVENT));
  return ponto;
}

export function mergeWithLocal(base: Demanda[]): Demanda[] {
  const local = getLocalPontos();
  if (!local.length) return base;
  const ids = new Set(base.map((d) => d.id));
  return [...local.filter((d) => !ids.has(d.id)), ...base];
}
