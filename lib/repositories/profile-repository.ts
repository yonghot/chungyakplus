import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/database';
import type { SupabaseDb } from '@/types/supabase';
import { logger } from '@/lib/utils/logger';

/** 리포지토리 반환 타입 */
export interface RepositoryResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * 프로필 완성도 계산에 사용할 필드 가중치
 *
 * 필수 필드(높은 가중치)와 선택 필드(낮은 가중치)를 구분하여
 * 0~100 사이의 완성도 퍼센트를 산출한다.
 */
const COMPLETION_WEIGHTS: Record<string, number> = {
  name: 10,
  birth_date: 10,
  marital_status: 10,
  is_household_head: 5,
  dependents_count: 5,
  homeless_start_date: 10,
  total_assets_krw: 10,
  monthly_income_krw: 10,
  car_value_krw: 5,
  subscription_type: 10,
  subscription_start_date: 5,
  deposit_count: 5,
  has_won_before: 5,
};

const TOTAL_WEIGHT = Object.values(COMPLETION_WEIGHTS).reduce((sum, w) => sum + w, 0);

/**
 * 프로필 완성도(0~100)를 계산한다.
 *
 * null/undefined/빈 문자열이 아닌 값이 채워져 있으면
 * 해당 필드의 가중치만큼 점수를 부여한다.
 */
export function calculateCompletion(
  profile: Partial<Profile> | ProfileInsert,
): number {
  let earned = 0;

  for (const [field, weight] of Object.entries(COMPLETION_WEIGHTS)) {
    const value = (profile as Record<string, unknown>)[field];

    if (value !== null && value !== undefined && value !== '') {
      earned += weight;
    }
  }

  return Math.round((earned / TOTAL_WEIGHT) * 100);
}

/** ID(= auth.users.id)로 프로필 조회 */
export async function getById(
  supabase: SupabaseDb,
  id: string,
): Promise<RepositoryResult<Profile>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .returns<Profile[]>()
    .single();

  if (error) {
    logger.error('profile-repository.getById failed', { id, error: error.message });
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/** 프로필 생성 */
export async function create(
  supabase: SupabaseDb,
  data: ProfileInsert,
): Promise<RepositoryResult<Profile>> {
  const insertData: ProfileInsert = {
    ...data,
    profile_completion: calculateCompletion(data),
  };

  const { data: profile, error } = await supabase
    .from('profiles')
    .insert(insertData)
    .select()
    .returns<Profile[]>()
    .single();

  if (error) {
    logger.error('profile-repository.create failed', { error: error.message });
    return { data: null, error: error.message };
  }

  return { data: profile, error: null };
}

/** 프로필 업데이트 */
export async function update(
  supabase: SupabaseDb,
  id: string,
  data: ProfileUpdate,
): Promise<RepositoryResult<Profile>> {
  // 먼저 기존 프로필을 조회하여 완성도를 재계산한다.
  const existing = await getById(supabase, id);
  if (existing.error || !existing.data) {
    return { data: null, error: existing.error ?? 'Profile not found' };
  }

  const merged = { ...existing.data, ...data };
  const updateData: ProfileUpdate = {
    ...data,
    profile_completion: calculateCompletion(merged),
    updated_at: new Date().toISOString(),
  };

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .returns<Profile[]>()
    .single();

  if (error) {
    logger.error('profile-repository.update failed', { id, error: error.message });
    return { data: null, error: error.message };
  }

  return { data: profile, error: null };
}
