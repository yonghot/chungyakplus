'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/services/auth-service';
import { toggle } from '@/lib/repositories/bookmark-repository';
import { logger } from '@/lib/utils/logger';

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * 단지 북마크를 토글하는 서버 액션 (추가/제거)
 * @param complexId - 북마크할 단지 ID
 * @returns 북마크 상태(추가/제거) 결과 또는 에러 메시지
 */
export async function toggleBookmarkAction(
  complexId: string,
): Promise<ActionResult<{ bookmarked: boolean }>> {
  try {
    const supabase = await createClient();
    const userId = await requireAuth(supabase);

    const result = await toggle(supabase, userId, complexId);

    revalidatePath('/complexes');

    logger.info('북마크 토글 완료', { userId, complexId, added: result.data?.added });

    if (result.error || !result.data) {
      return { success: false, error: result.error ?? '북마크 처리 중 오류가 발생했습니다.' };
    }

    return { success: true, data: { bookmarked: result.data.added } };
  } catch (error) {
    logger.error('북마크 토글 실패', { complexId, error });
    return { success: false, error: '북마크 처리 중 오류가 발생했습니다.' };
  }
}
