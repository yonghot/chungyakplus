'use client';

import { useParams, useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck, ArrowLeft, MapPin, Building2, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useComplexDetail, useToggleBookmark } from '@/hooks/use-complexes';
import { getSupplyTypeLabel } from '@/constants/supply-types';
import { formatCurrency, formatDate, formatArea } from '@/lib/utils/format';
import type { ComplexStatus } from '@/types';

const STATUS_MAP: Record<ComplexStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  upcoming: { label: '공고예정', variant: 'secondary' },
  open: { label: '접수중', variant: 'default' },
  closed: { label: '접수마감', variant: 'outline' },
  completed: { label: '완료', variant: 'destructive' },
};

export default function ComplexDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, error } = useComplexDetail(id);
  const toggleBookmark = useToggleBookmark();

  const handleBookmarkToggle = async () => {
    try {
      const result = await toggleBookmark.mutateAsync(id);
      toast.success(result.bookmarked ? '북마크에 추가했습니다.' : '북마크에서 제거했습니다.');
    } catch {
      toast.error('북마크 처리에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          뒤로가기
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">
            단지 정보를 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  const { complex, supplyTypes } = data;
  const statusInfo = STATUS_MAP[complex.status];

  return (
    <div className="space-y-6">
      {/* 헤더 영역 */}
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            목록으로
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{complex.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <span className="text-sm text-muted-foreground">
              {complex.region} {complex.district}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleBookmarkToggle}
          disabled={toggleBookmark.isPending}
          aria-label="북마크 토글"
        >
          {toggleBookmark.isPending ? (
            <BookmarkCheck className="h-4 w-4 animate-pulse" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* 기본 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">단지 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {complex.address && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">주소</dt>
                  <dd className="text-sm">{complex.address}</dd>
                </div>
              </div>
            )}
            {complex.developer && (
              <div className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">시행사</dt>
                  <dd className="text-sm">{complex.developer}</dd>
                </div>
              </div>
            )}
            {complex.total_units && (
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">총 세대수</dt>
                  <dd className="text-sm">{complex.total_units.toLocaleString()}세대</dd>
                </div>
              </div>
            )}
            {complex.announcement_date && (
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">공고일</dt>
                  <dd className="text-sm">{formatDate(complex.announcement_date)}</dd>
                </div>
              </div>
            )}
          </dl>

          {/* 청약 일정 */}
          {(complex.subscription_start || complex.subscription_end || complex.winner_date) && (
            <div className="mt-6 border-t pt-4">
              <h3 className="mb-3 text-sm font-semibold">청약 일정</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {complex.subscription_start && (
                  <div>
                    <dt className="text-xs text-muted-foreground">접수 시작</dt>
                    <dd className="text-sm font-medium">
                      {formatDate(complex.subscription_start)}
                    </dd>
                  </div>
                )}
                {complex.subscription_end && (
                  <div>
                    <dt className="text-xs text-muted-foreground">접수 마감</dt>
                    <dd className="text-sm font-medium">
                      {formatDate(complex.subscription_end)}
                    </dd>
                  </div>
                )}
                {complex.winner_date && (
                  <div>
                    <dt className="text-xs text-muted-foreground">당첨자 발표</dt>
                    <dd className="text-sm font-medium">
                      {formatDate(complex.winner_date)}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 공급유형 테이블 */}
      {supplyTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">공급유형별 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">공급유형</th>
                    <th className="pb-3 pr-4 text-right font-medium text-muted-foreground">세대수</th>
                    <th className="pb-3 pr-4 text-right font-medium text-muted-foreground">전용면적</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">분양가</th>
                  </tr>
                </thead>
                <tbody>
                  {supplyTypes.map((st) => (
                    <tr key={st.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">
                        {getSupplyTypeLabel(st.type)}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {st.unit_count.toLocaleString()}세대
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {st.area_sqm ? formatArea(st.area_sqm) : '-'}
                      </td>
                      <td className="py-3 text-right">
                        {st.price_krw ? formatCurrency(st.price_krw) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA 버튼 */}
      <div className="flex gap-3">
        <Button
          className="flex-1"
          size="lg"
          onClick={() => router.push(`/complexes/${id}/eligibility`)}
        >
          자격 진단하기
        </Button>
      </div>
    </div>
  );
}
