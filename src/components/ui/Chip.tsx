'use client';

import { cn } from '@/lib/utils/cn';
import { ButtonHTMLAttributes } from 'react';

export function Chip({
  className,
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active ?? false}
      className={cn(
        'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
        active
          ? 'bg-folha text-white shadow-soft'
          : 'bg-white text-tinta-muted border border-folha-muted/40 hover:border-folha/40 hover:text-folha',
        className
      )}
      {...props}
    />
  );
}
