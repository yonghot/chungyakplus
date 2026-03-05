/**
 * GET /api/notifications
 * 알림 목록 조회 엔드포인트
 *
 * 사용자에게 전달된 알림(청약 일정, 자격 변동 등) 목록을 반환한다.
 * - 인증 필수 (JWT)
 */
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  ErrorCode,
} from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/services/auth-service';
import { getNotifications } from '@/lib/services/notification-service';
import { logger } from '@/lib/utils/logger';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await requireAuth(supabase);

    /** 알림 목록 조회 */
    const result = await getNotifications(supabase, userId);

    return successResponse(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return errorResponse(ErrorCode.AUTH_REQUIRED);
    }

    logger.error('notifications list failed', { error });
    return errorResponse(ErrorCode.INTERNAL_ERROR);
  }
}
