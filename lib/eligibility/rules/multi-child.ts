/**
 * 다자녀 특별공급 자격 판정 규칙 (주택공급에 관한 규칙 제37조)
 *
 * 판정 항목:
 * 1. 미성년 자녀 3명 이상 (부양가족수로 근사)
 * 2. 무주택 세대구성원
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

const LAW_REFERENCE = '주택공급에 관한 규칙 제37조';

/**
 * 다자녀 기준 최소 자녀 수
 *
 * 미성년 자녀 3명 이상이어야 한다.
 * MVP에서는 부양가족수(dependents_count)로 근사한다.
 * 실제로는 미성년 자녀만 카운트해야 하나, 별도 자녀 정보 없이 근사.
 */
const MIN_CHILDREN_COUNT = 3;

/**
 * 미성년 자녀 수를 확인한다.
 *
 * MVP에서는 부양가족수를 미성년 자녀 수의 근사값으로 사용한다.
 * 실제로는 배우자, 부모 등도 부양가족에 포함될 수 있으나,
 * 별도 가족 구성원 입력 기능이 없어 단순화한다.
 */
function checkChildrenCount(profile: ProfileInput): EligibilityReason {
  const count = profile.dependents_count;
  const passed = count >= MIN_CHILDREN_COUNT;

  return {
    rule_key: 'multi_child_children_count',
    rule_name: '미성년 자녀 3명 이상',
    passed,
    law_reference: LAW_REFERENCE,
    detail: passed
      ? `부양가족 ${count}명 (미성년 자녀 3명 이상 근사 충족)`
      : `부양가족 ${count}명 (미성년 자녀 3명 이상 미충족, 부양가족수 기준 근사값)`,
  };
}

/**
 * 무주택 세대구성원 여부를 확인한다.
 */
function checkHomelessStatus(profile: ProfileInput): EligibilityReason {
  const passed = profile.homeless_start_date !== null;

  return {
    rule_key: 'multi_child_homeless_status',
    rule_name: '무주택 세대구성원',
    passed,
    law_reference: LAW_REFERENCE,
    detail: passed
      ? '무주택 세대구성원 요건 충족'
      : '무주택 확인 불가 (무주택 시작일 미입력)',
  };
}

/** 다자녀 특별공급 규칙 모듈 */
export const multiChildRule: SupplyTypeRule = {
  type: 'multi_child',
  label: '다자녀',

  evaluate(
    profile: ProfileInput,
    _complex: ComplexInput,
    _params: RuleCondition[],
  ): EligibilityResult {
    const reasons: EligibilityReason[] = [
      checkChildrenCount(profile),
      checkHomelessStatus(profile),
    ];

    const allPassed = reasons.every((r) => r.passed);

    return {
      supply_type: 'multi_child',
      result: allPassed ? 'eligible' : 'ineligible',
      reasons,
    };
  },
};
