'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { ScoreBreakdown, ScoreDetail } from '@/types';

interface ScoreCardProps {
  score: ScoreBreakdown;
}

interface ScoreItemProps {
  label: string;
  detail: ScoreDetail;
}

function ScoreItem({ label, detail }: ScoreItemProps) {
  const _percentage = detail.max > 0 ? (detail.score / detail.max) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {detail.score}점 / {detail.max}점
        </span>
      </div>
      <Progress value={detail.score} max={detail.max} />
      <p className="text-xs text-muted-foreground">{detail.detail}</p>
    </div>
  );
}

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">가점 산출 결과</CardTitle>
          <div className="text-right">
            <span className="text-3xl font-bold text-primary">
              {score.total}
            </span>
            <span className="text-sm text-muted-foreground ml-1">/ 84점</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreItem label="무주택기간" detail={score.homelessPeriod} />
        <ScoreItem label="부양가족수" detail={score.dependents} />
        <ScoreItem label="청약통장가입기간" detail={score.subscriptionPeriod} />

        <Accordion type="single" collapsible>
          <AccordionItem value="criteria" className="border-none">
            <AccordionTrigger className="py-2 text-xs text-muted-foreground">
              가점 기준 상세
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">무주택기간 (최대 32점)</p>
                  <p>만 30세 이상 무주택 기간에 따라 1년 2점씩 가산 (최대 15년 이상 32점)</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">부양가족수 (최대 35점)</p>
                  <p>부양가족 1명당 5점 가산 (최대 6명 이상 35점)</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">청약통장가입기간 (최대 17점)</p>
                  <p>가입 기간에 따라 1년 1점씩 가산 (최대 15년 이상 17점)</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
