'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { updateProfileAction } from '@/lib/actions/profile-actions';
import { useAuth } from '@/hooks/use-auth';
import type { Profile } from '@/types';

/**
 * 프로필 조회 훅
 *
 * 로그인한 사용자의 프로필 데이터를 Supabase에서 직접 조회한다.
 * 인증 상태에 따라 쿼리를 활성화/비활성화 한다.
 */
export function useProfile() {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!user,
  });
}

/**
 * 프로필 수정 뮤테이션 훅
 *
 * updateProfileAction 서버 액션을 래핑하고,
 * 성공 시 프로필 쿼리 캐시를 무효화한다.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await updateProfileAction(data);

      if (!result.success) {
        throw new Error(result.error ?? '프로필 수정에 실패했습니다.');
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
