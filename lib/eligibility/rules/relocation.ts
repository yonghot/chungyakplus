/**
 * 이전기관 특별공급 자격 판정 규칙 (주택공급에 관한 규칙 제40조)
 *
 * 수도권에서 지방으로 이전하는 공공기관 종사자에게 특별공급.
 *
 * MVP 제약사항:
 * - 이전기관 종사자 여부를 시스템에서 확인할 수 없다.
 * - 항상 'conditional' 상태로 반환하며, 소속 기관에 문의하도록 안내한다.
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

const LAW_REFERENCE = '주택공급에 관한 규칙 제40조';

/**
 * 이전기관 종사자 확인
 *
 * 이전기관 특별공급 대상:
 * - 수도권에서 혁신도시 등으로 이전하는 공공기관 종사자
 * - 해당 기관의 이전 계획에 포함된 직원
 *
 * MVP에서는 종사자 여부를 판정할 수 없으므로 안내 메시지를 반환한다.
 */
function checkRelocationEligibility(): EligibilityReason {
  return {
    rule_key: 'relocation_eligibility',
    rule_name: '이전기관 종사자 확인',
    passed: false, // 시스템 확인 불가
    law_reference: LAW_REFERENCE,
    detail:
      '이전기관 특별공급 대상자 여부는 시스템에서 확인할 수 없습니다. ' +
      '수도권에서 지방으로 이전하는 공공기관에 재직 중이신 경우, ' +
      '소속 기관의 인사/총무 부서에 문의하여 대상자 확인 및 추천을 받으시기 바랍니다.',
  };
}

/** 이전기관 특별공급 규칙 모듈 */
export const relocationRule: SupplyTypeRule = {
  type: 'relocation',
  label: '이전기관',

  evaluate(
    _profile: ProfileInput,
    _complex: ComplexInput,
    _params: RuleCondition[],
  ): EligibilityResult {
    const reasons: EligibilityReason[] = [
      checkRelocationEligibility(),
    ];

    // 항상 conditional 반환 (시스템 확인 불가)
    return {
      supply_type: 'relocation',
      result: 'conditional',
      reasons,
    };
  },
};
