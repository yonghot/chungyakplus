import { z } from 'zod';

/** YYYY-MM-DD 형식 날짜 문자열 */
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)')
  .refine((val) => !Number.isNaN(Date.parse(val)), '유효하지 않은 날짜입니다');

/** 0 이상 정수 (원화 금액) */
export const currencySchema = z
  .number({ invalid_type_error: '숫자를 입력해주세요' })
  .int('정수만 입력 가능합니다')
  .nonnegative('0 이상의 값을 입력해주세요');

/** UUID v4 형식 */
export const uuidSchema = z
  .string()
  .uuid('올바른 ID 형식이 아닙니다');

/** 한국 휴대전화 번호 (010-XXXX-XXXX) */
export const phoneSchema = z
  .string()
  .regex(
    /^010-\d{4}-\d{4}$/,
    '올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)',
  );

/** 페이지네이션 파라미터 */
export const pageSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive('페이지 번호는 1 이상이어야 합니다')
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100, '한 번에 최대 100개까지 조회할 수 있습니다')
    .default(20),
});

export type PageParams = z.infer<typeof pageSchema>;
