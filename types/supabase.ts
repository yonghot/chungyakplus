/**
 * Supabase 클라이언트 공유 타입
 *
 * 3번째 제네릭 파라미터를 명시적으로 지정하여
 * createClient() 반환 타입과의 호환성을 보장한다.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SupabaseDb = SupabaseClient<Database, 'public', any>;
