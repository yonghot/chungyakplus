'use client';

import { Star, Clock, ClipboardCheck, Info, Bell, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PageTransition,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/motion';
import { useNotifications, useMarkRead } from '@/hooks/use-notifications';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { NotificationType } from '@/types';

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  recommendation: Star,
  deadline: Clock,
  result: ClipboardCheck,
  system: Info,
};

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  recommendation: '추천',
  deadline: '마감임박',
  result: '결과',
  system: '시스템',
};

function NotificationsSkeleton() {
  return (
    <div className="space-y-8">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-6 w-8 rounded-full" />
      </div>
      {/* 알림 목록 스켈레톤 */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { data, isLoading, error, refetch } = useNotifications();
  const markRead = useMarkRead();

  const handleMarkRead = async (notificationId: string, isRead: boolean) => {
    if (isRead) { return; }

    try {
      await markRead.mutateAsync(notificationId);
    } catch {
      // 에러는 무시 (읽음 처리 실패가 UX에 치명적이지 않음)
    }
  };

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-8">
        <FadeIn>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Bell className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">알림</h1>
          </div>
        </FadeIn>
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <p className="mt-4 font-medium text-destructive">
            알림을 불러오는 중 오류가 발생했습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            잠시 후 다시 시도해주세요.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={() => refetch()}
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* 페이지 헤더 */}
        <FadeIn>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Bell className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">알림</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="rounded-full px-2.5 py-0.5">
                {unreadCount}
              </Badge>
            )}
          </div>
        </FadeIn>

        {notifications.length > 0 ? (
          <StaggerContainer className="space-y-3" staggerDelay={0.06}>
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type];
              const typeLabel = NOTIFICATION_TYPE_LABELS[notification.type];

              return (
                <StaggerItem key={notification.id}>
                  <button
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border p-4 text-left shadow-sm',
                      'transition-all duration-200 hover:shadow-md',
                      notification.is_read
                        ? 'bg-card hover:bg-muted/30'
                        : 'border-l-4 border-l-primary bg-blue-50/60 hover:bg-blue-50/80',
                    )}
                    onClick={() =>
                      handleMarkRead(notification.id, notification.is_read)
                    }
                  >
                    {/* 알림 아이콘 */}
                    <div
                      className={cn(
                        'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        notification.is_read
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/10 text-primary',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {typeLabel}
                        </span>
                        {!notification.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <p
                        className={cn(
                          'mt-0.5 text-sm',
                          notification.is_read
                            ? 'text-foreground'
                            : 'font-medium text-foreground',
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center rounded-xl bg-muted/30 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-5 font-semibold text-foreground">
              새로운 알림이 없습니다
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              맞춤 추천 단지, 청약 마감일, 당첨 결과 등을 이곳에서 확인할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
