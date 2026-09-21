'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { Mapa, type MapFilter } from '@/components/mapa/Mapa';
import { Chip } from '@/components/ui/Chip';
import { SearchField } from '@/components/ui/Input';
import { DemandaSheet } from '@/components/demanda/DemandaSheet';
import { MutiraoCover } from '@/components/demanda/DemandaCover';
import { useToast } from '@/components/ui/Toast';
import { useMapaPontos } from '@/hooks/useDemandas';
import { useMutiroes } from '@/hooks/useMutiroes';
import { useEngagement } from '@/hooks/useEngagement';
import type { Demanda } from '@/lib/data/mock';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FILTERS: { id: MapFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'arvores', label: 'Árvores' },
  { id: 'pracas', label: 'Praças' },
  { id: 'terrenos', label: 'Terrenos' },
  { id: 'mutiroes', label: 'Mutirões' },
];

export default function MapearPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center text-sm text-folha">
          Carregando mapa…
        </div>
      }
    >
      <MapearPageInner />
    </Suspense>
  );
}

function MapearPageInner() {
  const searchParams = useSearchParams();
  const pontoParam = searchParams.get('ponto');
  const [filter, setFilter] = useState<MapFilter>('todos');
  const [q, setQ] = useState('');
  const [heatmap, setHeatmap] = useState(true);
  const [showPontos, setShowPontos] = useState(true);
  const [cobertura, setCobertura] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Demanda | null>(null);
  const [focusPontoId, setFocusPontoId] = useState<string | null>(null);
  const { toast } = useToast();
  const { apoiar, extra } = useEngagement();
  const { data: mapaPontos = [] } = useMapaPontos();
  const { data: mutiroes = [] } = useMutiroes();

  const pontos = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return mapaPontos;
    return mapaPontos.filter(
      (d) =>
        d.titulo.toLowerCase().includes(term) ||
        d.bairro.toLowerCase().includes(term) ||
        d.local.toLowerCase().includes(term)
    );
  }, [mapaPontos, q]);

  useEffect(() => {
    if (!pontoParam || mapaPontos.length === 0) return;
    const ponto = mapaPontos.find((p) => p.id === pontoParam);
    if (!ponto) return;
    setSelected(ponto);
    setFocusPontoId(ponto.id);
  }, [pontoParam, mapaPontos]);

  function onSelectPonto(id: string) {
    const ponto = mapaPontos.find((p) => p.id === id);
    if (ponto) {
      setSelected(ponto);
      setFocusPontoId(ponto.id);
    }
  }

  const votosSheet = selected ? selected.votos + extra(selected.id) : 0;

  return (
    <div className="relative">
      <div className="relative flex h-[calc(100vh-var(--cidadao-nav-h)-1rem)] flex-col md:h-[calc(100vh-4rem)] md:flex-row">
        <div className="relative min-h-0 flex-1">
          <div className="absolute left-0 right-0 top-0 z-20 p-3 md:left-4 md:right-auto md:top-4 md:w-[min(100%,22rem)] md:p-0">
            <div className="rounded-2xl border border-folha-muted/30 bg-white/95 p-2.5 shadow-soft backdrop-blur md:p-3">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <h1 className="truncate font-display text-sm font-semibold text-folha md:text-base">
                    Mapa · Teresina
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition ${
                    showFilters
                      ? 'bg-folha text-white'
                      : 'bg-sol text-folha hover:bg-folha/10'
                  }`}
                  aria-expanded={showFilters}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filtros
                </button>
              </div>
              <SearchField
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pesquisar áreas, bairros…"
                className="mt-2 h-10 bg-sol"
                aria-label="Pesquisar no mapa"
              />
              {showFilters && (
                <div className="vu-filter-in mt-2 space-y-2 border-t border-folha-muted/25 pt-2">
                  <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <Chip active={heatmap} onClick={() => setHeatmap((v) => !v)}>
                      Calor
                    </Chip>
                    <Chip
                      active={showPontos}
                      onClick={() => setShowPontos((v) => !v)}
                    >
                      Pontos
                    </Chip>
                    <Chip
                      active={cobertura}
                      onClick={() => setCobertura((v) => !v)}
                    >
                      Cobertura
                    </Chip>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {FILTERS.map((f) => (
                      <Chip
                        key={f.id}
                        active={filter === f.id}
                        onClick={() => setFilter(f.id)}
                      >
                        {f.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Mapa
            className="h-full w-full"
            pontos={pontos}
            filter={filter}
            heatmapIntensity={1.65}
            heatmapRadius={36}
            onSelectPonto={onSelectPonto}
            focusPontoId={focusPontoId}
            layers={{
              demandas: showPontos,
              heatmap,
              cobertura,
            }}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 p-3 md:left-4 md:right-auto md:w-[min(100%,22rem)] md:p-4">
            {showFilters && (
              <div className="pointer-events-auto rounded-xl border border-folha-muted/30 bg-white/95 p-2.5 text-[10px] shadow-soft vu-filter-in">
                <p className="mb-1 font-semibold text-tinta">Urgência</p>
                <div className="h-2 w-28 rounded-full bg-gradient-to-r from-ipe via-[#C86428] to-laterita" />
              </div>
            )}
            <Link
              href="/pontos/novo"
              className="pointer-events-auto ml-auto inline-flex items-center gap-2 rounded-full bg-folha px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-folha-light"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Mapear novo local</span>
              <span className="sm:hidden">Novo</span>
            </Link>
          </div>
        </div>

        <aside className="hidden w-80 shrink-0 flex-col border-l border-folha-muted/30 bg-white md:flex">
          <div className="border-b border-folha-muted/30 p-4">
            <h2 className="font-display text-lg font-semibold text-folha">
              Atividade recente
            </h2>
            <p className="text-xs text-tinta-muted">Mutirões · SEMAM / ONG</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {mutiroes.map((m) => (
              <Link
                key={m.id}
                href={m.demandaId ? `/pontos/${m.demandaId}` : '/mutiroes'}
                className="flex gap-3 rounded-xl border border-folha-muted/25 p-3 transition hover:border-folha/30 hover:bg-sol"
              >
                <MutiraoCover compact foto={m.foto} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-tinta">
                    {m.titulo}
                  </p>
                  <p className="text-xs text-tinta-muted">
                    {m.bairro} · {m.ong}
                  </p>
                  <p className="mt-1 text-xs font-medium text-folha">
                    {format(parseISO(m.data), 'dd MMM', { locale: ptBR })} ·{' '}
                    {m.horario}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <DemandaSheet
        demanda={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        votos={votosSheet}
        showApoiar
        onApoiar={() => {
          if (!selected) return;
          apoiar(selected.id);
          toast('Apoio registrado — obrigado!', 'folha');
        }}
      />
    </div>
  );
}
