/**
 * POST /api/cron/sync-complexes
 * 단지 데이터 동기화 크론 엔드포인트
 *
 * 외부 API(청약홈 등)에서 최신 단지 정보를 가져와 DB에 동기화한다.
 * - CRON_SECRET 헤더 인증 (Authorization: Bearer ${CRON_SECRET})
 * - MVP 단계: placeholder 구현 (실제 동기화 미구현)
 */
import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import {
  successResponse,
  errorResponse,
  ErrorCode,
} from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';

/** 타이밍 공격을 방지하는 문자열 비교 */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // 길이가 다르면 동일 길이로 맞춘 뒤 비교하여 타이밍 차이를 최소화
      const padded = Buffer.alloc(bufA.length);
      bufB.copy(padded, 0, 0, Math.min(bufB.length, bufA.length));
      timingSafeEqual(bufA, padded);
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    /** CRON_SECRET 기반 인증 검증 */
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      logger.error('CRON_SECRET 환경변수가 설정되지 않았습니다.');
      return errorResponse(ErrorCode.INTERNAL_ERROR);
    }

    if (!authHeader || !safeCompare(authHeader, `Bearer ${cronSecret}`)) {
      return errorResponse(ErrorCode.AUTH_REQUIRED, '유효하지 않은 크론 인증입니다.');
    }

    /**
     * MVP: 실제 동기화 로직은 추후 구현 예정
     * TODO: 청약홈 API 연동 및 단지 데이터 동기화
     */
    logger.info('cron/sync-complexes 실행 (MVP placeholder)');

    return successResponse({
      message: 'Sync completed',
      synced: 0,
    });
  } catch (error) {
    logger.error('cron/sync-complexes failed', { error });
    return errorResponse(ErrorCode.INTERNAL_ERROR);
  }
}
