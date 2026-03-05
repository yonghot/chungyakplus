/**
 * 도메인 용어 한영 매핑 테이블
 *
 * 코드에서는 영어 식별자를, UI/메시지에서는 한국어를 사용한다.
 * CLAUDE.md 1절 실행 규칙 준수.
 */
export const DOMAIN_GLOSSARY = {
  // 공급유형
  general: '일반공급',
  newlywed: '신혼부부',
  firstLife: '생애최초',
  multiChild: '다자녀',
  elderlyParent: '노부모부양',
  institutional: '기관추천',
  relocation: '이전기관',

  // 판정 상태
  eligible: '적격',
  ineligible: '부적격',
  conditional: '조건부',

  // 단지 상태
  upcoming: '접수예정',
  open: '접수중',
  closed: '접수마감',
  completed: '완료',

  // 프로필 필드
  householdHead: '세대주',
  maritalStatus: '혼인상태',
  single: '미혼',
  married: '기혼',
  divorced: '이혼',
  widowed: '사별',
  dependentsCount: '부양가족수',
  homelessStartDate: '무주택시작일',
  homelessPeriod: '무주택기간',

  // 자산정보
  totalAssets: '총자산',
  monthlyIncome: '월소득',
  carValue: '자동차가액',

  // 청약 통장
  subscriptionType: '청약통장유형',
  savings: '청약저축',
  deposit: '청약예금',
  housing: '주택청약종합저축',
  subscriptionStartDate: '통장가입일',
  subscriptionPeriod: '통장가입기간',
  depositCount: '납입횟수',

  // 가점 관련
  scoringSystem: '가점제',
  totalScore: '총점',
  maxScore: '만점',

  // 알림
  recommendation: '추천',
  deadline: '마감임박',
  result: '판정결과',
  system: '시스템',

  // 공통
  profile: '프로필',
  complex: '단지',
  supplyType: '공급유형',
  eligibility: '자격',
  evaluation: '판정',
  bookmark: '관심단지',
  notification: '알림',
  onboarding: '온보딩',
  region: '시도',
  district: '시군구',
  announcement: '모집공고',
  winnerDate: '당첨자발표일',
  profileCompletion: '프로필완성도',

  // 법령 참조
  housingSupplyRules: '주택공급에 관한 규칙',
  housingAct: '주택법',
  incomeTaxAct: '소득세법',
} as const;

export type DomainGlossary = typeof DOMAIN_GLOSSARY;
export type DomainKey = keyof DomainGlossary;
