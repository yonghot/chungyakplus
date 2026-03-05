import type { Bookmark, Complex } from '@/types/database';
import type { SupabaseDb } from '@/types/supabase';
import { logger } from '@/lib/utils/logger';

import type { RepositoryResult } from '@/lib/repositories/profile-repository';

/** 북마크된 단지 목록 (단지 정보 포함) */
export interface BookmarkedComplex {
  bookmark: Bookmark;
  complex: Complex;
}

/** 사용자의 북마크 목록 조회 (단지 정보 조인) */
export async function list(
  supabase: SupabaseDb,
  profileId: string,
): Promise<RepositoryResult<BookmarkedComplex[]>> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, complexes(*)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .returns<(Bookmark & { complexes: Complex })[]>();

  if (error) {
    logger.error('bookmark-repository.list failed', {
      profileId,
      error: error.message,
    });
    return { data: null, error: error.message };
  }

  const result: BookmarkedComplex[] = (data ?? []).map((row) => {
    const { complexes: complex, ...bookmark } = row;
    return { bookmark, complex };
  });

  return { data: result, error: null };
}

/**
 * 북마크 토글 (추가/삭제)
 *
 * 이미 존재하면 삭제하고 { added: false } 반환,
 * 존재하지 않으면 추가하고 { added: true } 반환.
 */
export async function toggle(
  supabase: SupabaseDb,
  profileId: string,
  complexId: string,
): Promise<RepositoryResult<{ added: boolean }>> {
  // 기존 북마크 확인
  const { data: existing, error: findError } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('profile_id', profileId)
    .eq('complex_id', complexId)
    .maybeSingle();

  if (findError) {
    logger.error('bookmark-repository.toggle find failed', {
      profileId,
      complexId,
      error: findError.message,
    });
    return { data: null, error: findError.message };
  }

  if (existing) {
    // 이미 존재하면 삭제
    const { error: deleteError } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', existing.id);

    if (deleteError) {
      logger.error('bookmark-repository.toggle delete failed', {
        bookmarkId: existing.id,
        error: deleteError.message,
      });
      return { data: null, error: deleteError.message };
    }

    return { data: { added: false }, error: null };
  }

  // 존재하지 않으면 추가
  const { error: insertError } = await supabase
    .from('bookmarks')
    .insert({ profile_id: profileId, complex_id: complexId });

  if (insertError) {
    logger.error('bookmark-repository.toggle insert failed', {
      profileId,
      complexId,
      error: insertError.message,
    });
    return { data: null, error: insertError.message };
  }

  return { data: { added: true }, error: null };
}

/** 북마크 존재 여부 확인 */
export async function exists(
  supabase: SupabaseDb,
  profileId: string,
  complexId: string,
): Promise<RepositoryResult<boolean>> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('profile_id', profileId)
    .eq('complex_id', complexId)
    .maybeSingle();

  if (error) {
    logger.error('bookmark-repository.exists failed', {
      profileId,
      complexId,
      error: error.message,
    });
    return { data: null, error: error.message };
  }

  return { data: data !== null, error: null };
}
