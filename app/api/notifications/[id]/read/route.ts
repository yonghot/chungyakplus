/**
 * PATCH /api/notifications/:id/read
 * 알림 읽음 처리 엔드포인트
 *
 * 특정 알림을 읽음 상태로 변경한다.
 * - 인증 필수 (JWT)
 * - 경로 파라미터: id (알림 ID)
 * - 본인의 알림만 읽음 처리 가능
 */
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  ErrorCode,
} from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/services/auth-service';
import { markRead } from '@/lib/services/notification-service';
import { logger } from '@/lib/utils/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const userId = await requireAuth(supabase);

    const { id } = await params;

    /** 알림 읽음 처리 */
    const notification = await markRead(supabase, id, userId);

    if (!notification) {
      return errorResponse(ErrorCode.NOT_FOUND, '해당 알림을 찾을 수 없습니다.');
    }

    return successResponse(notification);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return errorResponse(ErrorCode.AUTH_REQUIRED);
    }

    logger.error('notification mark-read failed', { error });
    return errorResponse(ErrorCode.INTERNAL_ERROR);
  }
}
