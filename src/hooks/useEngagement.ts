'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ENGAGEMENT_EVENT,
  apoiarDemanda,
  ensureWarmEngagement,
  getApoiosRecentes,
  getMutiroesInscritos,
  getVotoExtra,
  getVotosExtras,
  inscreverMutirao,
  isInscritoMutirao,
  type VotosMap,
} from '@/lib/engagement';

function snapshot() {
  return {
    votos: getVotosExtras(),
    apoiosIds: getApoiosRecentes(),
    mutiroesIds: getMutiroesInscritos(),
  };
}

export function useEngagement() {
  const [votos, setVotos] = useState<VotosMap>({});
  const [apoiosIds, setApoiosIds] = useState<string[]>([]);
  const [mutiroesIds, setMutiroesIds] = useState<string[]>([]);
  // localStorage só depois de montar: evita divergência servidor × cliente (hydration)
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    const s = snapshot();
    setVotos(s.votos);
    setApoiosIds(s.apoiosIds);
    setMutiroesIds(s.mutiroesIds);
  }, []);

  useEffect(() => {
    ensureWarmEngagement();
    refresh();
    setMounted(true);
    function onChange() {
      refresh();
    }
    window.addEventListener(ENGAGEMENT_EVENT, onChange);
    window.addEventListener('storage', onChange);
    window.addEventListener('focus', onChange);
    return () => {
      window.removeEventListener(ENGAGEMENT_EVENT, onChange);
      window.removeEventListener('storage', onChange);
      window.removeEventListener('focus', onChange);
    };
  }, [refresh]);

  const apoiar = useCallback((id: string) => {
    const extra = apoiarDemanda(id);
    refresh();
    return extra;
  }, [refresh]);

  const inscrever = useCallback((id: string) => {
    const list = inscreverMutirao(id);
    refresh();
    return list;
  }, [refresh]);

  const extra = useCallback(
    (id: string) => (mounted ? votos[id] || getVotoExtra(id) : 0),
    [votos, mounted]
  );

  const inscrito = useCallback(
    (id: string) => mounted && (mutiroesIds.includes(id) || isInscritoMutirao(id)),
    [mutiroesIds, mounted]
  );

  return {
    votos,
    apoiosIds,
    mutiroesIds,
    apoiar,
    inscrever,
    extra,
    inscrito,
    refresh,
  };
}
