'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleBookmarkAction } from '@/lib/actions/bookmark-actions';
import type { ApiResponse, PaginatedResponse, Complex, ComplexWithSupplyTypes } from '@/types';

export interface ComplexFilters {
  region?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * 단지 목록 조회 훅
 *
 * 필터링/페이지네이션을 지원하는 단지 목록을 API에서 조회한다.
 * 필터 객체를 queryKey에 포함하여 필터 변경 시 자동 재요청한다.
 */
export function useComplexes(filters?: ComplexFilters) {
  return useQuery<PaginatedResponse<Complex>>({
    queryKey: ['complexes', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.region) params.set('region', filters.region);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));

      const response = await fetch(`/api/complexes?${params.toString()}`);
      const json: ApiResponse<PaginatedResponse<Complex>> = await response.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.data!;
    },
  });
}

/**
 * 단지 상세 조회 훅
 *
 * 특정 단지의 상세 정보와 공급유형 목록을 API에서 조회한다.
 * id가 비어있으면 쿼리를 비활성화한다.
 */
export function useComplexDetail(id: string) {
  return useQuery<ComplexWithSupplyTypes>({
    queryKey: ['complex', id],
    queryFn: async () => {
      const response = await fetch(`/api/complexes/${id}`);
      const json: ApiResponse<ComplexWithSupplyTypes> = await response.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.data!;
    },
    enabled: !!id,
  });
}

/**
 * 북마크 토글 뮤테이션 훅
 *
 * toggleBookmarkAction 서버 액션을 래핑하고,
 * 성공 시 관련 쿼리 캐시를 무효화한다.
 */
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (complexId: string) => {
      const result = await toggleBookmarkAction(complexId);

      if (!result.success) {
        throw new Error(result.error ?? '북마크 처리에 실패했습니다.');
      }

      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complexes'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}
