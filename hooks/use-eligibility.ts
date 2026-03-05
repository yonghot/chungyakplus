'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { evaluateAction } from '@/lib/actions/eligibility-actions';
import { useAuth } from '@/hooks/use-auth';
import type { EligibilityResult, EvaluateResponse } from '@/types';

/**
 * 자격 평가 실행 뮤테이션 훅
 *
 * evaluateAction 서버 액션을 래핑하여 자격 평가를 실행하고,
 * 성공 시 해당 단지의 결과 캐시를 무효화한다.
 */
export function useEvaluate() {
  const queryClient = useQueryClient();

  return useMutation<
    EvaluateResponse,
    Error,
    { complexId: string; supplyTypes?: string[] }
  >({
    mutationFn: async ({ complexId, supplyTypes }) => {
      const result = await evaluateAction(complexId, supplyTypes);

      if (!result.success) {
        throw new Error(result.error ?? '자격 평가에 실패했습니다.');
      }

      return result.data as unknown as EvaluateResponse;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['eligibility', variables.complexId],
      });
    },
  });
}

/**
 * 자격 평가 결과 조회 훅
 *
 * 특정 단지에 대한 기존 평가 결과를 Supabase에서 직접 조회한다.
 * complexId가 비어있거나 사용자가 미인증이면 쿼리를 비활성화한다.
 */
export function useEligibilityResults(complexId: string) {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery<EligibilityResult[]>({
    queryKey: ['eligibility', complexId],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('eligibility_results')
        .select('*')
        .eq('complex_id', complexId)
        .eq('profile_id', user.id)
        .order('evaluated_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
    enabled: !!complexId && !!user,
  });
}
