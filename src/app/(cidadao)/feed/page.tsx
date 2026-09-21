'use client';

import { Suspense } from 'react';
import FeedHome from './FeedHome';
import { DemandaCardSkeleton } from '@/components/ui/Skeleton';

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid max-w-6xl gap-4 p-4 md:grid-cols-2 md:px-6">
          <DemandaCardSkeleton />
          <DemandaCardSkeleton />
          <DemandaCardSkeleton />
          <DemandaCardSkeleton />
        </div>
      }
    >
      <FeedHome />
    </Suspense>
  );
}
