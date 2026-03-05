'use client';

import { Star, Clock, ClipboardCheck, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function NotificationsPage() {
  const { data, isLoading, error } = useNotifications();
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
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">알림</h1>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">
            알림을 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">알림</h1>
        {unreadCount > 0 && (
          <Badge variant="default">{unreadCount}</Badge>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = NOTIFICATION_ICONS[notification.type];
            const typeLabel = NOTIFICATION_TYPE_LABELS[notification.type];

            return (
              <button
                key={notification.id}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50',
                  notification.is_read
                    ? 'bg-background'
                    : 'border-l-2 border-l-primary bg-blue-50/50',
                )}
                onClick={() => handleMarkRead(notification.id, notification.is_read)}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    notification.is_read
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  <Icon className="h-4 w-4" />
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
                      notification.is_read ? 'text-foreground' : 'font-medium text-foreground',
                    )}
                  >
                    {notification.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                    {notification.body}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border p-12 text-center">
          <Info className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">새로운 알림이 없습니다</p>
        </div>
      )}
    </div>
  );
}
