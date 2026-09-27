'use client';

import Image from 'next/image';
import { Users, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { TipoPonto } from '@/lib/map/terezina';
import { TIPO_ICON } from '@/lib/map/tipoIcons';

const TIPO_COVER: Record<
  TipoPonto,
  { Icon: LucideIcon; from: string; to: string; accent: string }
> = {
  terreno_baldio: {
    Icon: TIPO_ICON.terreno_baldio,
    from: '#8B3A22',
    to: '#C45C3A',
    accent: '#F5D98A',
  },
  praca: {
    Icon: TIPO_ICON.praca,
    from: '#0F3D28',
    to: '#1A5C3A',
    accent: '#A8C9B5',
  },
  canteiro: {
    Icon: TIPO_ICON.canteiro,
    from: '#B8922E',
    to: '#E8B84A',
    accent: '#1C2B22',
  },
  lazer_infantil: {
    Icon: TIPO_ICON.lazer_infantil,
    from: '#1A4A56',
    to: '#2A6B7C',
    accent: '#F5D98A',
  },
  outro: {
    Icon: TIPO_ICON.outro,
    from: '#2A3D34',
    to: '#4A5C52',
    accent: '#A8C9B5',
  },
};

interface DemandaCoverProps {
  tipo: TipoPonto;
  local: string;
  bairro: string;
  foto?: string;
  className?: string;
  compact?: boolean;
  /** Taller feed aspect (~4:5 mobile) */
  tall?: boolean;
  votos?: number;
}

function CoverCaption({
  local,
  bairro,
  compact,
  votos,
}: {
  local: string;
  bairro: string;
  compact?: boolean;
  votos?: number;
}) {
  if (compact) return null;
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-tinta/80 via-tinta/35 to-transparent p-4 pt-12 sm:p-5">
      <p className="font-display text-lg font-semibold leading-tight text-white sm:text-xl">
        {local}
      </p>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <p className="text-sm text-white/80">{bairro}</p>
        {typeof votos === 'number' && (
          <p className="shrink-0 text-xs font-semibold text-ipe">
            {votos.toLocaleString('pt-BR')} apoios
          </p>
        )}
      </div>
    </div>
  );
}

function TypographicFallback({
  tipo,
  local,
  bairro,
  compact,
  votos,
}: Omit<DemandaCoverProps, 'foto' | 'className' | 'tall'>) {
  const { Icon, from, to, accent } = TIPO_COVER[tipo] || TIPO_COVER.outro;
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 55%, ${from} 100%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />
      <div
        className={cn(
          'relative z-10 flex h-full flex-col justify-between',
          compact ? 'p-3' : 'p-4 sm:p-5'
        )}
      >
        <Icon
          className={cn(compact ? 'h-6 w-6' : 'h-9 w-9 sm:h-10 sm:w-10')}
          style={{ color: accent }}
          strokeWidth={1.5}
          aria-hidden
        />
        {!compact && (
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-white sm:text-xl">
              {local}
            </p>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p className="text-sm text-white/75">{bairro}</p>
              {typeof votos === 'number' && (
                <p className="shrink-0 text-xs font-semibold text-ipe">
                  {votos.toLocaleString('pt-BR')} apoios
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function DemandaCover({
  tipo,
  local,
  bairro,
  foto,
  className,
  compact,
  tall,
  votos,
}: DemandaCoverProps) {
  return (
    <div
        className={cn(
          'relative overflow-hidden bg-folha-muted/30',
          compact
            ? 'aspect-square shrink-0'
            : tall
              ? 'aspect-[4/5] sm:aspect-[16/10]'
              : 'aspect-[16/10]',
          className
        )}
    >
      {foto ? (
        <>
          <Image
            src={foto}
            alt={`${local} — ${bairro}`}
            fill
            unoptimized={!foto.startsWith('/')}
            className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes={compact ? '120px' : '(max-width: 768px) 100vw, 50vw'}
            priority={false}
          />
          <CoverCaption
            local={local}
            bairro={bairro}
            compact={compact}
            votos={votos}
          />
        </>
      ) : (
        <TypographicFallback
          tipo={tipo}
          local={local}
          bairro={bairro}
          compact={compact}
          votos={votos}
        />
      )}
    </div>
  );
}

interface MutiraoCoverProps {
  foto?: string;
  className?: string;
  compact?: boolean;
  titulo?: string;
  local?: string;
}

export function MutiraoCover({
  foto,
  className,
  compact,
  titulo,
  local,
}: MutiraoCoverProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        compact ? 'h-14 w-14 shrink-0 rounded-xl' : 'aspect-[16/10]',
        className
      )}
      style={
        foto
          ? undefined
          : { background: 'linear-gradient(145deg, #0F3D28 0%, #2D8A58 100%)' }
      }
    >
      {foto ? (
        <Image
          src={foto}
          alt=""
          fill
          className="object-cover"
          sizes={compact ? '56px' : '400px'}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Users
            className={cn(compact ? 'h-6 w-6' : 'h-10 w-10', 'text-ipe-soft')}
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
      )}
      {!compact && (titulo || local) && (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-tinta/75 to-transparent p-4 pt-10">
          {titulo && (
            <p className="font-display text-lg font-semibold text-white">
              {titulo}
            </p>
          )}
          {local && <p className="text-sm text-white/80">{local}</p>}
        </div>
      )}
    </div>
  );
}
