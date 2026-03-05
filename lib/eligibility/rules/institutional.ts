/**
 * 기관추천 특별공급 자격 판정 규칙 (주택공급에 관한 규칙 제39조)
 *
 * 국가유공자, 장애인, 철거민 등 관계기관의 추천을 받은 자에게 특별공급.
 *
 * MVP 제약사항:
 * - 기관추천 대상자 여부를 시스템에서 확인할 수 없다.
 * - 항상 'conditional' 상태로 반환하며, 해당 기관에 문의하도록 안내한다.
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

const LAW_REFERENCE = '주택공급에 관한 규칙 제39조';

/**
 * 기관추천 대상자 확인
 *
 * 기관추천 특별공급 대상자는 다음을 포함한다:
 * - 국가유공자 (국가보훈처)
 * - 장애인 (주민센터)
 * - 철거민 (해당 지자체)
 * - 북한이탈주민 (통일부)
 * 등
 *
 * MVP에서는 대상자 여부를 판정할 수 없으므로 안내 메시지를 반환한다.
 */
function checkInstitutionalEligibility(): EligibilityReason {
  return {
    rule_key: 'institutional_eligibility',
    rule_name: '기관추천 대상자 확인',
    passed: false, // 시스템 확인 불가
    law_reference: LAW_REFERENCE,
    detail:
      '기관추천 특별공급 대상자 여부는 시스템에서 확인할 수 없습니다. ' +
      '국가유공자(국가보훈처), 장애인(주민센터), 철거민(지자체) 등 ' +
      '해당 기관에 직접 문의하여 추천서를 발급받으시기 바랍니다.',
  };
}

/** 기관추천 특별공급 규칙 모듈 */
export const institutionalRule: SupplyTypeRule = {
  type: 'institutional',
  label: '기관추천',

  evaluate(
    _profile: ProfileInput,
    _complex: ComplexInput,
    _params: RuleCondition[],
  ): EligibilityResult {
    const reasons: EligibilityReason[] = [
      checkInstitutionalEligibility(),
    ];

    // 항상 conditional 반환 (시스템 확인 불가)
    return {
      supply_type: 'institutional',
      result: 'conditional',
      reasons,
    };
  },
};
