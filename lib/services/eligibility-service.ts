/**
 * 자격 판정 오케스트레이션 서비스
 *
 * Supabase를 통한 데이터 로드, 판정 엔진 호출, 결과 저장을 담당한다.
 * 이 파일은 서버 사이드에서만 사용한다 (DB 접근 포함).
 *
 * 순수 함수 기반 판정 로직(engine.ts)과 DB 접근을 분리하여
 * 테스트 용이성과 관심사 분리를 달성한다.
 */

import type { SupplyType, Profile, EligibilityRule } from '@/types/database';
import type { SupabaseDb } from '@/types/supabase';
import type { EvaluateResponse, ScoreBreakdown } from '@/types';
import type {
  ProfileInput,
  ComplexInput,
  RuleParams,
  RuleCondition,
} from '@/lib/eligibility/types';
import { evaluateAll, evaluateSelected } from '@/lib/eligibility/engine';
import { calculateTotalScore } from '@/lib/eligibility/scoring';
import { logger } from '@/lib/utils/logger';

/** 프로필 미완성 오류 */
export class ProfileIncompleteError extends Error {
  constructor(completion: number) {
    super(`프로필 완성도가 부족합니다 (현재 ${completion}%, 최소 80% 필요)`);
    this.name = 'ProfileIncompleteError';
  }
}

/** 데이터 조회 실패 오류 */
export class DataLoadError extends Error {
  constructor(entity: string, detail?: string) {
    super(`${entity} 데이터를 불러올 수 없습니다${detail ? `: ${detail}` : ''}`);
    this.name = 'DataLoadError';
  }
}

/** 최소 프로필 완성도 (%) */
const MIN_PROFILE_COMPLETION = 80;

/**
 * 프로필 완성도를 확인한다.
 *
 * @throws {ProfileIncompleteError} 완성도가 80% 미만인 경우
 */
async function checkProfileCompletion(
  supabase: SupabaseDb,
  profileId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('profiles')
    .select('profile_completion')
    .eq('id', profileId)
    .returns<{ profile_completion: number }[]>()
    .single();

  if (error || !data) {
    throw new DataLoadError('프로필', error?.message);
  }

  if (data.profile_completion < MIN_PROFILE_COMPLETION) {
    throw new ProfileIncompleteError(data.profile_completion);
  }
}

/**
 * 프로필 데이터를 로드하여 ProfileInput 형태로 변환한다.
 */
async function loadProfile(
  supabase: SupabaseDb,
  profileId: string,
): Promise<ProfileInput> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .returns<Profile[]>()
    .single();

  if (error || !data) {
    throw new DataLoadError('프로필', error?.message);
  }

  return {
    birth_date: data.birth_date,
    is_household_head: data.is_household_head,
    marital_status: data.marital_status,
    marriage_date: data.marriage_date,
    dependents_count: data.dependents_count,
    homeless_start_date: data.homeless_start_date,
    total_assets_krw: data.total_assets_krw,
    monthly_income_krw: data.monthly_income_krw,
    car_value_krw: data.car_value_krw,
    subscription_type: data.subscription_type,
    subscription_start_date: data.subscription_start_date,
    deposit_count: data.deposit_count,
    has_won_before: data.has_won_before,
    won_date: data.won_date,
  };
}

/**
 * 단지 및 공급유형 데이터를 로드하여 ComplexInput 형태로 변환한다.
 */
async function loadComplex(
  supabase: SupabaseDb,
  complexId: string,
): Promise<ComplexInput> {
  // 단지 기본 정보 조회
  const { data: complex, error: complexError } = await supabase
    .from('complexes')
    .select('region, district')
    .eq('id', complexId)
    .returns<{ region: string; district: string }[]>()
    .single();

  if (complexError || !complex) {
    throw new DataLoadError('단지', complexError?.message);
  }

  // 해당 단지의 공급유형 조회
  const { data: supplyTypes, error: stError } = await supabase
    .from('supply_types')
    .select('type')
    .eq('complex_id', complexId)
    .returns<{ type: string }[]>();

  if (stError) {
    throw new DataLoadError('공급유형', stError.message);
  }

  const availableTypes = (supplyTypes ?? []).map(
    (st) => st.type as SupplyType,
  );

  return {
    region: complex.region,
    district: complex.district,
    available_supply_types: availableTypes,
  };
}

/**
 * eligibility_rules 테이블에서 활성 규칙 파라미터를 로드한다.
 *
 * 공급유형별로 그룹핑하여 RuleParams 형태로 반환한다.
 * 규칙이 없는 경우 빈 객체를 반환한다 (기본값으로 동작).
 */
async function loadRuleParams(
  supabase: SupabaseDb,
): Promise<RuleParams> {
  const { data, error } = await supabase
    .from('eligibility_rules')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true })
    .returns<EligibilityRule[]>();

  if (error) {
    // 규칙 로드 실패 시 빈 파라미터로 진행 (기본값 사용)
    logger.warn('규칙 파라미터 로드 실패, 기본값으로 진행', { error: error.message });
    return {};
  }

  const params: RuleParams = {};

  for (const row of data ?? []) {
    const type = row.supply_type;
    if (!params[type]) {
      params[type] = [];
    }

    const condition: RuleCondition = {
      rule_key: row.rule_key,
      rule_name: row.rule_name,
      condition: row.condition,
      law_reference: row.law_reference,
      priority: row.priority,
      is_active: row.is_active,
    };

    params[type].push(condition);
  }

  return params;
}

/**
 * 판정 결과를 eligibility_results 테이블에 upsert한다.
 *
 * 동일한 (profile_id, complex_id, supply_type) 조합에 대해
 * 기존 결과가 있으면 갱신하고, 없으면 생성한다.
 */
async function saveResults(
  supabase: SupabaseDb,
  profileId: string,
  complexId: string,
  results: import('@/lib/eligibility/types').EligibilityResult[],
  scoreBreakdown: ScoreBreakdown | null,
): Promise<void> {
  const now = new Date().toISOString();

  const rows = results.map((r) => ({
    profile_id: profileId,
    complex_id: complexId,
    supply_type: r.supply_type,
    result: r.result,
    score: r.supply_type === 'general' && scoreBreakdown
      ? scoreBreakdown.total
      : null,
    reasons: r.reasons.map((reason) => ({
      rule_key: reason.rule_key,
      rule_name: reason.rule_name,
      passed: reason.passed,
      message: reason.detail,
      law_reference: reason.law_reference,
    })),
    evaluated_at: now,
  }));

  for (const row of rows) {
    const { error } = await supabase
      .from('eligibility_results')
      .upsert(row, {
        onConflict: 'profile_id,complex_id,supply_type',
      });

    if (error) {
      logger.error('판정 결과 저장 실패', {
        supply_type: row.supply_type,
        error: error.message,
      });
    }
  }
}

/**
 * 자격 판정을 실행한다.
 *
 * 전체 오케스트레이션 플로우:
 * 1. 프로필 완성도 확인 (80% 이상 필요)
 * 2. 프로필 데이터 로드
 * 3. 단지 + 공급유형 데이터 로드
 * 4. 규칙 파라미터 로드 (eligibility_rules 테이블)
 * 5. 판정 엔진 실행 (전체 또는 선택된 공급유형)
 * 6. 일반공급 포함 시 84점 가점 산출
 * 7. 결과를 eligibility_results 테이블에 저장
 * 8. 판정 응답 반환
 *
 * @param supabase - Supabase 클라이언트 (인증된 세션)
 * @param profileId - 사용자 프로필 ID
 * @param complexId - 단지 ID
 * @param supplyTypes - 판정할 공급유형 (미지정 시 전체)
 * @returns 판정 결과 응답
 *
 * @throws {ProfileIncompleteError} 프로필 완성도 부족
 * @throws {DataLoadError} 데이터 로드 실패
 */
export async function evaluateEligibility(
  supabase: SupabaseDb,
  profileId: string,
  complexId: string,
  supplyTypes?: SupplyType[],
): Promise<EvaluateResponse> {
  // 1. 프로필 완성도 확인
  await checkProfileCompletion(supabase, profileId);

  // 2~4. 데이터 로드 (병렬 실행)
  const [profile, complex, ruleParams] = await Promise.all([
    loadProfile(supabase, profileId),
    loadComplex(supabase, complexId),
    loadRuleParams(supabase),
  ]);

  // 5. 판정 엔진 실행
  const results = supplyTypes && supplyTypes.length > 0
    ? evaluateSelected(profile, complex, ruleParams, supplyTypes)
    : evaluateAll(profile, complex, ruleParams);

  // 6. 일반공급 포함 시 84점 가점 산출
  const hasGeneral = results.some((r) => r.supply_type === 'general');
  const scoreBreakdown: ScoreBreakdown | null = hasGeneral
    ? calculateTotalScore(profile)
    : null;

  // 7. 결과 저장
  await saveResults(supabase, profileId, complexId, results, scoreBreakdown);

  // 8. 응답 반환
  const now = new Date().toISOString();

  return {
    results: results.map((r) => ({
      id: '', // DB에서 생성되는 ID (upsert 후 별도 조회 필요시 사용)
      profile_id: profileId,
      complex_id: complexId,
      supply_type: r.supply_type,
      result: r.result,
      score: r.supply_type === 'general' && scoreBreakdown
        ? scoreBreakdown.total
        : null,
      reasons: r.reasons.map((reason) => ({
        rule_key: reason.rule_key,
        rule_name: reason.rule_name,
        passed: reason.passed,
        message: reason.detail,
        law_reference: reason.law_reference,
      })),
      evaluated_at: now,
    })),
    score: scoreBreakdown,
    evaluatedAt: now,
  };
}
