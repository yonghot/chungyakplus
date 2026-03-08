'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardCheck, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EligibilityCard } from '@/components/features/eligibility/eligibility-card';
import { ScoreCard } from '@/components/features/eligibility/score-card';
import {
  PageTransition,
  FadeInUp,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/motion';
import { useEligibilityResults, useEvaluate } from '@/hooks/use-eligibility';
import { useComplexDetail } from '@/hooks/use-complexes';
import { getSupplyTypeLabel } from '@/constants/supply-types';
import { formatDate } from '@/lib/utils/format';
import type { EvaluateResponse, ScoreBreakdown } from '@/types';

const ANALYSIS_STEPS = [
  '청약 자격 요건 분석 중',
  '소득 조건 검토 중',
  '보유 자산 확인 중',
  '최종 결과 산출 중',
];

export default function EligibilityPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: complexData } = useComplexDetail(id);
  const { data: results, isLoading: resultsLoading } = useEligibilityResults(id);
  const evaluate = useEvaluate();

  const [lastScore, setLastScore] = useState<ScoreBreakdown | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);

  const handleEvaluate = async () => {
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) { return prev + 1; }
        clearInterval(stepInterval);
        return prev;
      });
    }, 600);

    try {
      const response: EvaluateResponse = await evaluate.mutateAsync({ complexId: id });
      clearInterval(stepInterval);
      if (response.score) {
        setLastScore(response.score);
      }
      toast.success('자격 진단이 완료되었습니다.');
    } catch (err) {
      clearInterval(stepInterval);
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
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-9 w-48 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* 헤더 */}
        <FadeInUp>
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-3 gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => router.push(`/complexes/${id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
              단지 상세로
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">자격 진단 결과</h1>
            {complexData && (
              <p className="mt-1.5 text-muted-foreground">
                {complexData.complex.name}
              </p>
            )}
          </div>
        </FadeInUp>

        {/* 진단 중 상태 */}
        {evaluate.isPending ? (
          <FadeInUp delay={0.1}>
            <Card className="rounded-xl shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  </div>
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Sparkles className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                <p className="mt-5 text-base font-semibold">AI 자격 진단 중</p>
                <p className="mt-1.5 animate-pulse text-sm text-muted-foreground">
                  {ANALYSIS_STEPS[analysisStep]}...
                </p>
                <div className="mt-5 flex gap-1.5">
                  {ANALYSIS_STEPS.map((_, idx) => (
                    <div
                      key={idx}
                      className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
                      style={{
                        backgroundColor:
                          idx <= analysisStep
                            ? 'hsl(var(--primary))'
                            : 'hsl(var(--muted))',
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeInUp>
        ) : !hasResults ? (
          /* 진단 전 상태 */
          <FadeInUp delay={0.1}>
            <Card className="overflow-hidden rounded-xl shadow-md">
              <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/8">
                  <ClipboardCheck className="h-10 w-10 text-primary" />
                </div>
                <p className="mt-5 text-xl font-bold">아직 진단 결과가 없어요</p>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  나의 정보를 기반으로 이 단지의 청약 자격을 즉시 진단해드릴게요.
                </p>
                <button
                  type="button"
                  className="mt-8 inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:from-primary/90 hover:to-primary/70 hover:shadow-lg active:scale-[0.98]"
                  onClick={handleEvaluate}
                >
                  <Sparkles className="h-4 w-4" />
                  지금 진단 시작하기
                </button>
              </CardContent>
            </Card>
          </FadeInUp>
        ) : (
          /* 진단 완료 상태 */
          <>
            <FadeInUp delay={0.05}>
              <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                {evaluatedAt && (
                  <p className="text-sm text-muted-foreground">
                    마지막 진단:{' '}
                    <span className="font-medium text-foreground">
                      {formatDate(evaluatedAt)}
                    </span>
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto gap-1.5"
                  onClick={handleEvaluate}
                  disabled={evaluate.isPending}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  다시 진단하기
                </Button>
              </div>
            </FadeInUp>

            {/* 가점 점수 카드 */}
            {lastScore && (
              <FadeInUp delay={0.1}>
                <ScoreCard score={lastScore} />
              </FadeInUp>
            )}

            {/* 공급유형별 결과 */}
            <FadeInUp delay={0.15}>
              <h2 className="text-lg font-semibold">공급유형별 결과</h2>
            </FadeInUp>

            <StaggerContainer className="space-y-4" staggerDelay={0.08}>
              {resultList.map((result) => (
                <StaggerItem key={result.id}>
                  <EligibilityCard
                    result={result}
                    supplyTypeLabel={getSupplyTypeLabel(result.supply_type)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </>
        )}
      </div>
    </PageTransition>
  );
}
