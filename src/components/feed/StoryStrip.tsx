'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

export interface StoryItem {
  id: string;
  label: string;
  foto?: string;
  active?: boolean;
}

interface StoryStripProps {
  items: StoryItem[];
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  className?: string;
  allLabel?: string;
}

export function StoryStrip({
  items,
  onSelect,
  selectedId,
  className,
  allLabel = 'Todos',
}: StoryStripProps) {
  return (
    <div
      className={cn(
        'flex gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden',
        className
      )}
      role="listbox"
      aria-label="Filtrar por bairro"
    >
      <button
        type="button"
        role="option"
        aria-selected={!selectedId}
        onClick={() => onSelect(null)}
        className="flex w-16 shrink-0 flex-col items-center gap-1.5"
      >
        <span
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full border-2 bg-folha/10 font-display text-sm font-semibold text-folha',
            !selectedId ? 'border-folha' : 'border-folha-muted/40'
          )}
        >
          {allLabel.slice(0, 2)}
        </span>
        <span
          className={cn(
            'w-full truncate text-center text-[10px] font-medium',
            !selectedId ? 'text-folha' : 'text-tinta-faint'
          )}
        >
          {allLabel}
        </span>
      </button>
      {items.map((item) => {
        const active = selectedId === item.id;
        const initial = item.label
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase();
        return (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onSelect(active ? null : item.id)}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                'relative h-14 w-14 overflow-hidden rounded-full border-2',
                active ? 'border-folha' : 'border-folha-muted/40'
              )}
            >
              {item.foto ? (
                <Image
                  src={item.foto}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-folha to-rio font-display text-sm font-semibold text-white">
                  {initial}
                </span>
              )}
            </span>
            <span
              className={cn(
                'w-full truncate text-center text-[10px] font-medium',
                active ? 'text-folha' : 'text-tinta-faint'
              )}
            >
              {item.label.split(' ')[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
