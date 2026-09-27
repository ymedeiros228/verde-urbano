'use client';

import Image from 'next/image';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';

import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { MutiraoCover } from '@/components/demanda/DemandaCover';
import { useToast } from '@/components/ui/Toast';
import { useMutiroes } from '@/hooks/useMutiroes';
import { useEngagement } from '@/hooks/useEngagement';
import { cn } from '@/lib/utils/cn';

export default function MutiroesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl p-4 text-sm text-tinta-muted">
          Carregando mutirões…
        </div>
      }
    >
      <MutiroesPageInner />
    </Suspense>
  );
}

function MutiroesPageInner() {
  const { data: mutiroes = [], isLoading } = useMutiroes();
  const { toast } = useToast();
  const { inscrito, inscrever } = useEngagement();
  const searchParams = useSearchParams();
  const destaque = searchParams.get('destaque');
  const destaqueRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!destaque || isLoading) return;
    const el = document.getElementById(`mutirao-${destaque}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [destaque, isLoading, mutiroes]);

  return (
    <div className="mx-auto max-w-6xl p-4 md:px-6 md:pb-10 md:pt-8">
      <PageHeader
        eyebrow="App cidadão · Teresina"
        title="Mutirões"
        description="Ações coletivas em Teresina com apoio da ONG e da SEMAM."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-folha-muted/30 bg-white"
            >
              <div className="aspect-[4/5] animate-pulse bg-folha-muted/25 sm:aspect-[16/10]" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-16 animate-pulse rounded bg-folha-muted/25" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-folha-muted/25" />
              </div>
            </div>
          ))}
        {!isLoading && mutiroes.length === 0 && (
          <EmptyState
            className="col-span-full"
            title="Nenhum mutirão agendado"
            description="Enquanto isso, veja viveiros e canais oficiais ou mapeie um local."
            actionHref="/guias#viveiros"
            actionLabel="Ver viveiros SEMAM"
          />
        )}
        {!isLoading &&
          mutiroes.map((m) => {
            const pct = Math.min(
              100,
              Math.round((m.voluntarios / m.capacidade) * 100)
            );
            const jaInscrito = inscrito(m.id);
            const isDestaque = destaque === m.id;
            return (
              <article
                key={m.id}
                id={`mutirao-${m.id}`}
                ref={isDestaque ? destaqueRef : undefined}
                className={cn(
                  'group vu-enter flex flex-col overflow-hidden rounded-3xl bg-white ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgba(28,43,34,0.25)]',
                  isDestaque ? 'ring-2 ring-ipe' : 'ring-folha-muted/25'
                )}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-folha to-rio">
                  {m.foto && (
                    <Image
                      src={m.foto}
                      alt={m.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  )}
                  <span className="absolute left-3 top-3 flex w-14 flex-col items-center overflow-hidden rounded-2xl bg-white text-center shadow-lg">
                    <span className="w-full bg-laterita py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {format(parseISO(m.data), 'MMM', { locale: ptBR }).replace('.', '')}
                    </span>
                    <span className="py-1 font-display text-2xl font-semibold leading-none text-tinta">
                      {format(parseISO(m.data), 'dd')}
                    </span>
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-folha backdrop-blur">
                    {m.tipo}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div className="flex-1">
                    <h2 className="font-display text-xl font-semibold leading-snug text-tinta group-hover:text-folha">
                      {m.titulo}
                    </h2>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-tinta-muted">
                      <Clock className="h-3.5 w-3.5" />
                      {format(parseISO(m.data), "EEEE", { locale: ptBR })} · {m.horario}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-tinta-muted">
                      <MapPin className="h-3.5 w-3.5" />
                      {m.bairro}
                      {m.demandaId && (
                        <Link
                          href={`/mapear?ponto=${m.demandaId}`}
                          className="ml-1 text-xs font-semibold text-folha underline-offset-2 hover:underline"
                        >
                          ver no mapa
                        </Link>
                      )}
                    </p>
                    <p className="mt-2 text-xs text-tinta-faint">{m.ong}</p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex -space-x-2" aria-hidden>
                        {['#1A5C3A', '#2A6B7C', '#E8B84A', '#B54A2A'].map((c, i) => (
                          <span
                            key={c}
                            className="h-7 w-7 rounded-full ring-2 ring-white"
                            style={{ background: c }}
                          />
                        ))}
                      </span>
                      <span className="text-xs text-tinta-muted">
                        <span className="font-semibold tabular-nums text-tinta">{m.voluntarios + (jaInscrito ? 1 : 0)}</span> de{' '}
                        {m.capacidade} vagas
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-folha-muted/25">
                      <div
                        className="vu-grow h-full rounded-full bg-folha"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={jaInscrito}
                    onClick={() => {
                      inscrever(m.id);
                      toast('Inscrição confirmada — até lá!', 'ipe');
                    }}
                    className={cn(
                      'inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition active:scale-[0.98]',
                      jaInscrito
                        ? 'bg-folha/10 text-folha'
                        : 'bg-folha text-white shadow-[0_10px_24px_-8px_rgba(26,92,58,0.5)] hover:bg-folha-light'
                    )}
                  >
                    {jaInscrito ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Você vai participar
                      </>
                    ) : (
                      'Quero participar'
                    )}
                  </button>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}
