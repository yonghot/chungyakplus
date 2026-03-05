/**
 * 84점 만점 가점 산출표
 *
 * 주택공급에 관한 규칙 별표1 기준.
 * 무주택기간(32점) + 부양가족수(35점) + 청약통장 가입기간(17점) = 84점
 */

/** 가점 구간 정의 */
interface ScoreRange {
  /** 구간 최소 값 (포함) */
  min: number;
  /** 구간 최대 값 (미만, null이면 무한대) */
  max: number | null;
  /** 해당 구간 배점 */
  score: number;
  /** 한글 라벨 */
  label: string;
}

// --- 무주택기간 가점표 (32점 만점) ---
// 단위: 년 (years)
export const HOMELESS_PERIOD_TABLE: readonly ScoreRange[] = [
  { min: 0, max: 1, score: 2, label: '1년 미만' },
  { min: 1, max: 2, score: 4, label: '1년 이상 ~ 2년 미만' },
  { min: 2, max: 3, score: 6, label: '2년 이상 ~ 3년 미만' },
  { min: 3, max: 4, score: 8, label: '3년 이상 ~ 4년 미만' },
  { min: 4, max: 5, score: 10, label: '4년 이상 ~ 5년 미만' },
  { min: 5, max: 6, score: 12, label: '5년 이상 ~ 6년 미만' },
  { min: 6, max: 7, score: 14, label: '6년 이상 ~ 7년 미만' },
  { min: 7, max: 8, score: 16, label: '7년 이상 ~ 8년 미만' },
  { min: 8, max: 9, score: 18, label: '8년 이상 ~ 9년 미만' },
  { min: 9, max: 10, score: 20, label: '9년 이상 ~ 10년 미만' },
  { min: 10, max: 11, score: 22, label: '10년 이상 ~ 11년 미만' },
  { min: 11, max: 12, score: 24, label: '11년 이상 ~ 12년 미만' },
  { min: 12, max: 13, score: 26, label: '12년 이상 ~ 13년 미만' },
  { min: 13, max: 14, score: 28, label: '13년 이상 ~ 14년 미만' },
  { min: 14, max: 15, score: 30, label: '14년 이상 ~ 15년 미만' },
  { min: 15, max: null, score: 32, label: '15년 이상' },
] as const;

export const HOMELESS_PERIOD_MAX_SCORE = 32;

// --- 부양가족수 가점표 (35점 만점) ---
// 단위: 명 (persons)
export const DEPENDENTS_TABLE: readonly ScoreRange[] = [
  { min: 0, max: 1, score: 5, label: '0명' },
  { min: 1, max: 2, score: 10, label: '1명' },
  { min: 2, max: 3, score: 15, label: '2명' },
  { min: 3, max: 4, score: 20, label: '3명' },
  { min: 4, max: 5, score: 25, label: '4명' },
  { min: 5, max: 6, score: 30, label: '5명' },
  { min: 6, max: null, score: 35, label: '6명 이상' },
] as const;

export const DEPENDENTS_MAX_SCORE = 35;

// --- 청약통장 가입기간 가점표 (17점 만점) ---
// 단위: 년 (years)
export const SUBSCRIPTION_PERIOD_TABLE: readonly ScoreRange[] = [
  { min: 0, max: 0.5, score: 1, label: '6개월 미만' },
  { min: 0.5, max: 1, score: 2, label: '6개월 이상 ~ 1년 미만' },
  { min: 1, max: 2, score: 3, label: '1년 이상 ~ 2년 미만' },
  { min: 2, max: 3, score: 4, label: '2년 이상 ~ 3년 미만' },
  { min: 3, max: 4, score: 5, label: '3년 이상 ~ 4년 미만' },
  { min: 4, max: 5, score: 6, label: '4년 이상 ~ 5년 미만' },
  { min: 5, max: 6, score: 7, label: '5년 이상 ~ 6년 미만' },
  { min: 6, max: 7, score: 8, label: '6년 이상 ~ 7년 미만' },
  { min: 7, max: 8, score: 9, label: '7년 이상 ~ 8년 미만' },
  { min: 8, max: 9, score: 10, label: '8년 이상 ~ 9년 미만' },
  { min: 9, max: 10, score: 11, label: '9년 이상 ~ 10년 미만' },
  { min: 10, max: 11, score: 12, label: '10년 이상 ~ 11년 미만' },
  { min: 11, max: 12, score: 13, label: '11년 이상 ~ 12년 미만' },
  { min: 12, max: 13, score: 14, label: '12년 이상 ~ 13년 미만' },
  { min: 13, max: 14, score: 15, label: '13년 이상 ~ 14년 미만' },
  { min: 14, max: 15, score: 16, label: '14년 이상 ~ 15년 미만' },
  { min: 15, max: null, score: 17, label: '15년 이상' },
] as const;

export const SUBSCRIPTION_PERIOD_MAX_SCORE = 17;

/** 84점 만점 */
export const TOTAL_MAX_SCORE =
  HOMELESS_PERIOD_MAX_SCORE + DEPENDENTS_MAX_SCORE + SUBSCRIPTION_PERIOD_MAX_SCORE;

/**
 * 가점 구간표에서 해당 값의 점수를 조회한다.
 * @param table - 가점 구간표
 * @param value - 조회할 값 (년수 또는 명수)
 * @returns 해당 구간의 점수와 라벨
 */
export function lookupScore(
  table: readonly ScoreRange[],
  value: number
): { score: number; label: string } {
  for (const range of table) {
    const withinMin = value >= range.min;
    const withinMax = range.max === null || value < range.max;
    if (withinMin && withinMax) {
      return { score: range.score, label: range.label };
    }
  }

  // 값이 0 미만인 경우 첫 구간 반환
  const firstRange = table[0];
  if (firstRange) {
    return { score: firstRange.score, label: firstRange.label };
  }

  return { score: 0, label: '' };
}
