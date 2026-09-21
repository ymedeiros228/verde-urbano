'use client';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { MutiraoCover } from '@/components/demanda/DemandaCover';
import { useMutiroes } from '@/hooks/useMutiroes';

export default function GestaoMutiroesPage() {
  const { data: mutiroes = [], isLoading } = useMutiroes();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mutirões"
        description="Agenda coletiva · mesma base do app cidadão."
      />
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl bg-folha-muted/25"
            />
          ))}
        </div>
      )}
      {!isLoading && mutiroes.length === 0 && (
        <EmptyState
          title="Nenhum mutirão"
          description="Quando houver ações agendadas, elas aparecem aqui."
        />
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!isLoading &&
          mutiroes.map((m) => {
            const pct = Math.min(
              100,
              Math.round((m.voluntarios / m.capacidade) * 100)
            );
            return (
              <article
                key={m.id}
                className="vu-enter group flex flex-col overflow-hidden rounded-2xl border border-folha-muted/30 bg-white shadow-soft transition hover:shadow-md"
              >
                <MutiraoCover
                  foto={m.foto}
                  titulo={m.titulo}
                  local={`${m.local} · ${m.bairro}`}
                  className="aspect-[16/10]"
                />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <Badge tone="folha" className="w-fit">
                    {m.tipo}
                  </Badge>
                  <p className="font-display text-lg font-semibold text-tinta group-hover:text-folha">
                    {m.titulo}
                  </p>
                  <p className="text-sm text-folha">
                    {format(parseISO(m.data), "dd 'de' MMMM yyyy", {
                      locale: ptBR,
                    })}{' '}
                    · {m.horario}
                  </p>
                  <div className="mt-auto pt-1">
                    <div className="mb-1 flex justify-between text-xs text-tinta-faint">
                      <span>
                        {m.voluntarios}/{m.capacidade}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-folha-muted/30">
                      <div
                        className="h-full rounded-full bg-folha"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-tinta-faint">{m.ong}</p>
                    {m.demandaId && (
                      <Link
                        href={`/pontos/${m.demandaId}`}
                        className="mt-2 inline-block text-xs font-semibold text-folha hover:underline"
                      >
                        Ver demanda ligada
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}
