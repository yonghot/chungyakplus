'use client';

import { memo } from 'react';
import { Marker } from 'react-map-gl/maplibre';

import { formatKoreanPrice, getMarkerStatus } from '@/lib/utils/price-format';
import type { MapApartment, MarkerStatus } from '@/types/map.types';

const STATUS_COLORS: Record<MarkerStatus, string> = {
  up: 'bg-blue-500',
  down: 'bg-orange-500',
  stable: 'bg-gray-500',
  new: 'bg-emerald-500',
};

interface PriceMarkerProps {
  apartment: MapApartment;
  onClick?: (apartment: MapApartment) => void;
}

function PriceMarkerComponent({ apartment, onClick }: PriceMarkerProps) {
  const { latestPrice, priceChangeRate } = apartment;

  if (latestPrice === null) {return null;}

  const status = getMarkerStatus(priceChangeRate);
  const colorClass = STATUS_COLORS[status];
  const priceLabel = formatKoreanPrice(latestPrice);

  return (
    <Marker
      longitude={apartment.lng}
      latitude={apartment.lat}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.(apartment);
      }}
    >
      <div
        className={`
          group relative cursor-pointer select-none
          rounded-lg px-2.5 py-1 text-[13px] font-bold text-white
          shadow-[0_2px_8px_rgba(0,0,0,0.15)]
          transition-transform duration-150 ease-out
          hover:scale-[1.08] hover:z-10
          ${colorClass}
        `}
        title={apartment.name}
      >
        {priceLabel}
        {/* 말풍선 꼬리 (삼각형) */}
        <div
          className={`
            absolute -bottom-1.5 left-1/2 -translate-x-1/2
            h-0 w-0
            border-l-[5px] border-r-[5px] border-t-[6px]
            border-l-transparent border-r-transparent
            ${status === 'up' ? 'border-t-blue-500' : ''}
            ${status === 'down' ? 'border-t-orange-500' : ''}
            ${status === 'stable' ? 'border-t-gray-500' : ''}
          `}
        />
      </div>
    </Marker>
  );
}

export const PriceMarker = memo(PriceMarkerComponent);
