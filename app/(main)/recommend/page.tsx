'use client';

import Link from 'next/link';
import { Sparkles, AlertTriangle, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  FadeIn,
} from '@/components/ui/motion';
import { RecommendCard } from '@/components/features/recommendation/recommend-card';
import type { ApiResponse, Complex } from '@/types';

interface RecommendedComplex {
  complex: Complex;
  eligibleCount: number;
}

function RecommendSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border bg-card shadow-md"
        >
          <Skeleton className="h-1.5 w-full" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RecommendPage() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<RecommendedComplex[]>({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/recommend');
      const json: ApiResponse<RecommendedComplex[]> = await response.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.data!;
    },
  });

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* 페이지 헤더 */}
        <FadeIn>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">맞춤 추천</h1>
              <p className="mt-1 text-muted-foreground">
                내 조건에 적합한 단지를 추천해드립니다
              </p>
            </div>
          </div>
        </FadeIn>

        {isLoading ? (
          <RecommendSkeleton />
        ) : error ? (
          /* 에러 상태 */
          <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <p className="mt-4 font-medium text-destructive">
              추천 정보를 불러오는 중 오류가 발생했습니다
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              잠시 후 다시 시도해주세요.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={() => refetch()}
            >
              다시 시도
            </Button>
          </div>
        ) : data && data.length > 0 ? (
          /* 추천 목록 */
          <StaggerContainer
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.08}
          >
            {data.map((rec) => (
              <StaggerItem key={rec.complex.id}>
                <RecommendCard
                  complex={rec.complex}
                  eligibleCount={rec.eligibleCount}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/20 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="mt-5 text-lg font-semibold">
              내 조건에 맞는 단지를 찾아드릴게요
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              프로필을 완성하면 청약 자격과 가점을 분석해 맞춤 단지를 추천해드립니다
            </p>
            <Link href="/profile" className="mt-6">
              <Button className="bg-gradient-to-r from-primary to-primary/80 shadow-sm hover:from-primary/90 hover:to-primary/70">
                프로필 완성하기
              </Button>
            </Link>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
