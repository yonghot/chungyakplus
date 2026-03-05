/**
 * 자격 판정 엔진 (Core Eligibility Engine)
 *
 * 순수 함수 기반 판정 오케스트레이터.
 * 프로필과 단지 정보를 받아 모든(또는 선택된) 공급유형에 대해 자격을 판정한다.
 *
 * 핵심 원칙:
 * - 모든 함수는 순수 함수 (DB 호출, 로깅 등 부수효과 없음)
 * - 하나의 규칙 실패가 다른 규칙에 영향을 주지 않음 (독립 실행)
 * - 서버/클라이언트 양쪽에서 사용 가능
 */

import type { SupplyType } from '@/types/database';
import type {
  ProfileInput,
  ComplexInput,
  RuleParams,
  EligibilityResult,
} from '@/lib/eligibility/types';
import { getAllRules, getRule } from '@/lib/eligibility/rules';

/**
 * 모든 공급유형에 대해 자격을 판정한다.
 *
 * 7개 공급유형 규칙을 독립적으로 실행한다.
 * 하나의 규칙에서 오류가 발생해도 나머지 규칙은 정상 실행된다.
 *
 * @param profile - 사용자 프로필 입력
 * @param complex - 단지 정보 입력
 * @param ruleParams - DB에서 로드한 규칙 파라미터
 * @returns 공급유형별 판정 결과 배열
 */
export function evaluateAll(
  profile: ProfileInput,
  complex: ComplexInput,
  ruleParams: RuleParams,
): EligibilityResult[] {
  const rules = getAllRules();
  const results: EligibilityResult[] = [];

  for (const rule of rules) {
    try {
      const params = ruleParams[rule.type] ?? [];
      const result = rule.evaluate(profile, complex, params);
      results.push(result);
    } catch {
      // 개별 규칙 오류 시 해당 공급유형만 ineligible 처리
      // 다른 공급유형 판정에는 영향 없음
      results.push({
        supply_type: rule.type,
        result: 'ineligible',
        reasons: [
          {
            rule_key: `${rule.type}_error`,
            rule_name: '판정 오류',
            passed: false,
            detail: `${rule.label} 자격 판정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`,
          },
        ],
      });
    }
  }

  return results;
}

/**
 * 선택된 공급유형에 대해서만 자격을 판정한다.
 *
 * 특정 공급유형만 판정이 필요한 경우 사용한다.
 * 존재하지 않는 공급유형이 포함된 경우 해당 항목은 건너뛴다.
 *
 * @param profile - 사용자 프로필 입력
 * @param complex - 단지 정보 입력
 * @param ruleParams - DB에서 로드한 규칙 파라미터
 * @param supplyTypes - 판정할 공급유형 목록
 * @returns 선택된 공급유형별 판정 결과 배열
 */
export function evaluateSelected(
  profile: ProfileInput,
  complex: ComplexInput,
  ruleParams: RuleParams,
  supplyTypes: SupplyType[],
): EligibilityResult[] {
  const results: EligibilityResult[] = [];

  for (const type of supplyTypes) {
    const rule = getRule(type);
    if (!rule) {
      continue;
    }

    try {
      const params = ruleParams[type] ?? [];
      const result = rule.evaluate(profile, complex, params);
      results.push(result);
    } catch {
      results.push({
        supply_type: type,
        result: 'ineligible',
        reasons: [
          {
            rule_key: `${type}_error`,
            rule_name: '판정 오류',
            passed: false,
            detail: `${rule.label} 자격 판정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`,
          },
        ],
      });
    }
  }

  return results;
}
