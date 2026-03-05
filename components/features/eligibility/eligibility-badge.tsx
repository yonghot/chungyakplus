'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { EligibilityStatus } from '@/types';

interface EligibilityBadgeProps {
  status: EligibilityStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  EligibilityStatus,
  { label: string; className: string }
> = {
  eligible: {
    label: '적격',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  ineligible: {
    label: '부적격',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  conditional: {
    label: '조건부',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
};

export function EligibilityBadge({ status, className }: EligibilityBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
