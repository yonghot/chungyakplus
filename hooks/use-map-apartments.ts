'use client';

import { useQuery } from '@tanstack/react-query';

import type { ApiResponse } from '@/types';
import type { MapApartment, MapBounds } from '@/types/map.types';

/**
 * 뷰포트 내 아파트 데이터 조회 훅
 *
 * bounds가 null이면 쿼리를 비활성화한다.
 * 뷰포트 이동마다 bounds가 갱신되어 자동으로 재요청된다.
 */
export function useMapApartments(bounds: MapBounds | null, zoom: number) {
  return useQuery<MapApartment[]>({
    queryKey: ['map-apartments', bounds, zoom],
    queryFn: async () => {
      if (!bounds) return [];

      const params = new URLSearchParams({
        sw_lng: String(bounds.sw.lng),
        sw_lat: String(bounds.sw.lat),
        ne_lng: String(bounds.ne.lng),
        ne_lat: String(bounds.ne.lat),
        zoom: String(Math.floor(zoom)),
      });

      const response = await fetch(`/api/map/apartments?${params.toString()}`);
      const json: ApiResponse<MapApartment[]> = await response.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.data ?? [];
    },
    enabled: !!bounds,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
