'use client';

import Link from 'next/link';
import { DemandaCover } from '@/components/demanda/DemandaCover';
import { cn } from '@/lib/utils/cn';
import type { Demanda } from '@/lib/data/mock';

interface DemandaTileProps {
  demanda: Demanda;
  className?: string;
}

/** Compact horizontal tile for rails (feed + landing). */
export function DemandaTile({ demanda, className }: DemandaTileProps) {
  return (
    <Link
      href={`/pontos/${demanda.id}`}
      className={cn(
        'group flex w-64 shrink-0 gap-3 rounded-2xl border border-folha-muted/25 bg-white p-2.5 shadow-soft transition hover:border-folha/30 hover:bg-sol sm:w-72',
        className
      )}
    >
      <DemandaCover
        compact
        tipo={demanda.tipo}
        local={demanda.local}
        bairro={demanda.bairro}
        foto={demanda.foto}
        className="h-20 w-20 shrink-0 rounded-xl"
      />
      <div className="min-w-0 flex-1 py-0.5">
        <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-tinta group-hover:text-folha">
          {demanda.titulo}
        </p>
        <p className="mt-1 truncate text-xs text-tinta-muted">
          {demanda.bairro}
        </p>
        <p className="mt-1 text-xs font-semibold text-folha">
          {demanda.votos.toLocaleString('pt-BR')} apoios
        </p>
      </div>
    </Link>
  );
}
