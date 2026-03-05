/**
 * GET /api/recommend
 * 맞춤 추천 단지 조회 엔드포인트
 *
 * 사용자 프로필 기반으로 청약 가능성이 높은 단지를 추천한다.
 * - 인증 필수 (JWT)
 * - 사용자 프로필 정보를 기반으로 추천 결과 생성
 */
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  ErrorCode,
} from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/services/auth-service';
import { getRecommendations } from '@/lib/services/recommend-service';
import { logger } from '@/lib/utils/logger';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await requireAuth(supabase);

    /** 맞춤 추천 조회 */
    const recommendations = await getRecommendations(supabase, userId);

    return successResponse(recommendations);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return errorResponse(ErrorCode.AUTH_REQUIRED);
    }

    logger.error('recommend failed', { error });
    return errorResponse(ErrorCode.INTERNAL_ERROR);
  }
}
