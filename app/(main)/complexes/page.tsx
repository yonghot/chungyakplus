'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComplexList } from '@/components/features/complexes/complex-list';
import { ComplexFilter } from '@/components/features/complexes/complex-filter';
import { PageTransition, FadeInUp } from '@/components/ui/motion';
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

  const resetFilters = useCallback(() => {
    router.push('/complexes');
  }, [router]);

  const currentPage = filters.page ?? 1;
  const limitPerPage = filters.limit ?? 10;
  const totalPages = data ? Math.ceil(data.total / limitPerPage) : 0;
  const rangeStart = (currentPage - 1) * limitPerPage + 1;
  const rangeEnd = Math.min(currentPage * limitPerPage, data?.total ?? 0);

  return (
    <PageTransition>
      <div className="space-y-8">
        <FadeInUp>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">단지 목록</h1>
            <p className="mt-2 text-muted-foreground">
              청약 가능한 아파트 단지를 확인하고 자격을 진단해보세요
            </p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.05}>
          <ComplexFilter
            region={filters.region}
            status={filters.status}
            onFilterChange={updateFilters}
          />
        </FadeInUp>

        {error ? (
          <FadeInUp delay={0.1}>
            <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <p className="mt-4 text-base font-semibold text-destructive">
                단지 목록을 불러오지 못했습니다
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                네트워크 연결을 확인하고 다시 시도해주세요.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                onClick={() => router.refresh()}
              >
                다시 시도
              </Button>
            </div>
          </FadeInUp>
        ) : isLoading || (data && data.items.length > 0) ? (
          <>
            <ComplexList
              complexes={data?.items ?? []}
              loading={isLoading}
              onResetFilter={resetFilters}
            />

            {/* 페이지네이션 */}
            {!isLoading && data && totalPages > 1 && (
              <FadeInUp>
                <div className="flex items-center justify-between border-t pt-6">
                  <p className="text-sm text-muted-foreground">
                    총{' '}
                    <span className="font-medium text-foreground">
                      {data.total}
                    </span>
                    개 중 {rangeStart}–{rangeEnd}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      disabled={currentPage <= 1}
                      onClick={() => updateFilters({ page: currentPage - 1 })}
                      aria-label="이전 페이지"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="icon"
                          className="h-8 w-8 rounded-lg text-xs"
                          onClick={() => updateFilters({ page })}
                          aria-label={`${page}페이지`}
                          aria-current={currentPage === page ? 'page' : undefined}
                        >
                          {page}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      disabled={currentPage >= totalPages}
                      onClick={() => updateFilters({ page: currentPage + 1 })}
                      aria-label="다음 페이지"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </FadeInUp>
            )}
          </>
        ) : (
          <FadeInUp delay={0.1}>
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="mt-4 text-base font-semibold text-foreground">
                조건에 맞는 단지가 없어요
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                필터 조건을 바꾸거나 전체 단지를 확인해보세요.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                onClick={resetFilters}
              >
                전체 단지 보기
              </Button>
            </div>
          </FadeInUp>
        )}
      </div>
    </PageTransition>
  );
}
