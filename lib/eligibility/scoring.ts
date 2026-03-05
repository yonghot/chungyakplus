/**
 * 84점 만점 가점 산출 시스템 (순수 함수)
 *
 * 주택공급에 관한 규칙 별표1 기준:
 *   무주택기간(32점) + 부양가족수(35점) + 청약통장 가입기간(17점) = 84점
 *
 * 서버/클라이언트 양쪽에서 공유 가능한 순수 함수로 구성한다.
 * 부수효과(DB 호출, 로깅 등) 없음.
 */

import {
  HOMELESS_PERIOD_TABLE,
  HOMELESS_PERIOD_MAX_SCORE,
  DEPENDENTS_TABLE,
  DEPENDENTS_MAX_SCORE,
  SUBSCRIPTION_PERIOD_TABLE,
  SUBSCRIPTION_PERIOD_MAX_SCORE,
  TOTAL_MAX_SCORE,
  lookupScore,
} from '@/constants/scoring-tables';
import { calculateAge, calculateMonthsDiff } from '@/lib/utils/format';
import type { ScoreDetail, ScoreBreakdown } from '@/types';
import type { ProfileInput } from '@/lib/eligibility/types';

/**
 * 무주택기간 가점을 산출한다. (최대 32점)
 *
 * 산정 기준:
 * - 만 30세 이후부터 무주택기간을 산정한다.
 * - 만 30세 이전에 무주택이 된 경우, 만 30세 시점부터 기간을 산정한다.
 * - 만 30세 이후에 무주택이 된 경우, 무주택 시작일부터 산정한다.
 * - 무주택 시작일이 없으면 0점.
 *
 * @param birthDate - 생년월일 (ISO 8601)
 * @param homelessStartDate - 무주택 시작일 (ISO 8601, null이면 유주택)
 * @returns 가점 상세 { score, max: 32, detail }
 */
export function calculateHomelessPeriodScore(
  birthDate: string,
  homelessStartDate: string | null,
): ScoreDetail {
  if (!homelessStartDate) {
    return {
      score: 0,
      max: HOMELESS_PERIOD_MAX_SCORE,
      detail: '무주택 시작일 미입력 (유주택 또는 미확인)',
    };
  }

  const currentAge = calculateAge(birthDate);
  if (currentAge < 30) {
    // 만 30세 미만은 무주택기간 가점 산정 불가
    return {
      score: 0,
      max: HOMELESS_PERIOD_MAX_SCORE,
      detail: `만 ${currentAge}세 - 만 30세 이후부터 무주택기간 산정`,
    };
  }

  // 만 30세 도달 시점 계산 (생년월일 + 30년)
  const birth = new Date(birthDate);
  const age30Date = new Date(birth.getFullYear() + 30, birth.getMonth(), birth.getDate());
  const year = age30Date.getFullYear();
  const month = String(age30Date.getMonth() + 1).padStart(2, '0');
  const day = String(age30Date.getDate()).padStart(2, '0');
  const age30DateStr = `${year}-${month}-${day}`;

  // 무주택기간 산정 시작일: 만 30세 시점과 무주택 시작일 중 늦은 날짜
  const effectiveStartDate = homelessStartDate < age30DateStr
    ? age30DateStr
    : homelessStartDate;

  const months = calculateMonthsDiff(effectiveStartDate);
  const years = months / 12;

  const { score, label } = lookupScore(HOMELESS_PERIOD_TABLE, years);

  return {
    score,
    max: HOMELESS_PERIOD_MAX_SCORE,
    detail: `무주택기간 ${label} (${Math.floor(years)}년 ${months % 12}개월)`,
  };
}

/**
 * 부양가족수 가점을 산출한다. (최대 35점)
 *
 * @param dependentsCount - 부양가족 수 (본인 제외)
 * @returns 가점 상세 { score, max: 35, detail }
 */
export function calculateDependentsScore(dependentsCount: number): ScoreDetail {
  const count = Math.max(0, dependentsCount);
  const { score, label } = lookupScore(DEPENDENTS_TABLE, count);

  return {
    score,
    max: DEPENDENTS_MAX_SCORE,
    detail: `부양가족 ${label}`,
  };
}

/**
 * 청약통장 가입기간 가점을 산출한다. (최대 17점)
 *
 * @param subscriptionStartDate - 청약통장 가입일 (ISO 8601, null이면 미가입)
 * @returns 가점 상세 { score, max: 17, detail }
 */
export function calculateSubscriptionPeriodScore(
  subscriptionStartDate: string | null,
): ScoreDetail {
  if (!subscriptionStartDate) {
    return {
      score: 0,
      max: SUBSCRIPTION_PERIOD_MAX_SCORE,
      detail: '청약통장 미가입 또는 가입일 미입력',
    };
  }

  const months = calculateMonthsDiff(subscriptionStartDate);
  const years = months / 12;

  const { score, label } = lookupScore(SUBSCRIPTION_PERIOD_TABLE, years);

  return {
    score,
    max: SUBSCRIPTION_PERIOD_MAX_SCORE,
    detail: `청약통장 가입기간 ${label} (${Math.floor(years)}년 ${months % 12}개월)`,
  };
}

/**
 * 84점 만점 종합 가점을 산출한다.
 *
 * 무주택기간(32점) + 부양가족수(35점) + 청약통장 가입기간(17점) = 총점(84점)
 *
 * @param profile - 사용자 프로필 입력 데이터
 * @returns 가점 산출 결과 (항목별 상세 + 총점)
 */
export function calculateTotalScore(profile: ProfileInput): ScoreBreakdown {
  const homelessPeriod = calculateHomelessPeriodScore(
    profile.birth_date,
    profile.homeless_start_date,
  );
  const dependents = calculateDependentsScore(profile.dependents_count);
  const subscriptionPeriod = calculateSubscriptionPeriodScore(
    profile.subscription_start_date,
  );

  const total = homelessPeriod.score + dependents.score + subscriptionPeriod.score;

  return {
    homelessPeriod,
    dependents,
    subscriptionPeriod,
    total,
  };
}

/** 84점 만점 상수 (외부 참조용) */
export { TOTAL_MAX_SCORE };
