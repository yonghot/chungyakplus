/**
 * 한국 시도/시군구 데이터
 *
 * MVP 단계: 수도권(서울, 경기, 인천) + 주요 광역시 중심으로 구성.
 * 실제 운영 시 행정안전부 행정구역 코드 기반으로 확장한다.
 */

export interface District {
  name: string;
  code: string;
}

export interface Region {
  name: string;
  code: string;
  districts: readonly District[];
}

export const REGIONS: readonly Region[] = [
  {
    name: '서울특별시',
    code: '11',
    districts: [
      { name: '강남구', code: '11680' },
      { name: '강동구', code: '11740' },
      { name: '강북구', code: '11305' },
      { name: '강서구', code: '11500' },
      { name: '관악구', code: '11620' },
      { name: '광진구', code: '11215' },
      { name: '구로구', code: '11530' },
      { name: '금천구', code: '11545' },
      { name: '노원구', code: '11350' },
      { name: '도봉구', code: '11320' },
      { name: '동대문구', code: '11230' },
      { name: '동작구', code: '11590' },
      { name: '마포구', code: '11440' },
      { name: '서대문구', code: '11410' },
      { name: '서초구', code: '11650' },
      { name: '성동구', code: '11200' },
      { name: '성북구', code: '11290' },
      { name: '송파구', code: '11710' },
      { name: '양천구', code: '11470' },
      { name: '영등포구', code: '11560' },
      { name: '용산구', code: '11170' },
      { name: '은평구', code: '11380' },
      { name: '종로구', code: '11110' },
      { name: '중구', code: '11140' },
      { name: '중랑구', code: '11260' },
    ],
  },
  {
    name: '경기도',
    code: '41',
    districts: [
      { name: '수원시', code: '41110' },
      { name: '성남시', code: '41130' },
      { name: '고양시', code: '41280' },
      { name: '용인시', code: '41460' },
      { name: '부천시', code: '41190' },
      { name: '안산시', code: '41270' },
      { name: '안양시', code: '41170' },
      { name: '남양주시', code: '41360' },
      { name: '화성시', code: '41590' },
      { name: '평택시', code: '41220' },
      { name: '의정부시', code: '41150' },
      { name: '시흥시', code: '41390' },
      { name: '파주시', code: '41480' },
      { name: '광명시', code: '41210' },
      { name: '김포시', code: '41570' },
      { name: '군포시', code: '41410' },
      { name: '광주시', code: '41610' },
      { name: '이천시', code: '41500' },
      { name: '양주시', code: '41630' },
      { name: '오산시', code: '41370' },
      { name: '구리시', code: '41310' },
      { name: '안성시', code: '41550' },
      { name: '포천시', code: '41650' },
      { name: '의왕시', code: '41430' },
      { name: '하남시', code: '41450' },
      { name: '여주시', code: '41670' },
      { name: '동두천시', code: '41250' },
      { name: '과천시', code: '41290' },
    ],
  },
  {
    name: '인천광역시',
    code: '28',
    districts: [
      { name: '중구', code: '28110' },
      { name: '동구', code: '28140' },
      { name: '미추홀구', code: '28177' },
      { name: '연수구', code: '28185' },
      { name: '남동구', code: '28200' },
      { name: '부평구', code: '28237' },
      { name: '계양구', code: '28245' },
      { name: '서구', code: '28260' },
      { name: '강화군', code: '28710' },
      { name: '옹진군', code: '28720' },
    ],
  },
  {
    name: '부산광역시',
    code: '26',
    districts: [
      { name: '중구', code: '26110' },
      { name: '서구', code: '26140' },
      { name: '동구', code: '26170' },
      { name: '영도구', code: '26200' },
      { name: '부산진구', code: '26230' },
      { name: '동래구', code: '26260' },
      { name: '남구', code: '26290' },
      { name: '북구', code: '26320' },
      { name: '해운대구', code: '26350' },
      { name: '사하구', code: '26380' },
      { name: '금정구', code: '26410' },
      { name: '강서구', code: '26440' },
      { name: '연제구', code: '26470' },
      { name: '수영구', code: '26500' },
      { name: '사상구', code: '26530' },
      { name: '기장군', code: '26710' },
    ],
  },
  {
    name: '대구광역시',
    code: '27',
    districts: [
      { name: '중구', code: '27110' },
      { name: '동구', code: '27140' },
      { name: '서구', code: '27170' },
      { name: '남구', code: '27200' },
      { name: '북구', code: '27230' },
      { name: '수성구', code: '27260' },
      { name: '달서구', code: '27290' },
      { name: '달성군', code: '27710' },
    ],
  },
  {
    name: '대전광역시',
    code: '30',
    districts: [
      { name: '동구', code: '30110' },
      { name: '중구', code: '30140' },
      { name: '서구', code: '30170' },
      { name: '유성구', code: '30200' },
      { name: '대덕구', code: '30230' },
    ],
  },
  {
    name: '광주광역시',
    code: '29',
    districts: [
      { name: '동구', code: '29110' },
      { name: '서구', code: '29140' },
      { name: '남구', code: '29155' },
      { name: '북구', code: '29170' },
      { name: '광산구', code: '29200' },
    ],
  },
  {
    name: '울산광역시',
    code: '31',
    districts: [
      { name: '중구', code: '31110' },
      { name: '남구', code: '31140' },
      { name: '동구', code: '31170' },
      { name: '북구', code: '31200' },
      { name: '울주군', code: '31710' },
    ],
  },
  {
    name: '세종특별자치시',
    code: '36',
    districts: [{ name: '세종시', code: '36110' }],
  },
] as const;

/** 시도 이름 목록 */
export const REGION_NAMES: readonly string[] = REGIONS.map((r) => r.name);

/** 수도권 시도 코드 */
export const CAPITAL_REGION_CODES: readonly string[] = ['11', '41', '28'] as const;

/**
 * 시도 이름으로 Region 객체를 조회한다.
 * @param regionName - 시도 이름 (예: '서울특별시')
 */
export function findRegionByName(regionName: string): Region | undefined {
  return REGIONS.find((r) => r.name === regionName);
}

/**
 * 시도 코드로 Region 객체를 조회한다.
 * @param code - 시도 코드 (예: '11')
 */
export function findRegionByCode(code: string): Region | undefined {
  return REGIONS.find((r) => r.code === code);
}

/**
 * 해당 시도가 수도권인지 판별한다.
 * @param regionCode - 시도 코드
 */
export function isCapitalRegion(regionCode: string): boolean {
  return (CAPITAL_REGION_CODES as readonly string[]).includes(regionCode);
}
