/**
 * POST /api/eligibility/evaluate
 * 청약 자격 판정 엔드포인트
 *
 * 사용자의 프로필 정보를 기반으로 특정 단지의 공급유형별 자격을 판정한다.
 * - 인증 필수 (JWT)
 * - 요청 본문: { complex_id: uuid, supply_types?: SupplyType[] }
 * - ProfileIncompleteError: 프로필 정보 부족 시
 * - DataLoadError: 단지 정보 조회 실패 시
 */
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  ErrorCode,
} from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/services/auth-service';
import {
  evaluateEligibility,
  ProfileIncompleteError,
  DataLoadError,
} from '@/lib/services/eligibility-service';
import { evaluateRequestSchema } from '@/lib/validations/eligibility';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await requireAuth(supabase);

    /** 요청 본문 파싱 및 유효성 검증 */
    const rawBody = await request.json();
    const parseResult = evaluateRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return errorResponse(ErrorCode.VALIDATION_ERROR, parseResult.error.message);
    }

    const { complex_id, supply_types } = parseResult.data;

    /** 자격 판정 실행 */
    const result = await evaluateEligibility(
      supabase,
      userId,
      complex_id,
      supply_types,
    );

    return successResponse(result);
  } catch (error) {
    /** 인증 실패 */
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return errorResponse(ErrorCode.AUTH_REQUIRED);
    }

    /** 프로필 미완성 */
    if (error instanceof ProfileIncompleteError) {
      return errorResponse(ErrorCode.PROFILE_INCOMPLETE, error.message);
    }

    /** 단지 정보 없음 */
    if (error instanceof DataLoadError) {
      return errorResponse(ErrorCode.COMPLEX_NOT_FOUND, error.message);
    }

    logger.error('eligibility/evaluate failed', { error });
    return errorResponse(ErrorCode.INTERNAL_ERROR);
  }
}
