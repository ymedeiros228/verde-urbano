'use client';

import { useMemo, useState } from 'react';
import { Thermometer, Trees } from 'lucide-react';
import { nivelPrioridade, useBairrosVerde, type BairroVerde } from '@/lib/map/verde';
import { cn } from '@/lib/utils/cn';

type Ordem = 'prioridade' | 'verdes';

/** Ranking dos bairros: quem mais precisa de árvore × quem já tem sombra */
export function BairroRanking({
  onSelect,
  limit = 12,
  className,
}: {
  onSelect?: (b: BairroVerde) => void;
  limit?: number;
  className?: string;
}) {
  const { data = [], isLoading } = useBairrosVerde();
  const [ordem, setOrdem] = useState<Ordem>('prioridade');

  const lista = useMemo(() => {
    const base = data.filter((b) => b.hexagonos >= 6);
    const sorted =
      ordem === 'prioridade'
        ? [...base].sort((a, b) => b.prioridade - a.prioridade)
        : [...base].sort((a, b) => b.copa - a.copa);
    return sorted.slice(0, limit);
  }, [data, ordem, limit]);

  return (
    <div className={className}>
      <div className="flex gap-1 rounded-xl bg-sol p-1 ring-1 ring-inset ring-folha-muted/25">
        {(
          [
            ['prioridade', 'Precisam de árvores'],
            ['verdes', 'Mais arborizados'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setOrdem(id)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-xs font-semibold transition',
              ordem === id ? 'bg-white text-folha shadow-sm' : 'text-tinta-muted hover:text-tinta'
            )}
            aria-pressed={ordem === id}
          >
            {label}
          </button>
        ))}
      </div>

      <ol key={ordem} className="mt-3 space-y-1.5">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="h-14 animate-pulse rounded-2xl bg-sol" />
          ))}
        {lista.map((b, i) => {
          const nivel = nivelPrioridade(b.prioridade);
          const barra = ordem === 'prioridade' ? b.prioridade : Math.min(100, (b.copa / 45) * 100);
          const cor = ordem === 'prioridade' ? nivel.tom : '#2D8A58';
          return (
            <li key={b.bairro} className="vu-stagger" style={{ animationDelay: `${i * 35}ms` }}>
              <button
                type="button"
                onClick={() => onSelect?.(b)}
                className="group flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition hover:bg-sol active:scale-[0.99]"
              >
                <span className="w-5 shrink-0 text-right font-display text-sm font-semibold tabular-nums text-tinta-faint">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-tinta group-hover:text-folha">
                    {b.bairro}
                  </span>
                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-folha-muted/20">
                    <span
                      className="vu-grow block h-full rounded-full"
                      style={{ width: `${Math.max(4, barra)}%`, background: cor }}
                    />
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5 text-[11px] tabular-nums text-tinta-muted">
                  <span className="inline-flex items-center gap-1">
                    <Trees className="h-3 w-3 text-folha-light" />
                    {b.copa.toLocaleString('pt-BR')}%
                  </span>
                  {b.temp != null && (
                    <span className="inline-flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-laterita" />
                      {b.temp.toLocaleString('pt-BR')}°
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
