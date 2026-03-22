import { NextRequest } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { getApartmentsInViewport } from '@/lib/services/map-service';
import { successResponse, errorResponse, ErrorCode } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';

/** 뷰포트 쿼리 파라미터 검증 스키마 */
const boundsSchema = z.object({
  sw_lng: z.coerce.number().min(-180).max(180),
  sw_lat: z.coerce.number().min(-90).max(90),
  ne_lng: z.coerce.number().min(-180).max(180),
  ne_lat: z.coerce.number().min(-90).max(90),
  zoom: z.coerce.number().min(1).max(22).optional().default(14),
});

/**
 * GET /api/map/apartments?sw_lng=&sw_lat=&ne_lng=&ne_lat=&zoom=
 *
 * 뷰포트(바운딩 박스) 내 아파트 단지 목록을 반환한다.
 * 인증 불필요 (공개 API).
 */
export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parseResult = boundsSchema.safeParse(params);

    if (!parseResult.success) {
      return errorResponse(
        ErrorCode.VALIDATION_ERROR,
        '뷰포트 좌표가 올바르지 않습니다.'
      );
    }

    const { sw_lng, sw_lat, ne_lng, ne_lat } = parseResult.data;

    const supabase = await createClient();
    const apartments = await getApartmentsInViewport(
      supabase,
      sw_lng,
      sw_lat,
      ne_lng,
      ne_lat
    );

    return successResponse(apartments);
  } catch (error) {
    logger.error('map apartments query failed', { error });
    return errorResponse(ErrorCode.INTERNAL_ERROR);
  }
}
