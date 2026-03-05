/**
 * 자격 판정 엔진 전용 타입 정의
 *
 * 순수 함수 기반 판정 로직에서 사용하는 입출력 타입.
 * database.ts와 index.ts의 타입을 기반으로 판정 도메인에 특화된 인터페이스를 정의한다.
 */

import type {
  SupplyType,
  EligibilityStatus,
  MaritalStatus,
  SubscriptionType,
} from '@/types/database';

// ─── 판정 엔진 입력 타입 ─────────────────────────────────

/** 프로필 데이터 중 자격 판정에 필요한 필드 */
export interface ProfileInput {
  /** 생년월일 (ISO 8601, 예: '1995-06-15') */
  birth_date: string;
  /** 세대주 여부 */
  is_household_head: boolean;
  /** 혼인 상태 */
  marital_status: MaritalStatus;
  /** 혼인 신고일 (ISO 8601, null이면 미혼/미입력) */
  marriage_date: string | null;
  /** 부양가족 수 */
  dependents_count: number;
  /** 무주택 시작일 (ISO 8601, null이면 유주택 또는 미입력) */
  homeless_start_date: string | null;
  /** 총 자산 (원) */
  total_assets_krw: number | null;
  /** 월평균 소득 (원) */
  monthly_income_krw: number | null;
  /** 자동차 가액 (원) */
  car_value_krw: number | null;
  /** 청약통장 종류 */
  subscription_type: SubscriptionType | null;
  /** 청약통장 가입일 (ISO 8601) */
  subscription_start_date: string | null;
  /** 납입 횟수 */
  deposit_count: number | null;
  /** 과거 당첨 이력 */
  has_won_before: boolean;
  /** 당첨 일자 (ISO 8601) */
  won_date: string | null;
}

/** 단지 + 공급유형 데이터 중 판정에 필요한 필드 */
export interface ComplexInput {
  /** 단지 소재 지역 (시/도) */
  region: string;
  /** 단지 소재 구/군 */
  district: string;
  /** 해당 단지에서 모집하는 공급유형 목록 */
  available_supply_types: SupplyType[];
}

/**
 * eligibility_rules 테이블에서 로드한 규칙 파라미터 (JSONB condition 필드)
 *
 * 각 공급유형별 규칙에서 DB로부터 동적으로 로드되는 조건값.
 * MVP에서는 하드코딩된 기본값을 사용하되, 향후 DB 기반 동적 규칙으로 확장 가능.
 */
export interface RuleParams {
  /** 공급유형별 규칙 파라미터 맵 */
  [supplyType: string]: RuleCondition[];
}

/** 개별 규칙 조건 (eligibility_rules 테이블의 한 행에 대응) */
export interface RuleCondition {
  rule_key: string;
  rule_name: string;
  condition: Record<string, unknown>;
  law_reference: string | null;
  priority: number;
  is_active: boolean;
}

// ─── 판정 엔진 출력 타입 ─────────────────────────────────

/** 판정 결과의 개별 근거 항목 */
export interface EligibilityReason {
  /** 규칙 고유 키 (예: 'homeless_status', 'subscription_period') */
  rule_key: string;
  /** 규칙 한글명 (예: '무주택 여부', '청약통장 가입기간') */
  rule_name: string;
  /** 해당 규칙 충족 여부 */
  passed: boolean;
  /** 관련 법령 조항 (예: '주택공급에 관한 규칙 제25조') */
  law_reference?: string;
  /** 상세 설명 (예: '무주택기간 5년 3개월로 요건 충족') */
  detail: string;
}

/** 단일 공급유형에 대한 판정 결과 */
export interface EligibilityResult {
  /** 공급유형 */
  supply_type: SupplyType;
  /** 판정 결과 */
  result: EligibilityStatus;
  /** 판정 근거 목록 */
  reasons: EligibilityReason[];
}

// ─── 규칙 모듈 인터페이스 ────────────────────────────────

/**
 * 공급유형별 규칙 모듈이 구현해야 하는 인터페이스
 *
 * 각 공급유형(일반, 신혼부부, 생애최초 등)은 이 인터페이스를 구현하여
 * 프로필과 단지 정보를 기반으로 자격 여부를 판정한다.
 * 모든 evaluate 함수는 순수 함수여야 한다 (부수효과 금지).
 */
export interface SupplyTypeRule {
  /** 이 규칙이 적용되는 공급유형 */
  type: SupplyType;
  /** 공급유형 한글명 */
  label: string;
  /**
   * 자격 판정 실행
   *
   * @param profile - 사용자 프로필 입력
   * @param complex - 단지 정보 입력
   * @param params - DB에서 로드한 규칙 파라미터 (없으면 기본값 사용)
   * @returns 판정 결과 (상태 + 근거 배열)
   */
  evaluate(
    profile: ProfileInput,
    complex: ComplexInput,
    params: RuleCondition[],
  ): EligibilityResult;
}
