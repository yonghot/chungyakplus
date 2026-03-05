/**
 * 84점 만점 가점 산출 시스템 테스트
 *
 * 주택공급에 관한 규칙 별표1 기준:
 *   무주택기간(32점) + 부양가족수(35점) + 청약통장 가입기간(17점) = 84점
 *
 * 시스템 시간을 2026-03-05로 고정하여 날짜 의존 테스트의 결정성을 확보한다.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  calculateHomelessPeriodScore,
  calculateDependentsScore,
  calculateSubscriptionPeriodScore,
  calculateTotalScore,
  TOTAL_MAX_SCORE,
} from '@/lib/eligibility/scoring';
import type { ProfileInput } from '@/lib/eligibility/types';

// --- 테스트 전역 시간 고정 ---

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-03-05'));
});

afterEach(() => {
  vi.useRealTimers();
});

// --- 헬퍼: 기본 ProfileInput 생성 ---

function createProfile(overrides: Partial<ProfileInput> = {}): ProfileInput {
  return {
    birth_date: '1990-01-01',
    is_household_head: true,
    marital_status: 'married',
    marriage_date: '2018-06-01',
    dependents_count: 2,
    homeless_start_date: '2016-01-01',
    total_assets_krw: 200_000_000,
    monthly_income_krw: 4_000_000,
    car_value_krw: 15_000_000,
    subscription_type: 'savings',
    subscription_start_date: '2016-01-01',
    deposit_count: 60,
    has_won_before: false,
    won_date: null,
    ...overrides,
  };
}

// ──────────────────────────────────────────────────────────
// 1. 무주택기간 가점 (calculateHomelessPeriodScore)
// ──────────────────────────────────────────────────────────

describe('calculateHomelessPeriodScore', () => {
  it('무주택 시작일이 null이면 0점을 반환한다', () => {
    const result = calculateHomelessPeriodScore('1990-01-01', null);

    expect(result.score).toBe(0);
    expect(result.max).toBe(32);
    expect(result.detail).toContain('무주택 시작일 미입력');
  });

  it('만 30세 미만이면 0점을 반환한다', () => {
    // 2026-03-05 기준, 1997-01-01 생 → 만 29세
    const result = calculateHomelessPeriodScore('1997-01-01', '2020-01-01');

    expect(result.score).toBe(0);
    expect(result.max).toBe(32);
    expect(result.detail).toContain('만 29세');
    expect(result.detail).toContain('만 30세 이후부터');
  });

  it('만 30세 생일 당일에는 가점 산정이 시작된다', () => {
    // 1996-03-05 생 → 2026-03-05 기준 정확히 만 30세
    // 무주택 시작일이 20세부터였다면 만 30세 시점(2026-03-05)부터 산정
    // 오늘이 바로 만 30세 도달일이므로 무주택기간 0개월 → 1년 미만 구간 → 2점
    const result = calculateHomelessPeriodScore('1996-03-05', '2016-01-01');

    expect(result.score).toBe(2);
    expect(result.max).toBe(32);
  });

  it('만 30세 생일 전날이면 0점을 반환한다', () => {
    // 1996-03-06 생 → 2026-03-05 기준 만 29세 (생일 하루 전)
    const result = calculateHomelessPeriodScore('1996-03-06', '2016-01-01');

    expect(result.score).toBe(0);
    expect(result.max).toBe(32);
  });

  it('무주택 시작일이 만 30세 이전이면 만 30세 시점부터 산정한다', () => {
    // 1990-01-01 생 → 만 30세: 2020-01-01
    // 무주택 시작일: 2015-06-01 (만 30세 이전)
    // 실제 산정 시작: 2020-01-01
    // 2020-01-01 ~ 2026-03-05 = 6년 2개월 → 6년 이상 ~ 7년 미만 → 14점
    const result = calculateHomelessPeriodScore('1990-01-01', '2015-06-01');

    expect(result.score).toBe(14);
    expect(result.max).toBe(32);
  });

  it('무주택 시작일이 만 30세 이후이면 시작일부터 산정한다', () => {
    // 1990-01-01 생 → 만 30세: 2020-01-01
    // 무주택 시작일: 2022-03-05 (만 30세 이후)
    // 2022-03-05 ~ 2026-03-05 = 정확히 4년 0개월 → 4년 이상 ~ 5년 미만 → 10점
    const result = calculateHomelessPeriodScore('1990-01-01', '2022-03-05');

    expect(result.score).toBe(10);
    expect(result.max).toBe(32);
  });

  it('무주택기간 1년 미만이면 2점을 반환한다', () => {
    // 1990-01-01 생 → 만 30세: 2020-01-01
    // 무주택 시작일: 2025-06-01 → 2025-06-01 ~ 2026-03-05 = 9개월 → 1년 미만 → 2점
    const result = calculateHomelessPeriodScore('1990-01-01', '2025-06-01');

    expect(result.score).toBe(2);
    expect(result.max).toBe(32);
  });

  it('무주택기간 정확히 1년이면 4점을 반환한다', () => {
    // 무주택 시작일: 2025-03-05 → 정확히 1년 → 1년 이상 ~ 2년 미만 → 4점
    const result = calculateHomelessPeriodScore('1990-01-01', '2025-03-05');

    expect(result.score).toBe(4);
    expect(result.max).toBe(32);
  });

  it('무주택기간 5년이면 12점을 반환한다', () => {
    // 무주택 시작일: 2021-03-05 → 5년 0개월 → 5년 이상 ~ 6년 미만 → 12점
    const result = calculateHomelessPeriodScore('1990-01-01', '2021-03-05');

    expect(result.score).toBe(12);
    expect(result.max).toBe(32);
  });

  it('무주택기간 10년이면 22점을 반환한다', () => {
    // 1985-01-01 생 → 만 30세: 2015-01-01
    // 무주택 시작일: 2016-03-05 (만 30세 이후) → 실제 산정: 2016-03-05
    // 2016-03-05 ~ 2026-03-05 = 10년 0개월 → 10년 이상 ~ 11년 미만 → 22점
    const result = calculateHomelessPeriodScore('1985-01-01', '2016-03-05');

    expect(result.score).toBe(22);
    expect(result.max).toBe(32);
  });

  it('무주택기간 15년 이상이면 최대 32점을 반환한다', () => {
    // 1980-01-01 생 → 만 30세: 2010-01-01
    // 무주택 시작일: 2005-01-01 → 실제 산정: 2010-01-01 ~ 2026-03-05 = 16년 2개월 → 32점
    const result = calculateHomelessPeriodScore('1980-01-01', '2005-01-01');

    expect(result.score).toBe(32);
    expect(result.max).toBe(32);
  });

  it('무주택기간 14년이면 30점을 반환한다 (최대 직전 구간)', () => {
    // 1980-01-01 생 → 만 30세: 2010-01-01
    // 무주택 시작일: 2012-03-05 → 2012-03-05 ~ 2026-03-05 = 14년 → 14년 이상 ~ 15년 미만 → 30점
    const result = calculateHomelessPeriodScore('1980-01-01', '2012-03-05');

    expect(result.score).toBe(30);
    expect(result.max).toBe(32);
  });

  it('detail에 년/개월 정보가 포함된다', () => {
    // 무주택 시작일: 2023-06-05 → 2023-06-05 ~ 2026-03-05 = 2년 9개월
    const result = calculateHomelessPeriodScore('1990-01-01', '2023-06-05');

    expect(result.detail).toContain('2년');
    expect(result.detail).toContain('9개월');
  });
});

// ──────────────────────────────────────────────────────────
// 2. 부양가족수 가점 (calculateDependentsScore)
// ──────────────────────────────────────────────────────────

describe('calculateDependentsScore', () => {
  it('부양가족 0명이면 5점을 반환한다', () => {
    const result = calculateDependentsScore(0);

    expect(result.score).toBe(5);
    expect(result.max).toBe(35);
    expect(result.detail).toContain('0명');
  });

  it('부양가족 1명이면 10점을 반환한다', () => {
    const result = calculateDependentsScore(1);

    expect(result.score).toBe(10);
    expect(result.max).toBe(35);
  });

  it('부양가족 2명이면 15점을 반환한다', () => {
    const result = calculateDependentsScore(2);

    expect(result.score).toBe(15);
    expect(result.max).toBe(35);
  });

  it('부양가족 3명이면 20점을 반환한다', () => {
    const result = calculateDependentsScore(3);

    expect(result.score).toBe(20);
    expect(result.max).toBe(35);
  });

  it('부양가족 4명이면 25점을 반환한다', () => {
    const result = calculateDependentsScore(4);

    expect(result.score).toBe(25);
    expect(result.max).toBe(35);
  });

  it('부양가족 5명이면 30점을 반환한다', () => {
    const result = calculateDependentsScore(5);

    expect(result.score).toBe(30);
    expect(result.max).toBe(35);
  });

  it('부양가족 6명이면 최대 35점을 반환한다', () => {
    const result = calculateDependentsScore(6);

    expect(result.score).toBe(35);
    expect(result.max).toBe(35);
    expect(result.detail).toContain('6명 이상');
  });

  it('부양가족 6명 이상이어도 최대 35점을 반환한다', () => {
    const result7 = calculateDependentsScore(7);
    const result10 = calculateDependentsScore(10);

    expect(result7.score).toBe(35);
    expect(result10.score).toBe(35);
  });

  it('음수 입력은 0명으로 처리하여 5점을 반환한다', () => {
    const result = calculateDependentsScore(-1);

    expect(result.score).toBe(5);
    expect(result.max).toBe(35);
    expect(result.detail).toContain('0명');
  });

  it('음수 큰 값도 0명으로 처리한다', () => {
    const result = calculateDependentsScore(-100);

    expect(result.score).toBe(5);
    expect(result.max).toBe(35);
  });
});

// ──────────────────────────────────────────────────────────
// 3. 청약통장 가입기간 가점 (calculateSubscriptionPeriodScore)
// ──────────────────────────────────────────────────────────

describe('calculateSubscriptionPeriodScore', () => {
  it('가입일이 null이면 0점을 반환한다', () => {
    const result = calculateSubscriptionPeriodScore(null);

    expect(result.score).toBe(0);
    expect(result.max).toBe(17);
    expect(result.detail).toContain('미가입');
  });

  it('가입기간 6개월 미만이면 1점을 반환한다', () => {
    // 2025-10-05 → 2026-03-05 = 5개월 → 6개월 미만 → 1점
    const result = calculateSubscriptionPeriodScore('2025-10-05');

    expect(result.score).toBe(1);
    expect(result.max).toBe(17);
  });

  it('가입기간 정확히 6개월이면 2점을 반환한다', () => {
    // 2025-09-05 → 2026-03-05 = 6개월 → 6개월 이상 ~ 1년 미만 → 2점
    const result = calculateSubscriptionPeriodScore('2025-09-05');

    expect(result.score).toBe(2);
    expect(result.max).toBe(17);
  });

  it('가입기간 1년이면 3점을 반환한다', () => {
    // 2025-03-05 → 2026-03-05 = 12개월 → 1년 이상 ~ 2년 미만 → 3점
    const result = calculateSubscriptionPeriodScore('2025-03-05');

    expect(result.score).toBe(3);
    expect(result.max).toBe(17);
  });

  it('가입기간 2년이면 4점을 반환한다', () => {
    // 2024-03-05 → 2026-03-05 = 24개월 → 2년 이상 ~ 3년 미만 → 4점
    const result = calculateSubscriptionPeriodScore('2024-03-05');

    expect(result.score).toBe(4);
    expect(result.max).toBe(17);
  });

  it('가입기간 5년이면 7점을 반환한다', () => {
    // 2021-03-05 → 2026-03-05 = 60개월 → 5년 이상 ~ 6년 미만 → 7점
    const result = calculateSubscriptionPeriodScore('2021-03-05');

    expect(result.score).toBe(7);
    expect(result.max).toBe(17);
  });

  it('가입기간 10년이면 12점을 반환한다', () => {
    // 2016-03-05 → 2026-03-05 = 120개월 → 10년 이상 ~ 11년 미만 → 12점
    const result = calculateSubscriptionPeriodScore('2016-03-05');

    expect(result.score).toBe(12);
    expect(result.max).toBe(17);
  });

  it('가입기간 14년이면 16점을 반환한다 (최대 직전 구간)', () => {
    // 2012-03-05 → 2026-03-05 = 168개월 → 14년 이상 ~ 15년 미만 → 16점
    const result = calculateSubscriptionPeriodScore('2012-03-05');

    expect(result.score).toBe(16);
    expect(result.max).toBe(17);
  });

  it('가입기간 15년 이상이면 최대 17점을 반환한다', () => {
    // 2010-01-01 → 2026-03-05 ≈ 16년 2개월 → 15년 이상 → 17점
    const result = calculateSubscriptionPeriodScore('2010-01-01');

    expect(result.score).toBe(17);
    expect(result.max).toBe(17);
  });

  it('가입기간 20년이어도 최대 17점을 반환한다', () => {
    // 2006-01-01 → 2026-03-05 ≈ 20년 → 15년 이상 → 17점
    const result = calculateSubscriptionPeriodScore('2006-01-01');

    expect(result.score).toBe(17);
    expect(result.max).toBe(17);
  });

  it('detail에 년/개월 정보가 포함된다', () => {
    // 2023-06-05 → 2026-03-05 = 33개월 = 2년 9개월
    const result = calculateSubscriptionPeriodScore('2023-06-05');

    expect(result.detail).toContain('2년');
    expect(result.detail).toContain('9개월');
  });
});

// ──────────────────────────────────────────────────────────
// 4. 종합 가점 (calculateTotalScore)
// ──────────────────────────────────────────────────────────

describe('calculateTotalScore', () => {
  it('TOTAL_MAX_SCORE는 84점이다', () => {
    expect(TOTAL_MAX_SCORE).toBe(84);
  });

  it('완전한 프로필로 종합 가점을 산출한다', () => {
    // 1990-01-01 생 → 만 36세, 만 30세: 2020-01-01
    // 무주택 시작일: 2016-01-01 → 실제 산정: 2020-01-01 ~ 2026-03-05 = 6년 2개월 → 14점
    // 부양가족 2명 → 15점
    // 청약통장 가입일: 2016-01-01 → 2016-01-01 ~ 2026-03-05 = 10년 2개월 → 12점
    const profile = createProfile();
    const result = calculateTotalScore(profile);

    expect(result.homelessPeriod.score).toBe(14);
    expect(result.homelessPeriod.max).toBe(32);
    expect(result.dependents.score).toBe(15);
    expect(result.dependents.max).toBe(35);
    expect(result.subscriptionPeriod.score).toBe(12);
    expect(result.subscriptionPeriod.max).toBe(17);
    expect(result.total).toBe(14 + 15 + 12);
  });

  it('최소 프로필(모두 null/0)은 최소 점수를 반환한다', () => {
    const profile = createProfile({
      birth_date: '1997-01-01', // 만 29세 → 무주택기간 0점
      homeless_start_date: null,
      dependents_count: 0,
      subscription_start_date: null,
    });
    const result = calculateTotalScore(profile);

    // 무주택: null → 0점
    expect(result.homelessPeriod.score).toBe(0);
    // 부양가족: 0명 → 5점
    expect(result.dependents.score).toBe(5);
    // 청약통장: null → 0점
    expect(result.subscriptionPeriod.score).toBe(0);
    expect(result.total).toBe(5);
  });

  it('최대 가점 84점을 달성할 수 있다', () => {
    // 무주택기간 15년+ → 32점: 1975-01-01 생 (만 51세), 만 30세: 2005-01-01
    //   무주택 시작일: 2000-01-01 → 실제 산정: 2005-01-01 ~ 2026-03-05 = 21년+ → 32점
    // 부양가족 6명+ → 35점
    // 청약통장 15년+ → 17점: 가입일 2010-01-01 → 16년+ → 17점
    const profile = createProfile({
      birth_date: '1975-01-01',
      homeless_start_date: '2000-01-01',
      dependents_count: 6,
      subscription_start_date: '2010-01-01',
    });
    const result = calculateTotalScore(profile);

    expect(result.homelessPeriod.score).toBe(32);
    expect(result.dependents.score).toBe(35);
    expect(result.subscriptionPeriod.score).toBe(17);
    expect(result.total).toBe(84);
    expect(result.total).toBe(TOTAL_MAX_SCORE);
  });

  it('total은 세 항목 점수의 합이다', () => {
    const profile = createProfile({
      birth_date: '1985-01-01',
      homeless_start_date: '2018-03-05',
      dependents_count: 3,
      subscription_start_date: '2020-03-05',
    });
    const result = calculateTotalScore(profile);

    const expectedTotal =
      result.homelessPeriod.score +
      result.dependents.score +
      result.subscriptionPeriod.score;

    expect(result.total).toBe(expectedTotal);
  });

  it('무주택 시작일 없이도 다른 항목은 정상 산출된다', () => {
    const profile = createProfile({
      homeless_start_date: null,
      dependents_count: 4,
      subscription_start_date: '2021-03-05',
    });
    const result = calculateTotalScore(profile);

    expect(result.homelessPeriod.score).toBe(0);
    expect(result.dependents.score).toBe(25); // 4명 → 25점
    expect(result.subscriptionPeriod.score).toBe(7); // 5년 → 7점
    expect(result.total).toBe(0 + 25 + 7);
  });

  it('청약통장 미가입이어도 다른 항목은 정상 산출된다', () => {
    const profile = createProfile({
      birth_date: '1980-01-01',
      homeless_start_date: '2012-03-05',
      dependents_count: 5,
      subscription_start_date: null,
    });
    const result = calculateTotalScore(profile);

    expect(result.homelessPeriod.score).toBe(30); // 14년 → 30점
    expect(result.dependents.score).toBe(30); // 5명 → 30점
    expect(result.subscriptionPeriod.score).toBe(0);
    expect(result.total).toBe(30 + 30 + 0);
  });
});
