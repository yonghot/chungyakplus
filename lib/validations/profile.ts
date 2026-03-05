import { z } from 'zod';
import { dateSchema, phoneSchema, currencySchema } from '@/lib/validations/common';
import type { MaritalStatus, SubscriptionType } from '@/types/database';

const MARITAL_STATUSES: [MaritalStatus, ...MaritalStatus[]] = [
  'single',
  'married',
  'divorced',
  'widowed',
];

const SUBSCRIPTION_TYPES: [SubscriptionType, ...SubscriptionType[]] = [
  'savings',
  'deposit',
  'housing',
];

/** 1단계: 기본 정보 */
export const profileStep1Schema = z.object({
  name: z
    .string()
    .min(2, '이름은 2자 이상 입력해주세요')
    .max(50, '이름은 50자 이하로 입력해주세요'),
  birth_date: dateSchema,
  phone: phoneSchema.nullable().optional(),
});

/** 2단계: 세대 정보 */
export const profileStep2Schema = z
  .object({
    is_household_head: z.boolean(),
    marital_status: z.enum(MARITAL_STATUSES, {
      errorMap: () => ({ message: '혼인 상태를 선택해주세요' }),
    }),
    marriage_date: dateSchema.nullable().optional(),
    dependents_count: z
      .number()
      .int('정수만 입력 가능합니다')
      .nonnegative('부양가족 수는 0 이상이어야 합니다')
      .max(20, '부양가족 수를 확인해주세요')
      .default(0),
    homeless_start_date: dateSchema.nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.marital_status === 'married') {
        return data.marriage_date !== null;
      }
      return true;
    },
    {
      message: '기혼인 경우 혼인 날짜를 입력해주세요',
      path: ['marriage_date'],
    },
  );

/** 3단계: 자산 정보 */
export const profileStep3Schema = z.object({
  total_assets_krw: currencySchema.nullable().optional(),
  monthly_income_krw: currencySchema.nullable().optional(),
  car_value_krw: currencySchema.nullable().optional(),
});

/** 4단계: 청약 이력 */
export const profileStep4Schema = z
  .object({
    subscription_type: z
      .enum(SUBSCRIPTION_TYPES, {
        errorMap: () => ({ message: '청약통장 유형을 선택해주세요' }),
      })
      .nullable()
      .optional(),
    subscription_start_date: dateSchema.nullable().optional(),
    deposit_count: z
      .number()
      .int('정수만 입력 가능합니다')
      .nonnegative('납입 횟수는 0 이상이어야 합니다')
      .nullable()
      .optional(),
    has_won_before: z.boolean().default(false),
    won_date: dateSchema.nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.has_won_before) {
        return data.won_date !== null;
      }
      return true;
    },
    {
      message: '당첨 이력이 있는 경우 당첨 날짜를 입력해주세요',
      path: ['won_date'],
    },
  );

/** 전체 프로필 기본 객체 (refine 적용 전) */
const fullProfileBaseSchema = z.object({
  ...profileStep1Schema.shape,
  ...profileStep2Schema.innerType().shape,
  ...profileStep3Schema.shape,
  ...profileStep4Schema.innerType().shape,
});

/** 전체 프로필 (4단계 병합 + 교차 검증) */
export const fullProfileSchema = fullProfileBaseSchema
  .refine(
    (data) => {
      if (data.marital_status === 'married') {
        return data.marriage_date !== null;
      }
      return true;
    },
    {
      message: '기혼인 경우 혼인 날짜를 입력해주세요',
      path: ['marriage_date'],
    },
  )
  .refine(
    (data) => {
      if (data.has_won_before) {
        return data.won_date !== null;
      }
      return true;
    },
    {
      message: '당첨 이력이 있는 경우 당첨 날짜를 입력해주세요',
      path: ['won_date'],
    },
  );

/** 프로필 부분 수정 */
export const profileUpdateSchema = fullProfileBaseSchema.partial();

export type ProfileStep1 = z.infer<typeof profileStep1Schema>;
export type ProfileStep2 = z.infer<typeof profileStep2Schema>;
export type ProfileStep3 = z.infer<typeof profileStep3Schema>;
export type ProfileStep4 = z.infer<typeof profileStep4Schema>;
export type FullProfile = z.infer<typeof fullProfileSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
