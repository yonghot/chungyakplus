'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/services/auth-service';
import { markRead } from '@/lib/services/notification-service';
import { logger } from '@/lib/utils/logger';

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * 알림을 읽음 처리하는 서버 액션
 * @param notificationId - 읽음 처리할 알림 ID
 * @returns 처리 결과 또는 에러 메시지
 */
export async function markNotificationReadAction(
  notificationId: string,
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const userId = await requireAuth(supabase);

    await markRead(supabase, notificationId, userId);

    revalidatePath('/notifications');

    logger.info('알림 읽음 처리 완료', { userId, notificationId });

    return { success: true };
  } catch (error) {
    logger.error('알림 읽음 처리 실패', { notificationId, error });
    return { success: false, error: '알림 처리 중 오류가 발생했습니다.' };
  }
}
