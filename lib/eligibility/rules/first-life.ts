/**
 * 생애최초 특별공급 자격 판정 규칙 (주택공급에 관한 규칙 제36조)
 *
 * 판정 항목:
 * 1. 생애 최초 주택 구입 (과거 당첨이력 없음)
 * 2. 무주택 세대구성원
 * 3. 소득 기준 충족 (도시근로자 월평균소득 130%)
 * 4. 5년 이상 소득세 납부 (납입횟수로 근사)
 *
 * 순수 함수. 부수효과 없음.
 */

import type {
  SupplyTypeRule,
  ProfileInput,
  ComplexInput,
  RuleCondition,
  EligibilityResult,
  EligibilityReason,
} from '@/lib/eligibility/types';

const LAW_REFERENCE = '주택공급에 관한 규칙 제36조';

/**
 * 생애최초 소득 기준 (2024년 기준, 원/월)
 * 도시근로자 가구당 월평균소득의 130%
 */
const INCOME_LIMIT = 7_094_205;

/**
 * 소득세 납부 최소 기간에 해당하는 청약 납입 횟수
 * 5년 × 12개월 = 60회 (근사값)
 */
const MIN_DEPOSIT_COUNT = 60;

/**
 * 생애 최초 주택 구입 여부를 확인한다.
 * 과거 주택 당첨 이력이 없어야 한다.
 */
function checkFirstTimeBuyer(profile: ProfileInput): EligibilityReason {
  const passed = !profile.has_won_before;

  return {
    rule_key: 'first_life_first_time',
    rule_name: '생애최초 주택구입',
    passed,
    law_reference: LAW_REFERENCE,
    detail: passed
      ? '과거 주택 당첨 이력 없음 (생애최초 요건 충족)'
      : '과거 주택 당첨 이력 있음 (생애최초 요건 미충족)',
  };
}

/**
 * 무주택 세대구성원 여부를 확인한다.
 */
function checkHomelessStatus(profile: ProfileInput): EligibilityReason {
  const passed = profile.homeless_start_date !== null;

  return {
    rule_key: 'first_life_homeless_status',
    rule_name: '무주택 세대구성원',
    passed,
    law_reference: LAW_REFERENCE,
    detail: passed
      ? '무주택 세대구성원 요건 충족'
      : '무주택 확인 불가 (무주택 시작일 미입력)',
  };
}

/**
 * 소득 기준 충족 여부를 확인한다.
 * 도시근로자 가구당 월평균소득의 130% 이하
 */
function checkIncomeLimit(profile: ProfileInput): EligibilityReason {
  if (profile.monthly_income_krw === null) {
    return {
      rule_key: 'first_life_income',
      rule_name: '소득기준 충족',
      passed: false,
      law_reference: LAW_REFERENCE,
      detail: '월평균 소득 미입력',
    };
  }

  const income = profile.monthly_income_krw;
  const passed = income <= INCOME_LIMIT;

  return {
    rule_key: 'first_life_income',
    rule_name: '소득기준 충족',
    passed,
    law_reference: LAW_REFERENCE,
    detail: passed
      ? `월평균 소득 ${income.toLocaleString('ko-KR')}원 (기준 ${INCOME_LIMIT.toLocaleString('ko-KR')}원 이하 충족)`
      : `월평균 소득 ${income.toLocaleString('ko-KR')}원 (기준 ${INCOME_LIMIT.toLocaleString('ko-KR')}원 초과)`,
  };
}

/**
 * 소득세 납부 기간을 확인한다.
 *
 * 5년 이상 소득세를 납부해야 한다.
 * MVP에서는 청약 납입 횟수로 근사한다 (60회 이상).
 * 실제로는 국세청 소득세 납부 확인이 필요하나, MVP 범위에서는 불가.
 */
function checkTaxPayment(profile: ProfileInput): EligibilityReason {
  if (profile.deposit_count === null) {
    return {
      rule_key: 'first_life_tax_payment',
      rule_name: '소득세 5년 이상 납부',
      passed: false,
      law_reference: LAW_REFERENCE,
      detail: '납입횟수 미입력 (소득세 납부 확인 불가, 근사값 사용)',
    };
  }

  const count = profile.deposit_count;
  const passed = count >= MIN_DEPOSIT_COUNT;

  return {
    rule_key: 'first_life_tax_payment',
    rule_name: '소득세 5년 이상 납부',
    passed,
    law_reference: LAW_REFERENCE,
    detail: passed
      ? `청약 납입횟수 ${count}회 (5년 이상 근사 충족, 실제 소득세 납부 확인 필요)`
      : `청약 납입횟수 ${count}회 (5년=${MIN_DEPOSIT_COUNT}회 미충족, 근사값 기준)`,
  };
}

/** 생애최초 특별공급 규칙 모듈 */
export const firstLifeRule: SupplyTypeRule = {
  type: 'first_life',
  label: '생애최초',

  evaluate(
    profile: ProfileInput,
    _complex: ComplexInput,
    _params: RuleCondition[],
  ): EligibilityResult {
    const reasons: EligibilityReason[] = [
      checkFirstTimeBuyer(profile),
      checkHomelessStatus(profile),
      checkIncomeLimit(profile),
      checkTaxPayment(profile),
    ];

    const allPassed = reasons.every((r) => r.passed);

    return {
      supply_type: 'first_life',
      result: allPassed ? 'eligible' : 'ineligible',
      reasons,
    };
  },
};
