'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ComplexList } from '@/components/features/complexes/complex-list';
import { ComplexFilter } from '@/components/features/complexes/complex-filter';
import { useComplexes, type ComplexFilters } from '@/hooks/use-complexes';

export default function ComplexesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: ComplexFilters = useMemo(
    () => ({
      region: searchParams.get('region') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
    }),
    [searchParams],
  );

  const { data, isLoading, error } = useComplexes(filters);

  const updateFilters = useCallback(
    (newFilters: Partial<ComplexFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      // 필터 변경 시 페이지를 1로 리셋 (페이지 변경 제외)
      if (!('page' in newFilters)) {
        params.set('page', '1');
      }

      router.push(`/complexes?${params.toString()}`);
    },
    [router, searchParams],
  );

  const currentPage = filters.page ?? 1;
  const totalPages = data ? Math.ceil(data.total / (filters.limit ?? 10)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">단지 목록</h1>
        <p className="mt-1 text-muted-foreground">
          청약 가능한 아파트 단지를 확인하세요
        </p>
      </div>

      <ComplexFilter
        region={filters.region}
        status={filters.status}
        onFilterChange={updateFilters}
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">
            단지 목록을 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <ComplexList complexes={data.items} />

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              총 {data.total}개 중 {(currentPage - 1) * (filters.limit ?? 10) + 1}
              -{Math.min(currentPage * (filters.limit ?? 10), data.total)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateFilters({ page: currentPage - 1 })}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateFilters({ page: currentPage + 1 })}
              >
                다음
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">
            조건에 맞는 단지가 없습니다.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            필터 조건을 변경해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
