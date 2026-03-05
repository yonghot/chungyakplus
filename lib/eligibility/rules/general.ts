/**
 * 일반공급 자격 판정 규칙 (주택공급에 관한 규칙 제25조)
 *
 * 판정 항목:
 * 1. 무주택 세대구성원 여부
 * 2. 청약통장 가입 여부 및 지역별 납입 기간 충족
 * 3. 세대주 여부 확인
 *
 * 순수 함수. 부수효과 없음.
 */

import { calculateMonthsDiff } from '@/lib/utils/format';
import type {
  SupplyTypeRule,
  ProfileInput,
  ComplexInput,
  RuleCondition,
  EligibilityResult,
  EligibilityReason,
} from '@/lib/eligibility/types';

const LAW_REFERENCE = '주택공급에 관한 규칙 제25조';

/**
 * 지역별 최소 청약통장 납입 기간 (개월)
 *
 * 투기과열지구/청약과열지역: 24개월
 * 수도권: 12개월
 * 기타 지역: 6개월
 *
 * MVP에서는 수도권/비수도권 2단계로 단순화한다.
 */
const METRO_REGIONS = ['서울', '경기', '인천'];

function getMinSubscriptionMonths(region: string): number {
  // 수도권: 12개월, 비수도권: 6개월 (MVP 단순화)
  return METRO_REGIONS.includes(region) ? 12 : 6;
}

/**
 * 무주택 세대구성원 여부를 확인한다.
 * 무주택 시작일이 있으면 무주택으로 판정한다.
 */
function checkHomelessStatus(profile: ProfileInput): EligibilityReason {
  const passed = profile.homeless_start_date !== null;

  return {
    rule_key: 'general_homeless_status',
    rule_name: '무주택 세대구성원',
    passed,
    law_reference: LAW_REFERENCE,
    detail: passed
      ? '무주택 세대구성원 요건 충족'
      : '무주택 확인 불가 (무주택 시작일 미입력)',
  };
}

/**
 * 청약통장 가입 여부 및 지역별 납입 기간 충족을 확인한다.
 *
 * - 청약저축 또는 주택청약종합저축에 가입되어 있어야 한다.
 * - 지역별 최소 납입 기간을 충족해야 한다.
 */
function checkSubscription(
  profile: ProfileInput,
  complex: ComplexInput,
): EligibilityReason {
  // 청약통장 미가입
  if (!profile.subscription_type || !profile.subscription_start_date) {
    return {
      rule_key: 'general_subscription',
      rule_name: '청약통장 가입 및 납입기간',
      passed: false,
      law_reference: LAW_REFERENCE,
      detail: '청약통장 미가입 또는 가입정보 미입력',
    };
  }

  const subscriptionMonths = calculateMonthsDiff(profile.subscription_start_date);
  const minMonths = getMinSubscriptionMonths(complex.region);

  const passed = subscriptionMonths >= minMonths;

  return {
    rule_key: 'general_subscription',
    rule_name: '청약통장 가입 및 납입기간',
    passed,
    law_reference: LAW_REFERENCE,
    detail: passed
      ? `청약통장 가입기간 ${subscriptionMonths}개월 (최소 ${minMonths}개월 충족)`
      : `청약통장 가입기간 ${subscriptionMonths}개월 (최소 ${minMonths}개월 미충족)`,
  };
}

/**
 * 세대주 여부를 확인한다.
 * 일반공급은 세대주만 청약 가능하다.
 */
function checkHouseholdHead(profile: ProfileInput): EligibilityReason {
  const passed = profile.is_household_head;

  return {
    rule_key: 'general_household_head',
    rule_name: '세대주 여부',
    passed,
    law_reference: LAW_REFERENCE,
    detail: passed
      ? '세대주 요건 충족'
      : '세대주가 아님 (일반공급은 세대주만 청약 가능)',
  };
}

/**
 * 과거 당첨 이력을 확인한다.
 * 과거 당첨 이력이 있으면 일정 기간 재당첨이 제한된다.
 * MVP에서는 당첨 이력 유무만 확인한다.
 */
function checkWinHistory(profile: ProfileInput): EligibilityReason {
  const passed = !profile.has_won_before;

  return {
    rule_key: 'general_win_history',
    rule_name: '재당첨 제한',
    passed,
    law_reference: '주택공급에 관한 규칙 제54조',
    detail: passed
      ? '과거 당첨 이력 없음'
      : '과거 당첨 이력 있음 (재당첨 제한 기간 확인 필요)',
  };
}

/** 일반공급 규칙 모듈 */
export const generalRule: SupplyTypeRule = {
  type: 'general',
  label: '일반공급',

  evaluate(
    profile: ProfileInput,
    complex: ComplexInput,
    _params: RuleCondition[],
  ): EligibilityResult {
    const reasons: EligibilityReason[] = [
      checkHomelessStatus(profile),
      checkSubscription(profile, complex),
      checkHouseholdHead(profile),
      checkWinHistory(profile),
    ];

    // 모든 규칙을 충족하면 eligible, 하나라도 실패하면 ineligible
    const allPassed = reasons.every((r) => r.passed);

    return {
      supply_type: 'general',
      result: allPassed ? 'eligible' : 'ineligible',
      reasons,
    };
  },
};
