'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

interface CompletionBadgeProps {
  completion: number;
}

function getCompletionConfig(completion: number): {
  label: string;
  className: string;
} {
  if (completion >= 80) {
    return {
      label: '완료',
      className: 'bg-green-100 text-green-700 border-green-200',
    };
  }
  if (completion >= 60) {
    return {
      label: '보통',
      className: 'bg-amber-100 text-amber-700 border-amber-200',
    };
  }
  return {
    label: '미완성',
    className: 'bg-red-100 text-red-700 border-red-200',
  };
}

export function CompletionBadge({ completion }: CompletionBadgeProps) {
  const config = getCompletionConfig(completion);

  return (
    <Badge variant="outline" className={cn(config.className)}>
      프로필 완성도 {completion}%
    </Badge>
  );
}
