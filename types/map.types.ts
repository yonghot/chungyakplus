/** 위경도 좌표 */
export interface LatLng {
  lat: number;
  lng: number;
}

/** 지도 바운딩 박스 (남서 ↔ 북동 꼭짓점) */
export interface MapBounds {
  sw: LatLng;
  ne: LatLng;
}

/** 지도 뷰포트 상태 */
export interface MapViewport {
  lat: number;
  lng: number;
  zoom: number;
  bounds?: MapBounds;
}

/** 마커 가격 변동 상태 */
export type MarkerStatus = 'up' | 'down' | 'stable' | 'new';

/** 가격 표시 유형 필터 */
export type PriceFilterType = 'lowest' | 'trade' | 'jeonse';

/** 가격 변동 기간 필터 */
export type PriceChangeRange = '1m' | '3m' | '1y';

/** API에서 반환하는 지도용 아파트 데이터 */
export interface MapApartment {
  id: string;
  name: string;
  address: string;
  district: string;
  dong: string;
  lat: number;
  lng: number;
  totalUnits: number | null;
  builtYear: number | null;
  latestPrice: number | null;
  priceChangeRate: number | null;
  predictedPrice: number | null;
  predictionChangeRate: number | null;
}

/** supercluster에 전달할 GeoJSON Feature 속성 */
export interface ApartmentPointProperties {
  id: string;
  name: string;
  latestPrice: number | null;
  priceChangeRate: number | null;
  predictedPrice: number | null;
  predictionChangeRate: number | null;
  totalUnits: number | null;
  builtYear: number | null;
  district: string;
  dong: string;
}

/** 클러스터 속성 (supercluster가 생성) */
export interface ClusterProperties {
  cluster: true;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string | number;
}

/** 뷰포트 내 아파트 조회 API 쿼리 파라미터 */
export interface MapApartmentsQuery {
  swLng: number;
  swLat: number;
  neLng: number;
  neLat: number;
  zoom: number;
}
