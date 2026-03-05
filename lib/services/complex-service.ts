import type { PaginatedResponse } from '@/types';
import type { Complex } from '@/types/database';
import type { SupabaseDb } from '@/types/supabase';
import { logger } from '@/lib/utils/logger';
import * as complexRepo from '@/lib/repositories/complex-repository';
import type {
  ComplexListFilters,
  ComplexWithSupplyTypes,
} from '@/lib/repositories/complex-repository';

/** 단지 목록 조회 (페이지네이션) */
export async function listComplexes(
  supabase: SupabaseDb,
  filters: ComplexListFilters = {},
): Promise<PaginatedResponse<Complex> | null> {
  const result = await complexRepo.list(supabase, filters);

  if (result.error || !result.data) {
    logger.error('complex-service.listComplexes failed', {
      filters,
      error: result.error,
    });
    return null;
  }

  return {
    items: result.data.items,
    total: result.data.total,
    page: result.data.page,
    limit: result.data.limit,
  };
}

/** 단지 상세 조회 (공급유형 포함) */
export async function getComplexDetail(
  supabase: SupabaseDb,
  id: string,
): Promise<ComplexWithSupplyTypes | null> {
  const result = await complexRepo.getById(supabase, id);

  if (result.error || !result.data) {
    logger.error('complex-service.getComplexDetail failed', {
      id,
      error: result.error,
    });
    return null;
  }

  return result.data;
}
