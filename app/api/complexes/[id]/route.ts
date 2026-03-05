/**
 * GET /api/complexes/:id
 * 청약 단지 상세 조회 엔드포인트
 *
 * 특정 단지의 상세 정보(공급유형, 일정 등)를 반환한다.
 * - 인증 필수 (JWT)
 * - 경로 파라미터: id (uuid)
 */
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  ErrorCode,
} from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/services/auth-service';
import { getComplexDetail } from '@/lib/services/complex-service';
import { logger } from '@/lib/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    await requireAuth(supabase);

    const { id } = await params;

    /** 단지 상세 조회 */
    const complex = await getComplexDetail(supabase, id);

    if (!complex) {
      return errorResponse(ErrorCode.COMPLEX_NOT_FOUND, '해당 단지를 찾을 수 없습니다.');
    }

    return successResponse(complex);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return errorResponse(ErrorCode.AUTH_REQUIRED);
    }

    logger.error('complex detail failed', { error });
    return errorResponse(ErrorCode.INTERNAL_ERROR);
  }
}
