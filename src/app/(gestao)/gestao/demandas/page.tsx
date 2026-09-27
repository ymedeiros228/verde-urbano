'use client';

import { useMemo, useState } from 'react';
import { useDemandas } from '@/hooks/useDemandas';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { SearchField } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DemandaCover } from '@/components/demanda/DemandaCover';
import { DemandaSheet } from '@/components/demanda/DemandaSheet';
import { useEngagement } from '@/hooks/useEngagement';
import { useToast } from '@/components/ui/Toast';
import {
  STATUS_PONTO,
  TIPOS_PONTO,
  type StatusPonto,
} from '@/lib/map/terezina';
import type { DemandaStep } from '@/lib/data/mock';

type SortKey = 'urgencia' | 'votos' | 'titulo';

type TriagemPatch = { status: StatusPonto; step: DemandaStep };

const TRIAGEM: Record<'aprovar' | 'mutirao' | 'concluir', TriagemPatch> = {
  aprovar: { status: 'aprovado', step: 'votado' },
  mutirao: { status: 'em_mutirao', step: 'mutirao' },
  concluir: { status: 'concluido', step: 'concluido' },
};

export default function GestaoDemandasPage() {
  const { data: demandas = [], isLoading } = useDemandas();
  const { extra } = useEngagement();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusPonto | null>(null);
  const [sort, setSort] = useState<SortKey>('urgencia');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, TriagemPatch>>(
    {}
  );

  const base = useMemo(() => {
    return demandas
      .filter((d) => !d.heatOnly)
      .map((d) => {
        const patch = overrides[d.id];
        return patch ? { ...d, ...patch } : d;
      });
  }, [demandas, overrides]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = base.filter((d) => {
      if (status && d.status !== status) return false;
      if (!term) return true;
      return (
        d.titulo.toLowerCase().includes(term) ||
        d.bairro.toLowerCase().includes(term)
      );
    });
    list = [...list].sort((a, b) => {
      if (sort === 'votos')
        return b.votos + extra(b.id) - (a.votos + extra(a.id));
      if (sort === 'titulo') return a.titulo.localeCompare(b.titulo);
      return b.urgencia - a.urgencia;
    });
    return list;
  }, [base, q, status, sort, extra]);

  const selected = useMemo(
    () => (selectedId ? base.find((d) => d.id === selectedId) || null : null),
    [base, selectedId]
  );

  const statuses = Object.keys(STATUS_PONTO) as StatusPonto[];
  const hasFilters = Boolean(q.trim() || status);

  function clearFilters() {
    setQ('');
    setStatus(null);
  }

  function onTriagem(action: 'aprovar' | 'mutirao' | 'concluir') {
    if (!selectedId) return;
    const patch = TRIAGEM[action];
    setOverrides((prev) => ({ ...prev, [selectedId]: patch }));
    toast(`Status → ${STATUS_PONTO[patch.status].label} (demo)`, 'folha');
  }

  const selectedVotos = selected
    ? selected.votos + extra(selected.id)
    : 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Demandas cidadãs"
        description="Priorize por urgência e apoios. Clique na linha para triagem demo."
      />

      <div className="sticky top-0 z-20 -mx-1 space-y-2 rounded-2xl border border-folha-muted/30 bg-sol/95 p-3 backdrop-blur sm:mx-0">
        <SearchField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar título ou bairro…"
          className="max-w-md"
        />
        <div className="vu-filter-in flex flex-wrap gap-2">
          <Chip active={!status} onClick={() => setStatus(null)}>
            Todos
          </Chip>
          {statuses.map((s) => (
            <Chip
              key={s}
              active={status === s}
              onClick={() => setStatus(status === s ? null : s)}
            >
              {STATUS_PONTO[s].label}
            </Chip>
          ))}
          <span className="mx-1 self-center text-xs text-tinta-faint">
            Ordenar
          </span>
          {(
            [
              ['urgencia', 'Urgência'],
              ['votos', 'Apoios'],
              ['titulo', 'Título'],
            ] as const
          ).map(([k, label]) => (
            <Chip key={k} active={sort === k} onClick={() => setSort(k)}>
              {label}
            </Chip>
          ))}
        </div>
        <p className="text-xs text-tinta-faint">
          {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      {isLoading && (
        <div className="h-40 animate-pulse rounded-2xl bg-folha-muted/25" />
      )}
      {!isLoading && filtered.length === 0 && (
        <div className="space-y-3">
          <EmptyState
            title="Nenhuma demanda"
            description={
              hasFilters
                ? 'Ajuste ou limpe os filtros.'
                : 'Aguarde novos mapeamentos.'
            }
          />
          {hasFilters && (
            <div className="flex justify-center">
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="vu-enter overflow-hidden rounded-2xl border border-folha-muted/30 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Lista de demandas cidadãs</caption>
            <thead className="bg-sol text-xs uppercase text-tinta-faint">
              <tr>
                <th className="px-3 py-3 sm:px-4"> </th>
                <th className="px-3 py-3 sm:px-4">Título</th>
                <th className="px-3 py-3 sm:px-4">Bairro</th>
                <th className="hidden px-4 py-3 sm:table-cell">Tipo</th>
                <th className="px-3 py-3 sm:px-4">Status</th>
                <th className="px-3 py-3 sm:px-4">Urg.</th>
                <th className="px-3 py-3 sm:px-4">Apoios</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const votos = d.votos + extra(d.id);
                return (
                  <tr
                    key={d.id}
                    className="cursor-pointer border-t border-folha-muted/20 transition hover:bg-sol/80"
                    onClick={() => setSelectedId(d.id)}
                  >
                    <td className="px-3 py-2 sm:px-4">
                      <DemandaCover
                        compact
                        tipo={d.tipo}
                        local={d.local}
                        bairro={d.bairro}
                        foto={d.foto}
                        className="h-10 w-10 rounded-lg"
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-folha sm:px-4">
                      {d.titulo}
                    </td>
                    <td className="px-3 py-3 text-tinta-muted sm:px-4">
                      {d.bairro}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {TIPOS_PONTO[d.tipo].label}
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <Badge tone="muted">{STATUS_PONTO[d.status].label}</Badge>
                    </td>
                    <td className="px-3 py-3 font-semibold text-laterita sm:px-4">
                      {d.urgencia}
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      {votos.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <DemandaSheet
        demanda={selected}
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        votos={selectedVotos}
        showApoiar={false}
        showTriagem
        onTriagem={onTriagem}
      />
    </div>
  );
}
