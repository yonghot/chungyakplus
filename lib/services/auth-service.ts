import type { User } from '@supabase/supabase-js';

import type { SupabaseDb } from '@/types/supabase';
import { logger } from '@/lib/utils/logger';

/**
 * 현재 인증된 사용자를 반환한다.
 *
 * 인증되지 않은 경우 null을 반환한다.
 */
export async function getCurrentUser(
  supabase: SupabaseDb,
): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    logger.error('auth-service.getCurrentUser failed', { error: error.message });
    return null;
  }

  return user;
}

/**
 * 인증을 검증하고 사용자 ID를 반환한다.
 *
 * 인증되지 않은 경우 에러를 throw한다.
 * Route Handler나 Server Action에서 인증 게이트로 사용한다.
 *
 * @throws {Error} AUTH_REQUIRED - 인증되지 않은 경우
 */
export async function requireAuth(
  supabase: SupabaseDb,
): Promise<string> {
  const user = await getCurrentUser(supabase);

  if (!user) {
    throw new Error('AUTH_REQUIRED');
  }

  return user.id;
}
