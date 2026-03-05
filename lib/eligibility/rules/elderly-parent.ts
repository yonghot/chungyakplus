/**
 * 노부모부양 특별공급 자격 판정 규칙 (주택공급에 관한 규칙 제38조)
 *
 * 판정 항목:
 * 1. 만 65세 이상 직계존속 3년 이상 부양 (MVP: 단순화된 확인)
 * 2. 무주택 세대주
 *
 * MVP 제약사항:
 * - 직계존속 정보(나이, 동거기간)를 별도 입력받지 않으므로
 *   세대주 + 무주택 + 부양가족 유무로 1차 스크리닝만 수행한다.
 * - 실제 65세 이상 직계존속 3년 부양 여부는 추가 서류로 확인 필요.
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

const LAW_REFERENCE = '주택공급에 관한 규칙 제38조';

/**
 * 만 65세 이상 직계존속 부양 여부를 확인한다.
 *
 * MVP에서는 부양가족이 1명 이상이면 조건부 충족으로 판정한다.
 * 실제로는 직계존속의 나이(만 65세 이상)와 동거기간(3년 이상)을
 * 별도 확인해야 하므로 conditional로 반환한다.
 */
function checkElderlyParentCare(profile: ProfileInput): EligibilityReason {
  const hasDependents = profile.dependents_count > 0;

  return {
    rule_key: 'elderly_parent_care',
    rule_name: '만 65세 이상 직계존속 3년 이상 부양',
    passed: hasDependents,
    law_reference: LAW_REFERENCE,
    detail: hasDependents
      ? `부양가족 ${profile.dependents_count}명 (만 65세 이상 직계존속 3년 부양 여부 별도 확인 필요)`
      : '부양가족 0명 (직계존속 부양 요건 미충족 가능성 높음)',
  };
}

/**
 * 무주택 세대주 여부를 확인한다.
 * 노부모부양 특별공급은 세대주만 신청 가능하다.
 */
function checkHomelessHouseholdHead(profile: ProfileInput): EligibilityReason {
  const isHomeless = profile.homeless_start_date !== null;
  const isHead = profile.is_household_head;
  const passed = isHomeless && isHead;

  let detail: string;
  if (passed) {
    detail = '무주택 세대주 요건 충족';
  } else if (!isHead && !isHomeless) {
    detail = '세대주가 아니며 무주택 확인 불가';
  } else if (!isHead) {
    detail = '세대주가 아님 (노부모부양 특별공급은 세대주만 신청 가능)';
  } else {
    detail = '무주택 확인 불가 (무주택 시작일 미입력)';
  }

  return {
    rule_key: 'elderly_parent_household_head',
    rule_name: '무주택 세대주',
    passed,
    law_reference: LAW_REFERENCE,
    detail,
  };
}

/** 노부모부양 특별공급 규칙 모듈 */
export const elderlyParentRule: SupplyTypeRule = {
  type: 'elderly_parent',
  label: '노부모부양',

  evaluate(
    profile: ProfileInput,
    _complex: ComplexInput,
    _params: RuleCondition[],
  ): EligibilityResult {
    const reasons: EligibilityReason[] = [
      checkElderlyParentCare(profile),
      checkHomelessHouseholdHead(profile),
    ];

    const allPassed = reasons.every((r) => r.passed);

    // 노부모부양은 직계존속 정보를 직접 확인할 수 없으므로
    // 1차 스크리닝 통과 시에도 conditional로 반환한다.
    return {
      supply_type: 'elderly_parent',
      result: allPassed ? 'conditional' : 'ineligible',
      reasons,
    };
  },
};
