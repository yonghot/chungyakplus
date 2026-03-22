import { create } from 'zustand';

import type { MapBounds, PriceFilterType, PriceChangeRange } from '@/types/map.types';

/** 강남구 중심 초기 뷰포트 */
const INITIAL_VIEWPORT = {
  lat: 37.4979,
  lng: 127.0276,
  zoom: 14,
} as const;

interface MapState {
  /** 현재 뷰포트 (위도, 경도, 줌) */
  lat: number;
  lng: number;
  zoom: number;
  /** 현재 보이는 영역의 바운딩 박스 */
  bounds: MapBounds | null;
  /** 선택된 아파트 단지 ID */
  selectedComplexId: string | null;
  /** 가격 표시 유형 */
  filterType: PriceFilterType;
  /** 변동률 기간 */
  priceChangeRange: PriceChangeRange;

  setViewport: (lat: number, lng: number, zoom: number) => void;
  setBounds: (bounds: MapBounds) => void;
  setSelectedComplex: (id: string | null) => void;
  setFilterType: (type: PriceFilterType) => void;
  setPriceChangeRange: (range: PriceChangeRange) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

export const useMapStore = create<MapState>()((set) => ({
  lat: INITIAL_VIEWPORT.lat,
  lng: INITIAL_VIEWPORT.lng,
  zoom: INITIAL_VIEWPORT.zoom,
  bounds: null,
  selectedComplexId: null,
  filterType: 'trade',
  priceChangeRange: '1m',

  setViewport: (lat, lng, zoom) => set({ lat, lng, zoom }),
  setBounds: (bounds) => set({ bounds }),
  setSelectedComplex: (id) => set({ selectedComplexId: id }),
  setFilterType: (type) => set({ filterType: type }),
  setPriceChangeRange: (range) => set({ priceChangeRange: range }),
  flyTo: (lat, lng, zoom) =>
    set((state) => ({ lat, lng, zoom: zoom ?? state.zoom })),
}));
