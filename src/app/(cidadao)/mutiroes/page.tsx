'use client';

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
                  'group vu-enter flex flex-col overflow-hidden rounded-2xl border bg-white shadow-soft transition hover:shadow-md',
                  isDestaque
                    ? 'border-ipe ring-2 ring-ipe/40'
                    : 'border-folha-muted/30'
                )}
              >
                <MutiraoCover
                  foto={m.foto}
                  titulo={m.titulo}
                  local={`${m.local} · ${m.bairro}`}
                  className="aspect-[4/5] sm:aspect-[16/10]"
                />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <Badge tone="folha" className="w-fit">
                    {m.tipo}
                  </Badge>
                  <div className="flex-1">
                    <h2 className="font-display text-lg font-semibold text-tinta group-hover:text-folha">
                      {m.titulo}
                    </h2>
                    <p className="mt-1 text-sm text-folha">
                      {format(parseISO(m.data), "dd 'de' MMMM", {
                        locale: ptBR,
                      })}{' '}
                      · {m.horario} · {m.ong}
                    </p>
                    {m.demandaId && (
                      <Link
                        href={`/pontos/${m.demandaId}`}
                        className="mt-2 inline-block text-xs font-semibold text-folha underline-offset-2 hover:underline"
                      >
                        Ver demanda no mapa da cidade
                      </Link>
                    )}
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-tinta-faint">
                      <span>
                        {m.voluntarios}/{m.capacidade} voluntários
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-folha-muted/30">
                      <div
                        className="h-full rounded-full bg-folha transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="sm"
                    variant={jaInscrito ? 'secondary' : 'primary'}
                    disabled={jaInscrito}
                    onClick={() => {
                      inscrever(m.id);
                      toast('Inscrição registrada neste aparelho', 'ipe');
                    }}
                  >
                    {jaInscrito ? 'Inscrito' : 'Quero participar'}
                  </Button>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}
