import type { Complex } from '@/types/database';
import type { SupabaseDb } from '@/types/supabase';
import { logger } from '@/lib/utils/logger';
import * as eligibilityRepo from '@/lib/repositories/eligibility-repository';
import * as complexRepo from '@/lib/repositories/complex-repository';

/** 최대 추천 단지 수 */
const MAX_RECOMMENDATIONS = 20;

/** 추천 단지 결과 */
export interface RecommendedComplex {
  complex: Complex;
  /** 해당 단지에서 적격 판정을 받은 공급유형 수 */
  eligibleCount: number;
}

/**
 * 프로필 기반 추천 단지 목록 반환
 *
 * MVP 전략: 'open' 상태인 단지 중에서 사용자가 'eligible' 판정을 받은
 * 단지를 적격 공급유형 수 기준으로 내림차순 정렬하여 반환한다.
 */
export async function getRecommendations(
  supabase: SupabaseDb,
  profileId: string,
): Promise<RecommendedComplex[]> {
  // 1. 사용자의 전체 판정 결과 조회
  const resultsResult = await eligibilityRepo.getResultsForProfile(
    supabase,
    profileId,
  );

  if (resultsResult.error || !resultsResult.data) {
    logger.warn('recommend-service.getRecommendations: no results found', {
      profileId,
      error: resultsResult.error,
    });
    return [];
  }

  // 2. 적격 판정을 받은 단지별 공급유형 수 집계
  const eligibleByComplex = new Map<string, number>();

  for (const result of resultsResult.data) {
    if (result.result === 'eligible') {
      const current = eligibleByComplex.get(result.complex_id) ?? 0;
      eligibleByComplex.set(result.complex_id, current + 1);
    }
  }

  if (eligibleByComplex.size === 0) {
    return [];
  }

  // 3. 해당 단지들 중 open 상태인 것만 필터링 (최대 MAX_RECOMMENDATIONS개)
  const complexIds = Array.from(eligibleByComplex.keys()).slice(0, MAX_RECOMMENDATIONS);
  const recommendations: RecommendedComplex[] = [];

  for (const complexId of complexIds) {
    const complexResult = await complexRepo.getById(supabase, complexId);

    if (
      complexResult.error ||
      !complexResult.data ||
      complexResult.data.complex.status !== 'open'
    ) {
      continue;
    }

    recommendations.push({
      complex: complexResult.data.complex,
      eligibleCount: eligibleByComplex.get(complexId) ?? 0,
    });
  }

  // 4. 적격 공급유형 수 기준 내림차순 정렬
  recommendations.sort((a, b) => b.eligibleCount - a.eligibleCount);

  return recommendations;
}
