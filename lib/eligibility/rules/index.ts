/**
 * 공급유형별 규칙 레지스트리
 *
 * 모든 7개 공급유형 규칙 모듈을 등록하고 조회할 수 있는 중앙 레지스트리.
 * 엔진(engine.ts)이 이 레지스트리를 통해 규칙을 실행한다.
 */

import type { SupplyType } from '@/types/database';
import type { SupplyTypeRule } from '@/lib/eligibility/types';

import { generalRule } from '@/lib/eligibility/rules/general';
import { newlywedRule } from '@/lib/eligibility/rules/newlywed';
import { firstLifeRule } from '@/lib/eligibility/rules/first-life';
import { multiChildRule } from '@/lib/eligibility/rules/multi-child';
import { elderlyParentRule } from '@/lib/eligibility/rules/elderly-parent';
import { institutionalRule } from '@/lib/eligibility/rules/institutional';
import { relocationRule } from '@/lib/eligibility/rules/relocation';

/** 공급유형별 규칙 모듈 레지스트리 */
export const RULE_REGISTRY: Record<SupplyType, SupplyTypeRule> = {
  general: generalRule,
  newlywed: newlywedRule,
  first_life: firstLifeRule,
  multi_child: multiChildRule,
  elderly_parent: elderlyParentRule,
  institutional: institutionalRule,
  relocation: relocationRule,
};

/** 등록된 모든 규칙 모듈을 배열로 반환한다 */
export function getAllRules(): SupplyTypeRule[] {
  return Object.values(RULE_REGISTRY);
}

/** 특정 공급유형의 규칙 모듈을 반환한다 */
export function getRule(type: SupplyType): SupplyTypeRule {
  return RULE_REGISTRY[type];
}
