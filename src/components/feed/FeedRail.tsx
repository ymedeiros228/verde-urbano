'use client';

import { cn } from '@/lib/utils/cn';

interface FeedRailProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function FeedRail({ title, children, className, action }: FeedRailProps) {
  return (
    <section className={cn('vu-enter', className)}>
      {(title || action) && (
        <div className="mb-3 flex items-end justify-between gap-3 px-4 md:px-6">
          {title ? (
            <h2 className="font-display text-lg font-semibold text-folha md:text-xl">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory md:px-6 [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}
