import type { SupplyType } from '@/types';

/** 공급유형별 상세 정보 */
export interface SupplyTypeInfo {
  type: SupplyType;
  label: string;
  description: string;
  lawReference: string;
  /** 주택공급에 관한 규칙 조항 번호 */
  articleNumber: number;
}

export const SUPPLY_TYPE_INFO: Record<SupplyType, SupplyTypeInfo> = {
  general: {
    type: 'general',
    label: '일반공급',
    description: '청약통장 가입자를 대상으로 가점제 또는 추첨제로 공급',
    lawReference: '주택공급에 관한 규칙 제25조',
    articleNumber: 25,
  },
  newlywed: {
    type: 'newlywed',
    label: '신혼부부',
    description: '혼인기간 7년 이내 무주택 세대구성원에게 특별공급',
    lawReference: '주택공급에 관한 규칙 제35조',
    articleNumber: 35,
  },
  first_life: {
    type: 'first_life',
    label: '생애최초',
    description: '생애 최초로 주택을 구입하는 무주택 세대구성원에게 특별공급',
    lawReference: '주택공급에 관한 규칙 제36조',
    articleNumber: 36,
  },
  multi_child: {
    type: 'multi_child',
    label: '다자녀',
    description: '미성년 자녀 3명 이상 무주택 세대구성원에게 특별공급',
    lawReference: '주택공급에 관한 규칙 제37조',
    articleNumber: 37,
  },
  elderly_parent: {
    type: 'elderly_parent',
    label: '노부모부양',
    description: '만 65세 이상 직계존속을 3년 이상 부양하는 무주택 세대주에게 특별공급',
    lawReference: '주택공급에 관한 규칙 제38조',
    articleNumber: 38,
  },
  institutional: {
    type: 'institutional',
    label: '기관추천',
    description: '국가유공자, 장애인 등 관계기관 추천을 받은 자에게 특별공급',
    lawReference: '주택공급에 관한 규칙 제39조',
    articleNumber: 39,
  },
  relocation: {
    type: 'relocation',
    label: '이전기관',
    description: '수도권에서 지방으로 이전하는 공공기관 종사자에게 특별공급',
    lawReference: '주택공급에 관한 규칙 제40조',
    articleNumber: 40,
  },
} as const;

/** 공급유형 목록 (순서 보장) */
export const SUPPLY_TYPE_LIST: readonly SupplyType[] = [
  'general',
  'newlywed',
  'first_life',
  'multi_child',
  'elderly_parent',
  'institutional',
  'relocation',
] as const;

/** 공급유형 한글 라벨 조회 */
export function getSupplyTypeLabel(type: SupplyType): string {
  return SUPPLY_TYPE_INFO[type].label;
}
