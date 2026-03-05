import { z } from 'zod';
import { uuidSchema, pageSchema } from '@/lib/validations/common';
import type { SupplyType, ComplexStatus } from '@/types/database';

const SUPPLY_TYPES: [SupplyType, ...SupplyType[]] = [
  'general',
  'newlywed',
  'first_life',
  'multi_child',
  'elderly_parent',
  'institutional',
  'relocation',
];

const COMPLEX_STATUSES: [ComplexStatus, ...ComplexStatus[]] = [
  'upcoming',
  'open',
  'closed',
  'completed',
];

/** 자격 판정 요청 */
export const evaluateRequestSchema = z.object({
  complex_id: uuidSchema,
  supply_types: z
    .array(
      z.enum(SUPPLY_TYPES, {
        errorMap: () => ({ message: '올바른 공급유형을 선택해주세요' }),
      }),
    )
    .optional(),
});

/** 단지 목록 조회 쿼리 */
export const complexQuerySchema = z
  .object({
    region: z.string().min(1).optional(),
    status: z
      .enum(COMPLEX_STATUSES, {
        errorMap: () => ({ message: '올바른 상태값을 선택해주세요' }),
      })
      .optional(),
  })
  .merge(pageSchema);

export type EvaluateRequest = z.infer<typeof evaluateRequestSchema>;
export type ComplexQuery = z.infer<typeof complexQuerySchema>;
