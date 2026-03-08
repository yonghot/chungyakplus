'use client';

import { SearchX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { ComplexCard } from '@/components/features/complexes/complex-card';
import type { Complex } from '@/types';

interface ComplexListProps {
  complexes: Complex[];
  loading?: boolean;
  bookmarkedIds?: Set<string>;
  onToggleBookmark?: (id: string) => void;
  onResetFilter?: () => void;
}

function ComplexCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-md">
      {/* 상단 그라데이션 바 자리 */}
      <div className="h-0.5 bg-muted/60" />
      <div className="space-y-3.5 px-6 pb-6 pt-5">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/2 rounded-md" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-md" />
        </div>
        <Skeleton className="h-7 w-2/3 rounded-md" />
      </div>
    </div>
  );
}

export function ComplexList({
  complexes,
  loading = false,
  bookmarkedIds,
  onToggleBookmark,
  onResetFilter,
}: ComplexListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ComplexCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (complexes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
          <SearchX className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="mt-4 text-base font-semibold text-foreground">
          조건에 맞는 단지가 없어요
        </p>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          다른 지역이나 접수 상태로 검색해보세요.
          <br />
          새로운 단지가 곧 등록될 수 있습니다.
        </p>
        {onResetFilter && (
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            onClick={onResetFilter}
          >
            필터 초기화
          </Button>
        )}
      </div>
    );
  }

  return (
    <StaggerContainer
      className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
      staggerDelay={0.07}
    >
      {complexes.map((complex) => (
        <StaggerItem key={complex.id}>
          <ComplexCard
            complex={complex}
            bookmarked={bookmarkedIds?.has(complex.id)}
            onToggleBookmark={onToggleBookmark}
          />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
