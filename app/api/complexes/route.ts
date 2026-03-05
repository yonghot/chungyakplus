/**
 * GET /api/complexes
 * 청약 단지 목록 조회 엔드포인트
 *
 * 지역, 상태, 페이지네이션 기반 단지 목록을 반환한다.
 * - 인증 필수 (JWT)
 * - 쿼리 파라미터: ?region=서울&status=open&page=1&limit=20
 */
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  ErrorCode,
} from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/services/auth-service';
import { listComplexes } from '@/lib/services/complex-service';
import { complexQuerySchema } from '@/lib/validations/eligibility';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    await requireAuth(supabase);

    /** 쿼리 파라미터 파싱 및 유효성 검증 */
    const { searchParams } = new URL(request.url);
    const rawQuery = {
      region: searchParams.get('region') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page')
        ? Number(searchParams.get('page'))
        : undefined,
      limit: searchParams.get('limit')
        ? Number(searchParams.get('limit'))
        : undefined,
    };

    const parseResult = complexQuerySchema.safeParse(rawQuery);

    if (!parseResult.success) {
      return errorResponse(ErrorCode.VALIDATION_ERROR, parseResult.error.message);
    }

    /** 단지 목록 조회 */
    const result = await listComplexes(supabase, parseResult.data);

    return successResponse(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return errorResponse(ErrorCode.AUTH_REQUIRED);
    }

    logger.error('complexes list failed', { error });
    return errorResponse(ErrorCode.INTERNAL_ERROR);
  }
}
