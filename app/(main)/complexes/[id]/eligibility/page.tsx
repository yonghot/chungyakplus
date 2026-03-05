'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EligibilityCard } from '@/components/features/eligibility/eligibility-card';
import { ScoreCard } from '@/components/features/eligibility/score-card';
import { useEligibilityResults, useEvaluate } from '@/hooks/use-eligibility';
import { useComplexDetail } from '@/hooks/use-complexes';
import { getSupplyTypeLabel } from '@/constants/supply-types';
import { formatDate } from '@/lib/utils/format';
import type { EvaluateResponse, ScoreBreakdown } from '@/types';

export default function EligibilityPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: complexData } = useComplexDetail(id);
  const { data: results, isLoading: resultsLoading } = useEligibilityResults(id);
  const evaluate = useEvaluate();

  // 뮤테이션 결과에서 score 정보를 저장
  const [lastScore, setLastScore] = useState<ScoreBreakdown | null>(null);

  const handleEvaluate = async () => {
    try {
      const response: EvaluateResponse = await evaluate.mutateAsync({ complexId: id });
      if (response.score) {
        setLastScore(response.score);
      }
      toast.success('자격 진단이 완료되었습니다.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '자격 진단에 실패했습니다.';
      toast.error(message);
    }
  };

  const resultList = results ?? [];
  const hasResults = resultList.length > 0;
  const evaluatedAt = resultList.length > 0 ? resultList[0]!.evaluated_at : null;

  if (resultsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          onClick={() => router.push(`/complexes/${id}`)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          단지 상세로
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">자격 진단 결과</h1>
        {complexData && (
          <p className="mt-1 text-muted-foreground">
            {complexData.complex.name}
          </p>
        )}
      </div>

      {/* 진단 실행 / 재실행 영역 */}
      {evaluate.isPending ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">진단 중...</p>
            <p className="mt-1 text-sm text-muted-foreground">
              자격 요건을 분석하고 있습니다
            </p>
          </CardContent>
        </Card>
      ) : !hasResults ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">아직 진단 결과가 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">
              아래 버튼을 눌러 자격 진단을 시작하세요
            </p>
            <Button className="mt-6" size="lg" onClick={handleEvaluate}>
              진단 시작
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 진단 시간 및 재진단 */}
          <div className="flex items-center justify-between">
            {evaluatedAt && (
              <p className="text-sm text-muted-foreground">
                마지막 진단: {formatDate(evaluatedAt)}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEvaluate}
              disabled={evaluate.isPending}
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              다시 진단하기
            </Button>
          </div>

          {/* 가점 점수 카드 (일반공급 결과가 있고 score가 있을 때) */}
          {lastScore && <ScoreCard score={lastScore} />}

          {/* 공급유형별 결과 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">공급유형별 결과</h2>
            {resultList.map((result) => (
              <EligibilityCard
                key={result.id}
                result={result}
                supplyTypeLabel={getSupplyTypeLabel(result.supply_type)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
