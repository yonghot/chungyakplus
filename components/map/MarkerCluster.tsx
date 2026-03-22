'use client';

import { useMemo } from 'react';
import { Marker } from 'react-map-gl/maplibre';
import Supercluster from 'supercluster';

import { PriceMarker } from './PriceMarker';
import type { MapApartment, ApartmentPointProperties, MapBounds } from '@/types/map.types';

/** 클러스터링 전환 줌 레벨 — 이 값 이상이면 개별 마커 표시 */
const CLUSTER_MAX_ZOOM = 15;

interface MarkerClusterProps {
  apartments: MapApartment[];
  zoom: number;
  bounds: MapBounds | null;
  onApartmentClick?: (apartment: MapApartment) => void;
  onClusterClick?: (clusterId: number, lat: number, lng: number) => void;
}

export function MarkerCluster({
  apartments,
  zoom,
  bounds,
  onApartmentClick,
  onClusterClick,
}: MarkerClusterProps) {
  const index = useMemo(() => {
    const sc = new Supercluster<ApartmentPointProperties>({
      radius: 60,
      maxZoom: CLUSTER_MAX_ZOOM,
    });

    const points: GeoJSON.Feature<GeoJSON.Point, ApartmentPointProperties>[] =
      apartments.map((apt) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [apt.lng, apt.lat] },
        properties: {
          id: apt.id,
          name: apt.name,
          latestPrice: apt.latestPrice,
          priceChangeRate: apt.priceChangeRate,
          predictedPrice: apt.predictedPrice,
          predictionChangeRate: apt.predictionChangeRate,
          totalUnits: apt.totalUnits,
          builtYear: apt.builtYear,
          district: apt.district,
          dong: apt.dong,
        },
      }));

    sc.load(points);
    return sc;
  }, [apartments]);

  const clusters = useMemo(() => {
    if (!bounds) {return [];}
    const bbox: [number, number, number, number] = [
      bounds.sw.lng,
      bounds.sw.lat,
      bounds.ne.lng,
      bounds.ne.lat,
    ];
    return index.getClusters(bbox, Math.floor(zoom));
  }, [index, bounds, zoom]);

  /** apartments를 id 기반으로 빠르게 조회하는 맵 */
  const apartmentMap = useMemo(() => {
    const map = new Map<string, MapApartment>();
    for (const apt of apartments) {
      map.set(apt.id, apt);
    }
    return map;
  }, [apartments]);

  return (
    <>
      {clusters.map((feature) => {
        const coords = feature.geometry.coordinates;
        const lng = coords[0] as number;
        const lat = coords[1] as number;
        const props = feature.properties;

        // 클러스터인 경우
        if ('cluster' in props && props.cluster) {
          const clusterId = (props.cluster_id ?? 0) as number;
          const pointCount = (props.point_count ?? 0) as number;
          const size = Math.min(24 + pointCount * 2, 52);

          return (
            <Marker
              key={`cluster-${clusterId}`}
              longitude={lng}
              latitude={lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onClusterClick?.(clusterId, lat, lng);
              }}
            >
              <div
                className="flex cursor-pointer items-center justify-center rounded-full bg-blue-500/90 text-xs font-bold text-white shadow-lg ring-4 ring-blue-500/20 transition-transform hover:scale-110"
                style={{ width: size, height: size }}
              >
                {pointCount}
              </div>
            </Marker>
          );
        }

        // 개별 마커
        const aptProps = props as ApartmentPointProperties;
        const apartment = apartmentMap.get(aptProps.id);
        if (!apartment) {return null;}

        return (
          <PriceMarker
            key={apartment.id}
            apartment={apartment}
            onClick={onApartmentClick}
          />
        );
      })}
    </>
  );
}
