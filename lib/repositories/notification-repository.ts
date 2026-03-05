import type {
  Notification,
  NotificationInsert,
} from '@/types/database';
import type { SupabaseDb } from '@/types/supabase';
import { logger } from '@/lib/utils/logger';

import type { RepositoryResult } from '@/lib/repositories/profile-repository';

/** 사용자 알림 목록 조회 (최신순) */
export async function list(
  supabase: SupabaseDb,
  userId: string,
): Promise<RepositoryResult<Notification[]>> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<Notification[]>();

  if (error) {
    logger.error('notification-repository.list failed', {
      userId,
      error: error.message,
    });
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}

/** 알림 읽음 처리 (본인 알림만 업데이트) */
export async function markAsRead(
  supabase: SupabaseDb,
  id: string,
  userId: string,
): Promise<RepositoryResult<Notification>> {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .returns<Notification[]>()
    .single();

  if (error) {
    logger.error('notification-repository.markAsRead failed', {
      id,
      userId,
      error: error.message,
    });
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/** 읽지 않은 알림 수 조회 */
export async function getUnreadCount(
  supabase: SupabaseDb,
  userId: string,
): Promise<RepositoryResult<number>> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    logger.error('notification-repository.getUnreadCount failed', {
      userId,
      error: error.message,
    });
    return { data: null, error: error.message };
  }

  return { data: count ?? 0, error: null };
}

/** 알림 생성 */
export async function create(
  supabase: SupabaseDb,
  notification: NotificationInsert,
): Promise<RepositoryResult<Notification>> {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .returns<Notification[]>()
    .single();

  if (error) {
    logger.error('notification-repository.create failed', {
      userId: notification.user_id,
      type: notification.type,
      error: error.message,
    });
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
