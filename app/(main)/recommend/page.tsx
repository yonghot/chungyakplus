'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RecommendCard } from '@/components/features/recommendation/recommend-card';
import type { ApiResponse, Complex } from '@/types';

interface RecommendedComplex {
  complex: Complex;
  eligibleTypes: string[];
  totalTypes: number;
}

interface RecommendData {
  recommendations: RecommendedComplex[];
}

export default function RecommendPage() {
  const {
    data,
    isLoading,
    error,
  } = useQuery<RecommendData>({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/recommend');
      const json: ApiResponse<RecommendData> = await response.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.data!;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">맞춤 추천</h1>
        <p className="mt-1 text-muted-foreground">
          내 조건에 적합한 단지를 추천해드립니다
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">
            추천 정보를 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      ) : data && data.recommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.recommendations.map((rec) => (
            <RecommendCard
              key={rec.complex.id}
              complex={rec.complex}
              eligibleTypes={rec.eligibleTypes}
              totalTypes={rec.totalTypes}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-lg font-medium">추천 단지가 없습니다</p>
          <p className="mt-2 text-muted-foreground">
            프로필을 완성하면 맞춤 추천을 받을 수 있습니다
          </p>
          <Link href="/profile">
            <Button className="mt-4">프로필 완성하기</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
