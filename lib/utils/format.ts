/**
 * 포매팅 유틸리티
 *
 * 날짜, 금액, 면적, 전화번호 등 한국어 표시 형식 변환.
 */

/**
 * 금액을 한국 원화 형식으로 포매팅한다.
 * @param amount - 금액 (원 단위)
 * @returns "1,234,567원" 형식의 문자열
 *
 * @example
 * formatCurrency(350000000) // "350,000,000원"
 * formatCurrency(0) // "0원"
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

/**
 * 면적을 표시 형식으로 포매팅한다.
 * @param sqm - 전용면적 (제곱미터)
 * @returns "84.00m2" 형식의 문자열
 *
 * @example
 * formatArea(84.99) // "84.99m\u00B2"
 */
export function formatArea(sqm: number): string {
  return `${sqm.toFixed(2)}m\u00B2`;
}

/**
 * 날짜를 한국어 형식으로 포매팅한다.
 * @param date - ISO 8601 날짜 문자열 또는 Date 객체
 * @returns "2026년 3월 4일" 형식의 문자열
 *
 * @example
 * formatDate('2026-03-04') // "2026년 3월 4일"
 * formatDate(new Date('2026-03-04')) // "2026년 3월 4일"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 날짜를 짧은 형식으로 포매팅한다.
 * @param date - ISO 8601 날짜 문자열 또는 Date 객체
 * @returns "2026.03.04" 형식의 문자열
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * 전화번호를 하이픈 형식으로 포매팅한다.
 * @param phone - 숫자만 포함된 전화번호 문자열
 * @returns "010-1234-5678" 형식의 문자열
 *
 * @example
 * formatPhone('01012345678') // "010-1234-5678"
 * formatPhone('0212345678') // "02-1234-5678"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // 02 지역번호 (02-XXXX-XXXX)
  if (digits.startsWith('02')) {
    if (digits.length === 10) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 9) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    }
  }

  // 휴대폰/기타 (XXX-XXXX-XXXX)
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  // 일반 지역번호 (XXX-XXX-XXXX)
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
}

/**
 * 생년월일로부터 만 나이를 계산한다.
 * @param birthDate - 생년월일 (ISO 8601 형식, 예: '1995-06-15')
 * @returns 만 나이
 *
 * @example
 * calculateAge('1995-06-15') // 현재 2026-03-04 기준 → 30
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // 생일이 아직 지나지 않은 경우 1세 차감
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

/**
 * 두 날짜 사이의 개월 수를 계산한다.
 * @param startDate - 시작일 (ISO 8601 형식)
 * @param endDate - 종료일 (ISO 8601 형식, 미지정 시 현재 날짜)
 * @returns 경과 개월 수 (소수점 이하 버림)
 *
 * @example
 * calculateMonthsDiff('2020-01-15', '2026-03-04') // 73
 */
export function calculateMonthsDiff(startDate: string, endDate?: string): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  const dayDiff = end.getDate() - start.getDate();

  let totalMonths = yearDiff * 12 + monthDiff;

  // 일(day) 기준으로 한 달이 채 안 된 경우 1개월 차감
  if (dayDiff < 0) {
    totalMonths -= 1;
  }

  return Math.max(0, totalMonths);
}

/**
 * 개월 수를 년/개월 한글 표기로 변환한다.
 * @param months - 총 개월 수
 * @returns "5년 3개월" 형식의 문자열
 *
 * @example
 * formatMonthsToYearsAndMonths(63) // "5년 3개월"
 * formatMonthsToYearsAndMonths(12) // "1년 0개월"
 * formatMonthsToYearsAndMonths(3) // "0년 3개월"
 */
export function formatMonthsToYearsAndMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `${years}년 ${remainingMonths}개월`;
}
