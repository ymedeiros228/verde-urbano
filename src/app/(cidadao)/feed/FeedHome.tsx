'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DemandaCard } from '@/components/demanda/DemandaCard';
import { DemandaTile } from '@/components/feed/DemandaTile';
import { FeedRail } from '@/components/feed/FeedRail';
import { StoryStrip } from '@/components/feed/StoryStrip';
import { SearchField } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { DemandaCardSkeleton } from '@/components/ui/Skeleton';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useDemandas } from '@/hooks/useDemandas';
import { useEngagement } from '@/hooks/useEngagement';
import {
  BAIRROS_PRIORITARIOS,
  TIPOS_PONTO,
  type TipoPonto,
} from '@/lib/map/terezina';
import { cn } from '@/lib/utils/cn';
import { ArrowRight, Thermometer, Trees } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useBairrosVerde } from '@/lib/map/verde';

function isTipoPonto(v: string | null): v is TipoPonto {
  return Boolean(v && v in TIPOS_PONTO);
}

export default function FeedHome() {
  const { data: demandas = [], isLoading } = useDemandas();
  const { toast } = useToast();
  const { votos: votosExtra, apoiar } = useEngagement();
  const { perfil } = useAuth();
  const { data: bairrosVerde = [] } = useBairrosVerde();
  const meuBairro = perfil?.bairro ?? null;
  const retrato = useMemo(
    () => (meuBairro ? bairrosVerde.find((b) => b.bairro === meuBairro) ?? null : null),
    [bairrosVerde, meuBairro]
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState('');
  const [bairro, setBairro] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoPonto | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const b = searchParams.get('bairro');
    const t = searchParams.get('tipo');
    setBairro(
      b && (BAIRROS_PRIORITARIOS as readonly string[]).includes(b) ? b : null
    );
    setTipo(isTipoPonto(t) ? t : null);
  }, [searchParams]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 48);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const syncUrl = useCallback(
    (nextBairro: string | null, nextTipo: TipoPonto | null) => {
      const params = new URLSearchParams();
      if (nextBairro) params.set('bairro', nextBairro);
      if (nextTipo) params.set('tipo', nextTipo);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  function selectBairro(id: string | null) {
    setBairro(id);
    syncUrl(id, tipo);
  }

  function selectTipo(t: TipoPonto | null) {
    setTipo(t);
    syncUrl(bairro, t);
  }

  function clearFilters() {
    setQ('');
    setBairro(null);
    setTipo(null);
    syncUrl(null, null);
  }

  const enriched = useMemo(
    () =>
      demandas
        .filter((d) => !d.heatOnly)
        .map((d) => ({
          ...d,
          votos: d.votos + (votosExtra[d.id] || 0),
        })),
    [demandas, votosExtra]
  );

  const tiposPresentes = useMemo(() => {
    const set = new Set(enriched.map((d) => d.tipo));
    return (Object.keys(TIPOS_PONTO) as TipoPonto[]).filter((t) => set.has(t));
  }, [enriched]);

  const storyItems = useMemo(() => {
    return BAIRROS_PRIORITARIOS.filter((b) =>
      enriched.some((d) => d.bairro === b)
    ).map((b) => {
      const sample = enriched.find((d) => d.bairro === b && d.foto);
      return { id: b, label: b, foto: sample?.foto };
    });
  }, [enriched]);

  const emAlta = useMemo(
    () => [...enriched].sort((a, b) => b.votos - a.votos).slice(0, 8),
    [enriched]
  );

  const comMutirao = useMemo(
    () =>
      enriched.filter((d) => d.step === 'mutirao' || Boolean(d.mutiraoData)),
    [enriched]
  );

  const pertoDeVoce = useMemo(
    () => (meuBairro ? enriched.filter((d) => d.bairro === meuBairro).slice(0, 8) : []),
    [enriched, meuBairro]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return enriched.filter((d) => {
      if (bairro && d.bairro !== bairro) return false;
      if (tipo && d.tipo !== tipo) return false;
      if (!term) return true;
      return (
        d.titulo.toLowerCase().includes(term) ||
        d.bairro.toLowerCase().includes(term) ||
        d.local.toLowerCase().includes(term)
      );
    });
  }, [enriched, q, bairro, tipo]);

  const hasFilters = Boolean(q.trim() || bairro || tipo);
  const showRails = !hasFilters && !isLoading;

  function onApoiar(id: string) {
    apoiar(id);
    toast('Apoio registrado — obrigado!', 'folha');
  }

  const pertoTitle = `No seu bairro · ${meuBairro ?? ''}`;

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl pb-6">
      <div
        className={cn(
          'overflow-hidden px-4 transition-all duration-300 md:px-6 md:pt-8',
          scrolled
            ? 'max-h-0 py-0 opacity-0 md:max-h-48 md:opacity-100 md:pb-2'
            : 'max-h-48 py-4 opacity-100'
        )}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-folha-light">
              {perfil?.nome ? `Oi, ${perfil.nome.split(' ')[0]}` : 'Verde Urbano · Teresina'}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-tinta md:text-4xl">
              O que a cidade está pedindo
            </h1>
          </div>
          {retrato && (
            <Link
              href={`/mapear?bairro=${encodeURIComponent(retrato.bairro)}`}
              className="group inline-flex items-center gap-3 rounded-2xl bg-white px-3.5 py-2.5 text-sm ring-1 ring-folha-muted/30 transition hover:ring-folha/40"
            >
              <span className="text-xs text-tinta-muted">{retrato.bairro}</span>
              <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-folha">
                <Trees className="h-3.5 w-3.5" />
                {retrato.copa.toLocaleString('pt-BR')}%
              </span>
              {retrato.temp != null && (
                <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-laterita">
                  <Thermometer className="h-3.5 w-3.5" />
                  {retrato.temp.toLocaleString('pt-BR')}°
                </span>
              )}
              <ArrowRight className="h-3.5 w-3.5 text-tinta-faint transition group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          scrolled
            ? 'max-h-0 mb-0 opacity-0 md:mb-3 md:max-h-28 md:opacity-100'
            : 'mb-3 max-h-28 opacity-100'
        )}
      >
        <StoryStrip
          items={storyItems}
          selectedId={bairro}
          onSelect={selectBairro}
        />
      </div>

      <div className="sticky top-0 z-30 border-b border-folha-muted/30 bg-sol/95 px-4 py-3 backdrop-blur md:px-6">
        <SearchField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar espaços, bairros…"
          wrapperClassName="max-w-xl"
          aria-label="Buscar demandas"
        />
        <div
          key={`${tipo ?? 'all'}-${bairro ?? 'all'}`}
          className="vu-filter-in mt-2.5 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Chip active={!tipo} onClick={() => selectTipo(null)}>
            Todos os tipos
          </Chip>
          {tiposPresentes.map((t) => (
            <Chip
              key={t}
              active={tipo === t}
              onClick={() => selectTipo(tipo === t ? null : t)}
            >
              {TIPOS_PONTO[t].label}
            </Chip>
          ))}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 text-xs font-semibold text-folha hover:underline"
          >
            Limpar filtros
          </button>
        )}
        {!hasFilters && (
          <Link
            href="/guias#semam"
            className="mt-2 inline-flex text-xs font-semibold text-folha hover:underline"
          >
            SEMAM · denúncias e mudas →
          </Link>
        )}
      </div>

      {showRails && (
        <div className="mt-6 space-y-7">
          {emAlta.length > 0 && (
            <FeedRail title="Em alta">
              {emAlta.map((d) => (
                <div key={d.id} className="snap-start">
                  <DemandaTile demanda={d} />
                </div>
              ))}
            </FeedRail>
          )}
          {comMutirao.length > 0 && (
            <FeedRail
              title="Com mutirão"
              action={
                <Link
                  href="/mutiroes"
                  className="text-xs font-semibold text-folha hover:underline"
                >
                  Ver agenda
                </Link>
              }
            >
              {comMutirao.map((d) => (
                <div key={d.id} className="snap-start">
                  <DemandaTile demanda={d} />
                </div>
              ))}
            </FeedRail>
          )}
          {pertoDeVoce.length > 0 && (
            <FeedRail title={pertoTitle}>
              {pertoDeVoce.map((d) => (
                <div key={d.id} className="snap-start">
                  <DemandaTile demanda={d} />
                </div>
              ))}
            </FeedRail>
          )}
        </div>
      )}

      <div className="mt-8 flex items-end justify-between gap-3 px-4 md:px-6">
        <h2 className="font-display text-lg font-semibold text-folha md:text-xl">
          {hasFilters
            ? bairro
              ? `Em ${bairro.split(' ')[0]}`
              : 'Resultados'
            : 'Todas as demandas'}
        </h2>
        {!isLoading && filtered.length > 0 && (
          <p className="text-xs font-medium text-tinta-faint">
            {filtered.length} ponto{filtered.length === 1 ? '' : 's'}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-4 px-4 sm:gap-5 md:grid-cols-2 md:px-6 lg:grid-cols-3">
        {isLoading && (
          <>
            <DemandaCardSkeleton />
            <DemandaCardSkeleton />
            <DemandaCardSkeleton />
            <DemandaCardSkeleton />
          </>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full space-y-3">
            <EmptyState
              title="Nenhuma demanda encontrada"
              description={
                hasFilters
                  ? 'Ajuste a busca ou limpe os filtros.'
                  : 'Mapeie um novo local na cidade.'
              }
              actionHref="/mapear"
              actionLabel="Marcar um ponto no mapa"
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
        {filtered.map((d, i) => (
          <DemandaCard
            key={d.id}
            demanda={d}
            onApoiar={onApoiar}
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
