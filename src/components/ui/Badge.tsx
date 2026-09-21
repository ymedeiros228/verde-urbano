import { cn } from '@/lib/utils/cn';
import { HTMLAttributes } from 'react';

type Tone = 'folha' | 'ipe' | 'laterita' | 'rio' | 'muted';

const tones: Record<Tone, string> = {
  folha: 'bg-folha/10 text-folha border-folha/20',
  ipe: 'bg-ipe/20 text-tinta border-ipe/40',
  laterita: 'bg-laterita/10 text-laterita border-laterita/25',
  rio: 'bg-rio/10 text-rio border-rio/25',
  muted: 'bg-sol text-tinta-muted border-folha-muted/40',
};

export function Badge({
  className,
  tone = 'folha',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
