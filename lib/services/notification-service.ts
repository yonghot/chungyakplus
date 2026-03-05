import type { Notification, NotificationType } from '@/types/database';
import type { SupabaseDb } from '@/types/supabase';
import { logger } from '@/lib/utils/logger';
import * as notificationRepo from '@/lib/repositories/notification-repository';

/** 알림 목록 + 읽지 않은 수 */
export interface NotificationsWithCount {
  notifications: Notification[];
  unreadCount: number;
}

/** 알림 목록과 읽지 않은 수를 함께 조회한다. */
export async function getNotifications(
  supabase: SupabaseDb,
  userId: string,
): Promise<NotificationsWithCount> {
  const [listResult, countResult] = await Promise.all([
    notificationRepo.list(supabase, userId),
    notificationRepo.getUnreadCount(supabase, userId),
  ]);

  if (listResult.error) {
    logger.error('notification-service.getNotifications list failed', {
      userId,
      error: listResult.error,
    });
  }

  if (countResult.error) {
    logger.error('notification-service.getNotifications count failed', {
      userId,
      error: countResult.error,
    });
  }

  return {
    notifications: listResult.data ?? [],
    unreadCount: countResult.data ?? 0,
  };
}

/** 알림 읽음 처리 */
export async function markRead(
  supabase: SupabaseDb,
  notificationId: string,
  userId: string,
): Promise<Notification | null> {
  const result = await notificationRepo.markAsRead(
    supabase,
    notificationId,
    userId,
  );

  if (result.error || !result.data) {
    logger.error('notification-service.markRead failed', {
      notificationId,
      userId,
      error: result.error,
    });
    return null;
  }

  return result.data;
}

/** 알림 생성 (비즈니스 로직 포함) */
export async function createNotification(
  supabase: SupabaseDb,
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>,
): Promise<Notification | null> {
  const result = await notificationRepo.create(supabase, {
    user_id: userId,
    type,
    title,
    body: message,
    data: data ?? {},
  });

  if (result.error || !result.data) {
    logger.error('notification-service.createNotification failed', {
      userId,
      type,
      error: result.error,
    });
    return null;
  }

  return result.data;
}
