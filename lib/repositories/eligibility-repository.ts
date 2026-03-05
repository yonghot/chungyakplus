import type {
  EligibilityResult,
  EligibilityResultInsert,
  EligibilityRule,
  SupplyType,
} from '@/types/database';
import type { SupabaseDb } from '@/types/supabase';
import { logger } from '@/lib/utils/logger';

import type { RepositoryResult } from '@/lib/repositories/profile-repository';

/** 특정 프로필 + 단지 조합의 판정 결과 조회 */
export async function getResults(
  supabase: SupabaseDb,
  profileId: string,
  complexId: string,
): Promise<RepositoryResult<EligibilityResult[]>> {
  const { data, error } = await supabase
    .from('eligibility_results')
    .select('*')
    .eq('profile_id', profileId)
    .eq('complex_id', complexId)
    .order('supply_type')
    .returns<EligibilityResult[]>();

  if (error) {
    logger.error('eligibility-repository.getResults failed', {
      profileId,
      complexId,
      error: error.message,
    });
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}

/**
 * 판정 결과 upsert
 *
 * profile_id + complex_id + supply_type 조합이 UNIQUE이므로
 * 동일 조합이 존재하면 업데이트, 없으면 삽입한다.
 */
export async function upsertResult(
  supabase: SupabaseDb,
  result: EligibilityResultInsert,
): Promise<RepositoryResult<EligibilityResult>> {
  const { data, error } = await supabase
    .from('eligibility_results')
    .upsert(
      {
        ...result,
        evaluated_at: new Date().toISOString(),
      },
      {
        onConflict: 'profile_id,complex_id,supply_type',
      },
    )
    .select()
    .returns<EligibilityResult[]>()
    .single();

  if (error) {
    logger.error('eligibility-repository.upsertResult failed', {
      profileId: result.profile_id,
      complexId: result.complex_id,
      supplyType: result.supply_type,
      error: error.message,
    });
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/** 공급유형별 활성 자격요건 규칙 조회 */
export async function getRulesBySupplyType(
  supabase: SupabaseDb,
  supplyType: SupplyType,
): Promise<RepositoryResult<EligibilityRule[]>> {
  const { data, error } = await supabase
    .from('eligibility_rules')
    .select('*')
    .eq('supply_type', supplyType)
    .eq('is_active', true)
    .order('priority')
    .returns<EligibilityRule[]>();

  if (error) {
    logger.error('eligibility-repository.getRulesBySupplyType failed', {
      supplyType,
      error: error.message,
    });
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}

/** 특정 프로필의 전체 판정 결과 조회 */
export async function getResultsForProfile(
  supabase: SupabaseDb,
  profileId: string,
): Promise<RepositoryResult<EligibilityResult[]>> {
  const { data, error } = await supabase
    .from('eligibility_results')
    .select('*')
    .eq('profile_id', profileId)
    .order('evaluated_at', { ascending: false })
    .returns<EligibilityResult[]>();

  if (error) {
    logger.error('eligibility-repository.getResultsForProfile failed', {
      profileId,
      error: error.message,
    });
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}
