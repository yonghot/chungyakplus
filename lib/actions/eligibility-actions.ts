'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/services/auth-service';
import {
  evaluateEligibility,
  ProfileIncompleteError,
  DataLoadError,
} from '@/lib/services/eligibility-service';
import { evaluateRequestSchema } from '@/lib/validations/eligibility';
import type { EvaluateResponse } from '@/types';
import { logger } from '@/lib/utils/logger';

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * 청약 자격을 평가하는 서버 액션
 * @param complexId - 단지 ID
 * @param supplyTypes - 공급 유형 목록 (선택)
 * @returns 자격 평가 결과 또는 에러 메시지
 */
export async function evaluateAction(
  complexId: string,
  supplyTypes?: string[],
): Promise<ActionResult<EvaluateResponse>> {
  try {
    const supabase = await createClient();
    const userId = await requireAuth(supabase);

    const validated = evaluateRequestSchema.parse({
      complex_id: complexId,
      supply_types: supplyTypes,
    });

    const result = await evaluateEligibility(
      supabase,
      userId,
      validated.complex_id,
      validated.supply_types,
    );

    revalidatePath(`/complexes/${complexId}`);
    revalidatePath('/eligibility');

    logger.info('자격 평가 완료', { userId, complexId });

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ProfileIncompleteError) {
      logger.warn('프로필 미완성으로 자격 평가 불가', {
        complexId,
        error: error.message,
      });
      return {
        success: false,
        error: '프로필 정보가 완성되지 않았습니다. 프로필을 먼저 완성해 주세요.',
      };
    }

    if (error instanceof DataLoadError) {
      logger.error('자격 평가 데이터 로드 실패', {
        complexId,
        error: error.message,
      });
      return {
        success: false,
        error: '단지 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.',
      };
    }

    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('자격 평가 요청 유효성 검사 실패', { error: error.message });
      return { success: false, error: '요청 데이터가 올바르지 않습니다.' };
    }

    logger.error('자격 평가 실패', { complexId, error });
    return { success: false, error: '자격 평가 중 오류가 발생했습니다.' };
  }
}
