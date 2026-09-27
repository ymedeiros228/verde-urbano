'use client';

import { Target, Thermometer, Trees } from 'lucide-react';
import type { Lente } from '@/lib/map/verde';
import { cn } from '@/lib/utils/cn';

const OPCOES: { id: Lente; label: string; icon: typeof Target }[] = [
  { id: 'prioridade', label: 'Prioridade', icon: Target },
  { id: 'copa', label: 'Copa', icon: Trees },
  { id: 'calor', label: 'Calor', icon: Thermometer },
];

/** Controle segmentado com indicador que desliza entre as lentes */
export function LenteSwitch({
  value,
  onChange,
  className,
}: {
  value: Lente;
  onChange: (l: Lente) => void;
  className?: string;
}) {
  const idx = OPCOES.findIndex((o) => o.id === value);
  return (
    <div
      role="radiogroup"
      aria-label="Lente do mapa"
      className={cn(
        'relative grid grid-cols-3 rounded-2xl bg-sol p-1 ring-1 ring-inset ring-folha-muted/30',
        className
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-xl bg-white shadow-[0_2px_10px_rgba(28,43,34,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(${idx * 100}%)` }}
      />
      {OPCOES.map(({ id, label, icon: Icon }) => {
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={cn(
              'relative z-[1] inline-flex h-9 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors duration-200',
              active ? 'text-folha' : 'text-tinta-muted hover:text-tinta'
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={active ? 2.4 : 2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
