'use client';

import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ComplexCard } from '@/components/features/complexes/complex-card';
import type { Complex } from '@/types';

interface ComplexListProps {
  complexes: Complex[];
  loading?: boolean;
  bookmarkedIds?: Set<string>;
  onToggleBookmark?: (id: string) => void;
}

function ComplexCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow">
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function ComplexList({
  complexes,
  loading = false,
  bookmarkedIds,
  onToggleBookmark,
}: ComplexListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ComplexCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (complexes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">
          조건에 맞는 단지가 없습니다
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          검색 조건을 변경해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {complexes.map((complex) => (
        <ComplexCard
          key={complex.id}
          complex={complex}
          bookmarked={bookmarkedIds?.has(complex.id)}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  );
}
