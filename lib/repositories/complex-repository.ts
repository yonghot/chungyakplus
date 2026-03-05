import type {
  Complex,
  ComplexStatus,
  SupplyTypeRow,
  EligibilityRule,
} from '@/types/database';
import type { SupabaseDb } from '@/types/supabase';
import { logger } from '@/lib/utils/logger';

import type { RepositoryResult } from '@/lib/repositories/profile-repository';

/** 단지 목록 필터 */
export interface ComplexListFilters {
  region?: string;
  district?: string;
  status?: ComplexStatus;
  page?: number;
  limit?: number;
}

/** 페이지네이션된 단지 목록 결과 */
export interface PaginatedComplexes {
  items: Complex[];
  total: number;
  page: number;
  limit: number;
}

/** 단지 + 공급유형 조인 결과 */
export interface ComplexWithSupplyTypes {
  complex: Complex;
  supplyTypes: SupplyTypeRow[];
}

/** 단지 + 공급유형 + 자격요건 조인 결과 */
export interface ComplexWithRules extends ComplexWithSupplyTypes {
  eligibilityRules: EligibilityRule[];
}

/** 필터 기반 단지 목록 (페이지네이션) */
export async function list(
  supabase: SupabaseDb,
  filters: ComplexListFilters = {},
): Promise<RepositoryResult<PaginatedComplexes>> {
  const { region, district, status, page = 1, limit = 20 } = filters;

  const offset = (page - 1) * limit;

  let query = supabase
    .from('complexes')
    .select('*', { count: 'exact' });

  if (region) {
    query = query.eq('region', region);
  }
  if (district) {
    query = query.eq('district', district);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query
    .order('announcement_date', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)
    .returns<Complex[]>();

  if (error) {
    logger.error('complex-repository.list failed', { filters, error: error.message });
    return { data: null, error: error.message };
  }

  return {
    data: {
      items: data ?? [],
      total: count ?? 0,
      page,
      limit,
    },
    error: null,
  };
}

/** ID로 단지 + 공급유형 조회 */
export async function getById(
  supabase: SupabaseDb,
  id: string,
): Promise<RepositoryResult<ComplexWithSupplyTypes>> {
  const { data: complex, error: complexError } = await supabase
    .from('complexes')
    .select('*')
    .eq('id', id)
    .returns<Complex[]>()
    .single();

  if (complexError) {
    logger.error('complex-repository.getById complex query failed', {
      id,
      error: complexError.message,
    });
    return { data: null, error: complexError.message };
  }

  const { data: supplyTypes, error: supplyError } = await supabase
    .from('supply_types')
    .select('*')
    .eq('complex_id', id)
    .order('type')
    .returns<SupplyTypeRow[]>();

  if (supplyError) {
    logger.error('complex-repository.getById supply_types query failed', {
      id,
      error: supplyError.message,
    });
    return { data: null, error: supplyError.message };
  }

  return {
    data: {
      complex,
      supplyTypes: supplyTypes ?? [],
    },
    error: null,
  };
}

/** ID로 단지 + 공급유형 + 자격요건 규칙 조회 */
export async function getByIdWithRules(
  supabase: SupabaseDb,
  id: string,
): Promise<RepositoryResult<ComplexWithRules>> {
  const result = await getById(supabase, id);
  if (result.error || !result.data) {
    return { data: null, error: result.error };
  }

  // 해당 단지의 공급유형들에 대한 활성 자격요건 규칙 조회
  const supplyTypeValues = result.data.supplyTypes.map((st) => st.type);

  if (supplyTypeValues.length === 0) {
    return {
      data: {
        ...result.data,
        eligibilityRules: [],
      },
      error: null,
    };
  }

  const { data: rules, error: rulesError } = await supabase
    .from('eligibility_rules')
    .select('*')
    .in('supply_type', supplyTypeValues)
    .eq('is_active', true)
    .order('priority')
    .returns<EligibilityRule[]>();

  if (rulesError) {
    logger.error('complex-repository.getByIdWithRules rules query failed', {
      id,
      error: rulesError.message,
    });
    return { data: null, error: rulesError.message };
  }

  return {
    data: {
      ...result.data,
      eligibilityRules: rules ?? [],
    },
    error: null,
  };
}
