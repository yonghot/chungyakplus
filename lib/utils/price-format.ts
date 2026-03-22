/**
 * 원 단위 가격을 한국식 억/만원으로 포맷
 * @param won - 원 단위 가격 (BIGINT)
 * @returns 포맷된 가격 문자열
 *
 * @example
 * formatKoreanPrice(6830000000)  // "68.3억"
 * formatKoreanPrice(500000000)   // "5억"
 * formatKoreanPrice(192400000)   // "1.9억"
 * formatKoreanPrice(35000000)    // "3,500만"
 * formatKoreanPrice(8500000)     // "850만"
 * formatKoreanPrice(0)           // "0"
 */
export function formatKoreanPrice(won: number): string {
  if (won === 0) {return '0';}

  const eok = Math.floor(won / 100_000_000);
  const remainder = won % 100_000_000;
  const man = Math.floor(remainder / 10_000);

  if (eok > 0) {
    const decimalPart = Math.floor(remainder / 10_000_000);
    if (decimalPart > 0) {
      return `${eok}.${decimalPart}억`;
    }
    return `${eok}억`;
  }

  return `${man.toLocaleString('ko-KR')}만`;
}

/**
 * 변동률을 부호가 포함된 퍼센트 문자열로 포맷
 * @param rate - 변동률 (%, 예: 21.5 → "+21.5%")
 */
export function formatChangeRate(rate: number): string {
  if (rate === 0) {return '0%';}
  const sign = rate > 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)}%`;
}

/**
 * 가격 변동률로 마커 상태를 결정
 */
export function getMarkerStatus(priceChangeRate: number | null): 'up' | 'down' | 'stable' {
  if (priceChangeRate === null || priceChangeRate === 0) {return 'stable';}
  return priceChangeRate > 0 ? 'up' : 'down';
}
