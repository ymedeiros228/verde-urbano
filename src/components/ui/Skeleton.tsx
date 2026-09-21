import { cn } from '@/lib/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-folha-muted/25 motion-reduce:animate-none',
        className
      )}
      aria-hidden
    />
  );
}

export function DemandaCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-folha-muted/30 bg-white shadow-soft">
      <Skeleton className="aspect-[4/5] w-full rounded-none sm:aspect-[16/10]" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
