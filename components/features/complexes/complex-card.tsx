'use client';

import Link from 'next/link';
import { Heart, MapPin, Building2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { formatDateShort } from '@/lib/utils/format';
import type { Complex, ComplexStatus } from '@/types';

interface ComplexCardProps {
  complex: Complex;
  bookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

const STATUS_CONFIG: Record<
  ComplexStatus,
  { label: string; className: string }
> = {
  upcoming: {
    label: '접수예정',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  open: {
    label: '접수중',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  closed: {
    label: '접수마감',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  completed: {
    label: '완료',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

export function ComplexCard({
  complex,
  bookmarked = false,
  onToggleBookmark,
}: ComplexCardProps) {
  const statusConfig = STATUS_CONFIG[complex.status];

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <Link href={`/complexes/${complex.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">{complex.name} 상세보기</span>
      </Link>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug line-clamp-2">
            {complex.name}
          </CardTitle>
          {onToggleBookmark && (
            <Button
              variant="ghost"
              size="icon"
              className="relative z-10 h-8 w-8 shrink-0"
              onClick={(e) => {
                e.preventDefault();
                onToggleBookmark(complex.id);
              }}
              aria-label={bookmarked ? '북마크 해제' : '북마크 추가'}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  bookmarked
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground'
                )}
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {complex.region} {complex.district}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(statusConfig.className)}
          >
            {statusConfig.label}
          </Badge>

          {complex.total_units !== null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span>{complex.total_units}세대</span>
            </div>
          )}
        </div>

        {(complex.subscription_start || complex.subscription_end) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              {complex.subscription_start
                ? formatDateShort(complex.subscription_start)
                : '-'}
              {' ~ '}
              {complex.subscription_end
                ? formatDateShort(complex.subscription_end)
                : '-'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
