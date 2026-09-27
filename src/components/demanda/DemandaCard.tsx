'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import { ArrowUp, MapPin } from 'lucide-react';
import { TIPOS_PONTO } from '@/lib/map/terezina';
import { TIPO_ICON } from '@/lib/map/tipoIcons';
import { cn } from '@/lib/utils/cn';
import type { Demanda } from '@/lib/data/mock';

interface DemandaCardProps {
  demanda: Demanda;
  onApoiar?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export function DemandaCard({ demanda, onApoiar, className, style }: DemandaCardProps) {
  const [pulso, setPulso] = useState(0);
  const tipo = TIPOS_PONTO[demanda.tipo];
  const Icon = TIPO_ICON[demanda.tipo];

  return (
    <article
      style={style}
      className={cn(
        'group vu-enter flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-folha-muted/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgba(28,43,34,0.25)]',
        className
      )}
    >
      <Link href={`/pontos/${demanda.id}`} className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-folha to-rio">
        {demanda.foto ? (
          <Image
            src={demanda.foto}
            alt={demanda.titulo}
            fill
            unoptimized={!demanda.foto.startsWith('/')}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-10 w-10 text-white/60" strokeWidth={1.5} />
          </span>
        )}
        <span className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-tinta backdrop-blur">
          <span className="h-2 w-2 rounded-full" style={{ background: tipo.color }} />
          {demanda.badge || tipo.label}
        </span>
        {demanda.mutiraoData && (
          <span className="absolute right-3 top-3 rounded-full bg-ipe px-2.5 py-1 text-[11px] font-semibold text-tinta">
            Mutirão {demanda.mutiraoData}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-1 text-xs font-medium text-tinta-faint">
          <MapPin className="h-3 w-3" />
          {demanda.bairro}
          {demanda.autor && <span className="truncate"> · por {demanda.autor.nome}</span>}
        </p>
        <Link href={`/pontos/${demanda.id}`} className="mt-1 min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold leading-snug text-tinta transition group-hover:text-folha">
            {demanda.titulo}
          </h2>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-tinta-muted">{demanda.descricao}</p>
        </Link>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-tinta-muted">
            <span key={pulso} className={cn('inline-block font-semibold tabular-nums text-tinta', pulso > 0 && 'vu-bump')}>
              {demanda.votos.toLocaleString('pt-BR')}
            </span>{' '}
            {demanda.votos === 1 ? 'apoio' : 'apoios'}
          </p>
          <div className="flex gap-1.5">
            <Link
              href={`/mapear?ponto=${demanda.id}`}
              aria-label="Ver no mapa"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-tinta-muted ring-1 ring-inset ring-folha-muted/40 transition hover:text-folha"
            >
              <MapPin className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => {
                onApoiar?.(demanda.id);
                setPulso((n) => n + 1);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-folha pl-3 pr-3.5 text-xs font-semibold text-white transition hover:bg-folha-light active:scale-95"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Apoiar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
