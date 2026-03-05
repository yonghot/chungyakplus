import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatCurrency,
  formatArea,
  formatDate,
  formatDateShort,
  formatPhone,
  calculateAge,
  calculateMonthsDiff,
  formatMonthsToYearsAndMonths,
} from '@/lib/utils/format';

describe('formatCurrency', () => {
  it('큰 금액을 천 단위 구분자와 원 단위로 포맷한다', () => {
    expect(formatCurrency(350000000)).toBe('350,000,000원');
  });

  it('0을 포맷한다', () => {
    expect(formatCurrency(0)).toBe('0원');
  });

  it('음수 금액을 포맷한다', () => {
    expect(formatCurrency(-1500000)).toBe('-1,500,000원');
  });

  it('천 단위 미만 금액을 포맷한다', () => {
    expect(formatCurrency(999)).toBe('999원');
  });

  it('정확히 천 단위 금액을 포맷한다', () => {
    expect(formatCurrency(1000)).toBe('1,000원');
  });

  it('억 단위 금액을 포맷한다', () => {
    expect(formatCurrency(1200000000)).toBe('1,200,000,000원');
  });
});

describe('formatArea', () => {
  it('소수점이 있는 면적을 포맷한다', () => {
    expect(formatArea(84.99)).toBe('84.99m²');
  });

  it('정수 면적을 소수점 2자리로 포맷한다', () => {
    expect(formatArea(60)).toBe('60.00m²');
  });

  it('0 면적을 소수점 2자리로 포맷한다', () => {
    expect(formatArea(0)).toBe('0.00m²');
  });

  it('소수점 한 자리 면적을 소수점 2자리로 포맷한다', () => {
    expect(formatArea(59.5)).toBe('59.50m²');
  });

  it('큰 면적을 포맷한다', () => {
    expect(formatArea(135.78)).toBe('135.78m²');
  });
});

describe('formatDate', () => {
  it('문자열 날짜를 한국어 형식으로 포맷한다', () => {
    expect(formatDate('2026-03-04')).toBe('2026년 3월 4일');
  });

  it('Date 객체를 한국어 형식으로 포맷한다', () => {
    expect(formatDate(new Date('2026-03-04'))).toBe('2026년 3월 4일');
  });

  it('1월 1일을 포맷한다', () => {
    expect(formatDate('2026-01-01')).toBe('2026년 1월 1일');
  });

  it('12월 31일을 포맷한다', () => {
    expect(formatDate('2026-12-31')).toBe('2026년 12월 31일');
  });

  it('두 자리 일자(10일 이상)를 포맷한다', () => {
    expect(formatDate('2026-11-15')).toBe('2026년 11월 15일');
  });

  it('Date 객체로 연초 날짜를 포맷한다', () => {
    expect(formatDate(new Date('2026-01-01'))).toBe('2026년 1월 1일');
  });
});

describe('formatDateShort', () => {
  it('문자열 날짜를 짧은 형식으로 포맷한다', () => {
    expect(formatDateShort('2026-03-04')).toBe('2026.03.04');
  });

  it('Date 객체를 짧은 형식으로 포맷한다', () => {
    expect(formatDateShort(new Date('2026-03-04'))).toBe('2026.03.04');
  });

  it('1월 1일을 짧은 형식으로 포맷한다', () => {
    expect(formatDateShort('2026-01-01')).toBe('2026.01.01');
  });

  it('12월 31일을 짧은 형식으로 포맷한다', () => {
    expect(formatDateShort('2026-12-31')).toBe('2026.12.31');
  });

  it('Date 객체로 두 자리 월/일을 포맷한다', () => {
    expect(formatDateShort(new Date('2026-11-25'))).toBe('2026.11.25');
  });
});

describe('formatPhone', () => {
  it('휴대폰 11자리를 포맷한다', () => {
    expect(formatPhone('01012345678')).toBe('010-1234-5678');
  });

  it('서울 10자리 번호를 포맷한다', () => {
    expect(formatPhone('0212345678')).toBe('02-1234-5678');
  });

  it('서울 9자리(구형) 번호를 포맷한다', () => {
    // 9자리: 02 + 3자리 + 4자리
    expect(formatPhone('021234567')).toBe('02-123-4567');
  });

  it('서울 10자리 번호를 4-4로 포맷한다', () => {
    // 10자리: 02 + 4자리 + 4자리
    expect(formatPhone('0231234567')).toBe('02-3123-4567');
  });

  it('지역번호 10자리 번호를 포맷한다', () => {
    expect(formatPhone('0311234567')).toBe('031-123-4567');
  });

  it('이미 포맷된 번호는 그대로 반환한다', () => {
    expect(formatPhone('010-1234-5678')).toBe('010-1234-5678');
  });

  it('이미 포맷된 서울 번호는 그대로 반환한다', () => {
    expect(formatPhone('02-1234-5678')).toBe('02-1234-5678');
  });

  it('이미 포맷된 지역 번호는 그대로 반환한다', () => {
    expect(formatPhone('031-123-4567')).toBe('031-123-4567');
  });
});

describe('calculateAge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-05'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('올해 생일이 아직 지나지 않은 경우 나이를 계산한다', () => {
    // 2026-03-05 기준, 1990-06-15 생이면 아직 생일 안 지남 → 35세
    expect(calculateAge('1990-06-15')).toBe(35);
  });

  it('올해 생일이 이미 지난 경우 나이를 계산한다', () => {
    // 2026-03-05 기준, 1990-01-10 생이면 생일 지남 → 36세
    expect(calculateAge('1990-01-10')).toBe(36);
  });

  it('오늘이 생일인 경우 나이를 계산한다', () => {
    // 2026-03-05 기준, 1990-03-05 생이면 오늘 생일 → 36세
    expect(calculateAge('1990-03-05')).toBe(36);
  });

  it('1살 미만(올해 태어난 경우) 나이를 계산한다', () => {
    expect(calculateAge('2026-01-01')).toBe(0);
  });

  it('생일이 12월 31일인 경우를 계산한다', () => {
    // 2026-03-05 기준, 2000-12-31 생이면 아직 생일 안 지남 → 25세
    expect(calculateAge('2000-12-31')).toBe(25);
  });
});

describe('calculateMonthsDiff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-05'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('endDate 없이 현재 날짜까지 개월 차이를 계산한다', () => {
    // 2026-03-05 기준, 2025-01-05부터 → 14개월
    expect(calculateMonthsDiff('2025-01-05')).toBe(14);
  });

  it('endDate를 지정하여 개월 차이를 계산한다', () => {
    expect(calculateMonthsDiff('2025-01-01', '2025-07-01')).toBe(6);
  });

  it('같은 달의 개월 차이는 0이다', () => {
    expect(calculateMonthsDiff('2026-03-01', '2026-03-31')).toBe(0);
  });

  it('1개월 차이를 계산한다', () => {
    expect(calculateMonthsDiff('2026-01-01', '2026-02-01')).toBe(1);
  });

  it('연도를 넘어가는 개월 차이를 계산한다', () => {
    expect(calculateMonthsDiff('2024-06-01', '2026-03-01')).toBe(21);
  });

  it('endDate 없이 시작일이 오늘인 경우 0개월이다', () => {
    expect(calculateMonthsDiff('2026-03-05')).toBe(0);
  });
});

describe('formatMonthsToYearsAndMonths', () => {
  it('년과 개월이 모두 있는 경우를 포맷한다', () => {
    expect(formatMonthsToYearsAndMonths(63)).toBe('5년 3개월');
  });

  it('정확히 년 단위인 경우를 포맷한다', () => {
    expect(formatMonthsToYearsAndMonths(24)).toBe('2년 0개월');
  });

  it('12개월 미만인 경우를 포맷한다', () => {
    expect(formatMonthsToYearsAndMonths(7)).toBe('0년 7개월');
  });

  it('0개월을 포맷한다', () => {
    expect(formatMonthsToYearsAndMonths(0)).toBe('0년 0개월');
  });

  it('1개월을 포맷한다', () => {
    expect(formatMonthsToYearsAndMonths(1)).toBe('0년 1개월');
  });

  it('12개월을 포맷한다', () => {
    expect(formatMonthsToYearsAndMonths(12)).toBe('1년 0개월');
  });

  it('큰 개월 수를 포맷한다', () => {
    expect(formatMonthsToYearsAndMonths(150)).toBe('12년 6개월');
  });
});
