import type { SupabaseDb } from '@/types/supabase';

/** apartments_in_bounds RPC 반환 타입 */
interface ApartmentInBoundsRow {
  id: string;
  name: string;
  address: string;
  district: string;
  dong: string;
  lng: number;
  lat: number;
  total_units: number | null;
  built_year: number | null;
  latest_price: number | null;
  price_change_rate: number | null;
  predicted_price: number | null;
  prediction_change_rate: number | null;
}

/**
 * 바운딩 박스 내 아파트 단지 조회 (PostGIS RPC)
 */
export async function findApartmentsInBounds(
  supabase: SupabaseDb,
  swLng: number,
  swLat: number,
  neLng: number,
  neLat: number
): Promise<ApartmentInBoundsRow[]> {
  const { data, error } = await supabase.rpc('apartments_in_bounds', {
    sw_lng: swLng,
    sw_lat: swLat,
    ne_lng: neLng,
    ne_lat: neLat,
  });

  if (error) {
    throw new Error(`뷰포트 내 아파트 조회 실패: ${error.message}`);
  }

  return (data as ApartmentInBoundsRow[]) ?? [];
}

/**
 * 아파트 단지 상세 조회
 */
export async function findApartmentById(
  supabase: SupabaseDb,
  id: string
) {
  const { data, error } = await supabase
    .from('apartment_complexes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`아파트 단지 조회 실패: ${error.message}`);
  }

  return data;
}
