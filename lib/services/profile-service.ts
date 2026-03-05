import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/database';
import type { SupabaseDb } from '@/types/supabase';
import { logger } from '@/lib/utils/logger';
import * as profileRepo from '@/lib/repositories/profile-repository';

/** 프로필 + 완성도 정보 */
export interface ProfileWithCompletion {
  profile: Profile;
  completion: number;
  isComplete: boolean;
}

/**
 * 자격 판정에 필요한 최소 프로필 완성도 기준(%)
 *
 * eligibility-service.ts의 MIN_PROFILE_COMPLETION과 동일한 값을 사용한다.
 * 이 값 이상이어야 자격 판정을 실행할 수 있다.
 */
const MIN_COMPLETION_FOR_ELIGIBILITY = 80;

/** 프로필 조회 (완성도 포함) */
export async function getProfile(
  supabase: SupabaseDb,
  userId: string,
): Promise<ProfileWithCompletion | null> {
  const result = await profileRepo.getById(supabase, userId);

  if (result.error || !result.data) {
    if (result.error) {
      logger.warn('profile-service.getProfile: profile not found', { userId });
    }
    return null;
  }

  const profile = result.data;
  const completion = profile.profile_completion;

  return {
    profile,
    completion,
    isComplete: completion >= MIN_COMPLETION_FOR_ELIGIBILITY,
  };
}

/** 프로필 생성 (완성도 자동 계산) */
export async function createProfile(
  supabase: SupabaseDb,
  userId: string,
  data: Omit<ProfileInsert, 'id'>,
): Promise<ProfileWithCompletion | null> {
  const insertData: ProfileInsert = {
    ...data,
    id: userId,
  };

  const result = await profileRepo.create(supabase, insertData);

  if (result.error || !result.data) {
    logger.error('profile-service.createProfile failed', {
      userId,
      error: result.error,
    });
    return null;
  }

  const profile = result.data;

  return {
    profile,
    completion: profile.profile_completion,
    isComplete: profile.profile_completion >= MIN_COMPLETION_FOR_ELIGIBILITY,
  };
}

/** 프로필 업데이트 (완성도 재계산) */
export async function updateProfile(
  supabase: SupabaseDb,
  userId: string,
  data: ProfileUpdate,
): Promise<ProfileWithCompletion | null> {
  const result = await profileRepo.update(supabase, userId, data);

  if (result.error || !result.data) {
    logger.error('profile-service.updateProfile failed', {
      userId,
      error: result.error,
    });
    return null;
  }

  const profile = result.data;

  return {
    profile,
    completion: profile.profile_completion,
    isComplete: profile.profile_completion >= MIN_COMPLETION_FOR_ELIGIBILITY,
  };
}

/**
 * 프로필이 자격 판정 실행 가능한 최소 요건을 충족하는지 확인한다.
 *
 * 프로필이 존재하지 않거나 완성도가 기준 미달이면 false를 반환한다.
 */
export async function isProfileComplete(
  supabase: SupabaseDb,
  userId: string,
): Promise<boolean> {
  const profileData = await getProfile(supabase, userId);

  if (!profileData) {
    return false;
  }

  return profileData.isComplete;
}
