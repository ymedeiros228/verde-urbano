import { cn } from '@/lib/utils/cn';
import { HTMLAttributes } from 'react';

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/[0.08] bg-[#0f1815]/80 backdrop-blur-xl shadow-[0_0_40px_-12px_rgba(26,92,58,0.3)] transition hover:shadow-[0_0_60px_-12px_rgba(26,92,58,0.45)] hover:-translate-y-0.5',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4 pb-2', className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4', className)} {...props} />;
}
