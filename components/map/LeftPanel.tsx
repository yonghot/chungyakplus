'use client';

import { Search, TrendingUp, Building2, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatKoreanPrice, formatChangeRate } from '@/lib/utils/price-format';
import type { MapApartment } from '@/types/map.types';

interface LeftPanelProps {
  apartments: MapApartment[];
  selectedId: string | null;
  onSelect: (apartment: MapApartment) => void;
  isLoading: boolean;
}

export function LeftPanel({ apartments, selectedId, onSelect, isLoading }: LeftPanelProps) {
  return (
    <aside className="absolute left-0 top-12 z-10 hidden h-[calc(100vh-48px)] w-[360px] flex-col border-r border-slate-200/60 bg-white/95 backdrop-blur-sm sm:flex">
      {/* 검색바 */}
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="아파트, 지역, 학교 검색"
            className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-8 text-xs"
          />
        </div>
      </div>

      {/* 필터 행 */}
      <div className="flex gap-1.5 border-b border-slate-100 px-4 py-2">
        {['실거래가', '매매', '1개월'].map((label, i) => (
          <button
            key={label}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              i === 0
                ? 'bg-blue-50 text-blue-700'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* AI 예측 헤더 */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
          <p className="text-xs font-semibold text-blue-900">
            강남구, 2년 뒤 가장 상승할 아파트는?
          </p>
        </div>
      </div>

      {/* 아파트 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : apartments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
            <Building2 className="h-8 w-8" />
            <p className="text-xs">이 영역에 데이터가 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {apartments
              .filter((apt) => apt.latestPrice !== null)
              .sort((a, b) => (b.latestPrice ?? 0) - (a.latestPrice ?? 0))
              .map((apt, index) => (
                <ApartmentCard
                  key={apt.id}
                  apartment={apt}
                  rank={index + 1}
                  isSelected={apt.id === selectedId}
                  onClick={() => { onSelect(apt); }}
                />
              ))}
          </div>
        )}
      </div>

      {/* 탭 메뉴 */}
      <div className="flex border-t border-slate-200 bg-white">
        {['실거래', '지역분석', '시세', '매물', '청약'].map((tab, i) => (
          <button
            key={tab}
            className={`flex-1 py-2.5 text-[11px] font-medium transition-colors ${
              i === 0
                ? 'border-t-2 border-blue-600 text-blue-700'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ─── 아파트 카드 ─── */

function ApartmentCard({
  apartment,
  rank,
  isSelected,
  onClick,
}: {
  apartment: MapApartment;
  rank: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const price = apartment.latestPrice ? formatKoreanPrice(apartment.latestPrice) : '-';
  const predicted = apartment.predictedPrice ? formatKoreanPrice(apartment.predictedPrice) : null;
  const changeRate = apartment.predictionChangeRate
    ? formatChangeRate(apartment.predictionChangeRate)
    : null;

  return (
    <button
      onClick={onClick}
      className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
        isSelected ? 'bg-blue-50/60' : ''
      }`}
    >
      {/* 순위 */}
      <div
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          rank <= 3
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        {rank}
      </div>

      {/* 정보 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-slate-900">
            {apartment.name}
          </p>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>{apartment.dong}</span>
          {apartment.totalUnits && (
            <>
              <span>·</span>
              <span>{apartment.totalUnits.toLocaleString()}세대</span>
            </>
          )}
          {apartment.builtYear && (
            <>
              <span>·</span>
              <span>{apartment.builtYear}년</span>
            </>
          )}
        </div>

        {/* 가격 행 */}
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{price}</span>
          {predicted && (
            <>
              <span className="text-slate-300">→</span>
              <span className="text-sm font-bold text-blue-600">{predicted}</span>
            </>
          )}
        </div>

        {/* 예측 뱃지 */}
        {changeRate && (
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5">
            <Calendar className="h-3 w-3 text-blue-500" />
            <span className="text-[10px] font-semibold text-blue-700">
              2년뒤 {changeRate} 예상
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
