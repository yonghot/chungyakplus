import type { SupabaseDb } from '@/types/supabase';

import { findApartmentsInBounds } from '@/lib/repositories/map-repository';
import type { MapApartment } from '@/types/map.types';

/**
 * 뷰포트 내 아파트 목록 조회
 *
 * Repository에서 조회한 snake_case 데이터를 camelCase MapApartment로 변환한다.
 */
export async function getApartmentsInViewport(
  supabase: SupabaseDb,
  swLng: number,
  swLat: number,
  neLng: number,
  neLat: number
): Promise<MapApartment[]> {
  const rows = await findApartmentsInBounds(
    supabase,
    swLng,
    swLat,
    neLng,
    neLat
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    address: row.address,
    district: row.district,
    dong: row.dong,
    lat: row.lat,
    lng: row.lng,
    totalUnits: row.total_units,
    builtYear: row.built_year,
    latestPrice: row.latest_price,
    priceChangeRate: row.price_change_rate,
    predictedPrice: row.predicted_price,
    predictionChangeRate: row.prediction_change_rate,
  }));
}
