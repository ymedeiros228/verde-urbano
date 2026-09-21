import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

function EmptyLeaf({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="40" cy="40" r="36" fill="#1A5C3A" fillOpacity="0.08" />
      <path
        d="M40 62c0-18 14-30 28-34-4 16-14 28-28 34Z"
        fill="#1A5C3A"
        fillOpacity="0.35"
      />
      <path
        d="M40 62c0-18-14-30-28-34 4 16 14 28 28 34Z"
        fill="#2D8A58"
        fillOpacity="0.55"
      />
      <path
        d="M40 62V28"
        stroke="#1A5C3A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="52" cy="22" r="4" fill="#E8B84A" />
    </svg>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionHref,
  actionLabel,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'vu-enter flex flex-col items-center rounded-2xl border border-dashed border-folha-muted/40 bg-white px-6 py-12 text-center',
        className
      )}
    >
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-folha/10 text-folha">
          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>
      ) : (
        <EmptyLeaf className="h-20 w-20" />
      )}
      <p className="mt-4 font-display text-lg font-semibold text-tinta">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-tinta-muted">{description}</p>
      )}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="mt-5">
          <Button size="sm">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
