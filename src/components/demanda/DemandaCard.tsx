'use client';

import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DemandaCover } from '@/components/demanda/DemandaCover';
import { cn } from '@/lib/utils/cn';
import type { Demanda } from '@/lib/data/mock';

interface DemandaCardProps {
  demanda: Demanda;
  onApoiar?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export function DemandaCard({
  demanda,
  onApoiar,
  className,
  style,
}: DemandaCardProps) {
  return (
    <article
      style={style}
      className={cn(
        'group vu-enter flex h-full flex-col overflow-hidden rounded-2xl border border-folha-muted/30 bg-white shadow-soft transition hover:shadow-md',
        className
      )}
    >
      <Link href={`/pontos/${demanda.id}`} className="relative block">
        <DemandaCover
          tall
          tipo={demanda.tipo}
          local={demanda.local}
          bairro={demanda.bairro}
          foto={demanda.foto}
          votos={demanda.votos}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {demanda.badge && (
          <Badge
            tone={demanda.badgeTone || 'folha'}
            className="w-fit normal-case"
          >
            {demanda.badge}
          </Badge>
        )}
        <Link href={`/pontos/${demanda.id}`} className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold leading-snug text-tinta transition group-hover:text-folha sm:text-xl">
            {demanda.titulo}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-tinta-muted">
            {demanda.descricao}
          </p>
        </Link>

        <Button
          className="w-full"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            onApoiar?.(demanda.id);
          }}
        >
          <ArrowUp className="h-4 w-4" />
          Apoiar ({demanda.votos.toLocaleString('pt-BR')})
        </Button>
      </div>
    </article>
  );
}
