'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HoverLift } from '@/components/ui/motion';
import { cn } from '@/lib/utils/cn';
import type { Complex } from '@/types';

interface RecommendCardProps {
  complex: Complex;
  eligibleCount: number;
}

/**
 * 적격 수에 따라 상단 그라데이션 바의 강도를 결정한다.
 * eligibleCount 1 → 연한 초록, 3 이상 → 진한 초록
 */
function getGradientClass(eligibleCount: number): string {
  if (eligibleCount >= 3) {
    return 'from-green-500 to-emerald-400';
  }
  if (eligibleCount === 2) {
    return 'from-green-400 to-emerald-300';
  }
  return 'from-green-300 to-emerald-200';
}

export function RecommendCard({
  complex,
  eligibleCount,
}: RecommendCardProps) {
  const gradientClass = getGradientClass(eligibleCount);

  return (
    <HoverLift y={-4} scale={1.02}>
      <Card className="overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg">
        {/* 상단 그라데이션 바: 적격 수에 따라 강도 변화 */}
        <div className={cn('h-1.5 w-full bg-gradient-to-r', gradientClass)} />

        <CardHeader className="pb-3 pt-4">
          <CardTitle className="line-clamp-2 text-base leading-snug">
            {complex.name}
          </CardTitle>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>
              {complex.region} {complex.district}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 적격 수 뱃지 */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
                'bg-green-50 text-green-700',
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {eligibleCount}개 유형 적격
            </span>
          </div>

          {/* 상세보기 버튼: group 호버 시 화살표 이동 */}
          <Link href={`/complexes/${complex.id}`} className="group w-full">
            <Button variant="outline" size="sm" className="w-full">
              상세보기
              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </HoverLift>
  );
}
