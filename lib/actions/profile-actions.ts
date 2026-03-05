'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/services/auth-service';
import { createProfile, updateProfile, type ProfileWithCompletion } from '@/lib/services/profile-service';
import { fullProfileSchema, profileUpdateSchema } from '@/lib/validations/profile';
import { logger } from '@/lib/utils/logger';

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * 새 프로필을 생성하는 서버 액션
 * @param formData - 프로필 생성에 필요한 폼 데이터
 * @returns 생성된 프로필 데이터 또는 에러 메시지
 */
export async function createProfileAction(
  formData: FormData | Record<string, unknown>,
): Promise<ActionResult<ProfileWithCompletion | null>> {
  try {
    const supabase = await createClient();
    const userId = await requireAuth(supabase);

    const raw =
      formData instanceof FormData
        ? Object.fromEntries(formData.entries())
        : formData;

    const parsed = fullProfileSchema.parse(raw);
    const profile = await createProfile(supabase, userId, parsed);

    revalidatePath('/profile');

    logger.info('프로필 생성 완료', { userId });

    return { success: true, data: profile };
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('프로필 생성 유효성 검사 실패', { error: error.message });
      return { success: false, error: '입력 데이터가 올바르지 않습니다.' };
    }

    logger.error('프로필 생성 실패', { error });
    return { success: false, error: '프로필 생성 중 오류가 발생했습니다.' };
  }
}

/**
 * 기존 프로필을 수정하는 서버 액션
 * @param formData - 프로필 수정에 필요한 폼 데이터
 * @returns 수정된 프로필 데이터 또는 에러 메시지
 */
export async function updateProfileAction(
  formData: FormData | Record<string, unknown>,
): Promise<ActionResult<ProfileWithCompletion | null>> {
  try {
    const supabase = await createClient();
    const userId = await requireAuth(supabase);

    const raw =
      formData instanceof FormData
        ? Object.fromEntries(formData.entries())
        : formData;

    const parsed = profileUpdateSchema.parse(raw);
    const profile = await updateProfile(supabase, userId, parsed);

    revalidatePath('/profile');

    logger.info('프로필 수정 완료', { userId });

    return { success: true, data: profile };
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('프로필 수정 유효성 검사 실패', { error: error.message });
      return { success: false, error: '입력 데이터가 올바르지 않습니다.' };
    }

    logger.error('프로필 수정 실패', { error });
    return { success: false, error: '프로필 수정 중 오류가 발생했습니다.' };
  }
}
