import type { Database } from '@/types/database';

/** 특정 테이블의 Row 타입 추출 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** 특정 테이블의 Insert 타입 추출 */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** 특정 테이블의 Update 타입 추출 */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/** Enum 타입 추출 */
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

export type { Database };
