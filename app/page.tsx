'use client';

import dynamic from 'next/dynamic';

/**
 * 메인 페이지 — 지도 기반 부동산 분석 UI
 *
 * MapContainer는 클라이언트 전용(MapLibre GL JS)이므로
 * SSR을 비활성화하고 dynamic import로 로드한다.
 */
const MapContainer = dynamic(
  () => import('@/components/map/MapContainer').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <main className="h-screen w-full">
      <MapContainer />
    </main>
  );
}
