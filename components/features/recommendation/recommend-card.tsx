'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Complex } from '@/types';

interface RecommendCardProps {
  complex: Complex;
  eligibleTypes: string[];
  totalTypes: number;
}

export function RecommendCard({
  complex,
  eligibleTypes,
  totalTypes,
}: RecommendCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base leading-snug line-clamp-2">
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
        <div className="flex flex-wrap gap-1.5">
          {eligibleTypes.map((type) => (
            <Badge
              key={type}
              variant="outline"
              className="bg-green-100 text-green-700 border-green-200"
            >
              {type}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-700">
            {eligibleTypes.length}개 유형 적격
          </span>
          <span className="text-muted-foreground">/ 총 {totalTypes}개</span>
        </div>

        <Link href={`/complexes/${complex.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            상세보기
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
