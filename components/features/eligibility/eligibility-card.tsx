'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { EligibilityBadge } from '@/components/features/eligibility/eligibility-badge';
import { cn } from '@/lib/utils/cn';
import type { EligibilityResult, EligibilityReason, EligibilityStatus } from '@/types';

interface EligibilityCardProps {
  result: EligibilityResult;
  supplyTypeLabel: string;
}

const RESULT_STYLES: Record<
  EligibilityStatus,
  { border: string; bg: string }
> = {
  eligible: {
    border: 'border-l-4 border-l-green-500',
    bg: 'bg-green-50/50',
  },
  ineligible: {
    border: 'border-l-4 border-l-red-500',
    bg: 'bg-red-50/50',
  },
  conditional: {
    border: 'border-l-4 border-l-amber-500',
    bg: 'bg-amber-50/50',
  },
};

function ReasonItem({ reason }: { reason: EligibilityReason }) {
  return (
    <li className="flex items-start gap-2 py-1.5">
      {reason.passed ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium">{reason.rule_name}</span>
        <p className="text-xs text-muted-foreground">{reason.message}</p>
        {reason.law_reference && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {reason.law_reference}
          </p>
        )}
      </div>
    </li>
  );
}

export function EligibilityCard({
  result,
  supplyTypeLabel,
}: EligibilityCardProps) {
  const styles = RESULT_STYLES[result.result] ?? RESULT_STYLES.ineligible;
  const reasons = (result.reasons ?? []) as EligibilityReason[];
  const passedReasons = reasons.filter((r) => r.passed);
  const failedReasons = reasons.filter((r) => !r.passed);

  return (
    <Card className={cn(styles.border, styles.bg)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{supplyTypeLabel}</CardTitle>
          <EligibilityBadge status={result.result} />
        </div>
      </CardHeader>
      <CardContent>
        {reasons.length > 0 && (
          <Accordion type="single" collapsible>
            <AccordionItem value="details" className="border-none">
              <AccordionTrigger className="py-2 text-xs text-muted-foreground">
                판정 상세 ({passedReasons.length}개 충족 / {failedReasons.length}개 미충족)
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-0.5">
                  {failedReasons.map((reason) => (
                    <ReasonItem key={reason.rule_key} reason={reason} />
                  ))}
                  {passedReasons.map((reason) => (
                    <ReasonItem key={reason.rule_key} reason={reason} />
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {reasons.length === 0 && (
          <p className="text-sm text-muted-foreground">
            판정 상세 정보가 없습니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
