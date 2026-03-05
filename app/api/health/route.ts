/**
 * GET /api/health
 * 서버 상태 확인 엔드포인트
 *
 * 인증 불필요 - 서버 헬스체크용
 * 모니터링 시스템 및 로드밸런서에서 사용
 */
import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/utils/api-response';

export async function GET(_request: NextRequest) {
  return successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
}
