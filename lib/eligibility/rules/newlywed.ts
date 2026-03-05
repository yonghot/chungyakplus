/**
 * 신혼부부 특별공급 자격 판정 규칙 (주택공급에 관한 규칙 제35조)
 *
 * 판정 항목:
 * 1. 혼인 기간 7년 이내
 * 2. 무주택 세대구성원
 * 3. 소득 기준 충족 (도시근로자 월평균소득 기준)
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

const LAW_REFERENCE = '주택공급에 관한 규칙 제35조';

/**
 * 신혼부부 소득 기준 (2024년 기준, 원/월)
 *
 * 도시근로자 가구당 월평균소득의 130%:
 * - 3인 이하: 약 7,094,205원 (2024년 기준 근사값)
 * - MVP에서는 단순화된 기준 사용
 *
 * 맞벌이 가구: 140% 적용
 */
const INCOME_LIMIT_SINGLE = 7_094_205;
// 맞벌이 기준: 140% 적용 (향후 맞벌이 판별 로직 추가 시 사용)
const _INCOME_LIMIT_DUAL = 7_640_682;

/** 혼인 기간 최대 제한 (개월) - 7년 = 84개월 */
const MAX_MARRIAGE_MONTHS = 84;

/**
 * 혼인 기간 7년 이내 여부를 확인한다.
 * 혼인 신고일 기준으로 현재까지 84개월(7년) 이내여야 한다.
 */
function checkMarriagePeriod(profile: ProfileInput): EligibilityReason {
  // 미혼이거나 혼인 신고일 미입력
  if (profile.marital_status !== 'married' || !profile.marriage_date) {
    return {
      rule_key: 'newlywed_marriage_period',
      rule_name: '혼인기간 7년 이내',
      passed: false,
      law_reference: LAW_REFERENCE,
      detail: profile.marital_status !== 'married'
        ? '기혼 상태가 아님 (신혼부부 특별공급은 혼인 중인 자만 가능)'
        : '혼인 신고일 미입력',
    };
  }

  const marriageMonths = calculateMonthsDiff(profile.marriage_date);
  const passed = marriageMonths <= MAX_MARRIAGE_MONTHS;

  const years = Math.floor(marriageMonths / 12);
  const remainMonths = marriageMonths % 12;

  return {
    rule_key: 'newlywed_marriage_period',
    rule_name: '혼인기간 7년 이내',
    passed,
    law_reference: LAW_REFERENCE,
    detail: passed
      ? `혼인기간 ${years}년 ${remainMonths}개월 (7년 이내 충족)`
      : `혼인기간 ${years}년 ${remainMonths}개월 (7년 초과)`,
  };
}

/**
 * 무주택 세대구성원 여부를 확인한다.
 */
function checkHomelessStatus(profile: ProfileInput): EligibilityReason {
  const passed = profile.homeless_start_date !== null;

  return {
    rule_key: 'newlywed_homeless_status',
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
 *
 * 도시근로자 가구당 월평균소득 기준:
 * - 일반: 130% 이하
 * - 맞벌이: 140% 이하 (MVP에서는 월소득으로 단순화)
 */
function checkIncomeLimit(profile: ProfileInput): EligibilityReason {
  if (profile.monthly_income_krw === null) {
    return {
      rule_key: 'newlywed_income',
      rule_name: '소득기준 충족',
      passed: false,
      law_reference: LAW_REFERENCE,
      detail: '월평균 소득 미입력',
    };
  }

  // MVP: 단일 소득 기준으로 판정 (맞벌이 구분 불가)
  const limit = INCOME_LIMIT_SINGLE;
  const income = profile.monthly_income_krw;
  const passed = income <= limit;

  return {
    rule_key: 'newlywed_income',
    rule_name: '소득기준 충족',
    passed,
    law_reference: LAW_REFERENCE,
    detail: passed
      ? `월평균 소득 ${income.toLocaleString('ko-KR')}원 (기준 ${limit.toLocaleString('ko-KR')}원 이하 충족)`
      : `월평균 소득 ${income.toLocaleString('ko-KR')}원 (기준 ${limit.toLocaleString('ko-KR')}원 초과)`,
  };
}

/** 신혼부부 특별공급 규칙 모듈 */
export const newlywedRule: SupplyTypeRule = {
  type: 'newlywed',
  label: '신혼부부',

  evaluate(
    profile: ProfileInput,
    _complex: ComplexInput,
    _params: RuleCondition[],
  ): EligibilityResult {
    const reasons: EligibilityReason[] = [
      checkMarriagePeriod(profile),
      checkHomelessStatus(profile),
      checkIncomeLimit(profile),
    ];

    const allPassed = reasons.every((r) => r.passed);

    return {
      supply_type: 'newlywed',
      result: allPassed ? 'eligible' : 'ineligible',
      reasons,
    };
  },
};
