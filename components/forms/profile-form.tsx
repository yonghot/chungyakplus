'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectOption } from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  profileUpdateSchema,
  type ProfileUpdate,
} from '@/lib/validations/profile';
import type { Profile } from '@/types';

interface ProfileFormProps {
  profile: Profile;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

function FormField({
  label,
  error,
  required = false,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdate>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: profile.name,
      birth_date: profile.birth_date,
      phone: profile.phone ?? undefined,
      is_household_head: profile.is_household_head,
      marital_status: profile.marital_status,
      marriage_date: profile.marriage_date ?? undefined,
      dependents_count: profile.dependents_count,
      homeless_start_date: profile.homeless_start_date ?? undefined,
      total_assets_krw: profile.total_assets_krw ?? undefined,
      monthly_income_krw: profile.monthly_income_krw ?? undefined,
      car_value_krw: profile.car_value_krw ?? undefined,
      subscription_type: profile.subscription_type ?? undefined,
      subscription_start_date: profile.subscription_start_date ?? undefined,
      deposit_count: profile.deposit_count ?? undefined,
      has_won_before: profile.has_won_before,
      won_date: profile.won_date ?? undefined,
    },
  });

  const maritalStatus = watch('marital_status');
  const isHouseholdHead = watch('is_household_head');
  const hasWonBefore = watch('has_won_before');
  const subscriptionType = watch('subscription_type');

  async function handleFormSubmit(data: ProfileUpdate) {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await onSubmit(data as Record<string, unknown>);
    } catch {
      setServerError('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Accordion type="multiple" defaultValue={['basic', 'household', 'asset', 'subscription']}>
        {/* Section 1: Basic info */}
        <AccordionItem value="basic">
          <AccordionTrigger>
            <span className="text-sm font-medium">기본 정보</span>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="border-0 shadow-none">
              <CardContent className="space-y-4 p-0">
                <FormField label="이름" error={errors.name?.message} required>
                  <Input placeholder="홍길동" {...register('name')} />
                </FormField>

                <FormField
                  label="생년월일"
                  error={errors.birth_date?.message}
                  required
                >
                  <Input type="date" {...register('birth_date')} />
                </FormField>

                <FormField label="전화번호" error={errors.phone?.message}>
                  <Input placeholder="010-1234-5678" {...register('phone')} />
                </FormField>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Household info */}
        <AccordionItem value="household">
          <AccordionTrigger>
            <span className="text-sm font-medium">세대 정보</span>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="border-0 shadow-none">
              <CardContent className="space-y-4 p-0">
                <FormField
                  label="세대주 여부"
                  error={errors.is_household_head?.message}
                >
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={isHouseholdHead ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setValue('is_household_head', true, { shouldDirty: true })}
                    >
                      예
                    </Button>
                    <Button
                      type="button"
                      variant={!isHouseholdHead ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setValue('is_household_head', false, { shouldDirty: true })}
                    >
                      아니오
                    </Button>
                  </div>
                </FormField>

                <FormField
                  label="혼인 상태"
                  error={errors.marital_status?.message}
                >
                  <Select
                    value={maritalStatus ?? ''}
                    onChange={(e) =>
                      setValue(
                        'marital_status',
                        e.target.value as ProfileUpdate['marital_status'],
                        { shouldValidate: true, shouldDirty: true }
                      )
                    }
                  >
                    <SelectOption value="" disabled>
                      선택해주세요
                    </SelectOption>
                    <SelectOption value="single">미혼</SelectOption>
                    <SelectOption value="married">기혼</SelectOption>
                    <SelectOption value="divorced">이혼</SelectOption>
                    <SelectOption value="widowed">사별</SelectOption>
                  </Select>
                </FormField>

                {maritalStatus === 'married' && (
                  <FormField
                    label="혼인 날짜"
                    error={errors.marriage_date?.message}
                    required
                  >
                    <Input type="date" {...register('marriage_date')} />
                  </FormField>
                )}

                <FormField
                  label="부양가족 수"
                  error={errors.dependents_count?.message}
                >
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    {...register('dependents_count', { valueAsNumber: true })}
                  />
                </FormField>

                <FormField
                  label="무주택 시작일"
                  error={errors.homeless_start_date?.message}
                >
                  <Input type="date" {...register('homeless_start_date')} />
                </FormField>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Section 3: Asset info */}
        <AccordionItem value="asset">
          <AccordionTrigger>
            <span className="text-sm font-medium">자산 정보</span>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="border-0 shadow-none">
              <CardContent className="space-y-4 p-0">
                <FormField
                  label="총 자산 (원)"
                  error={errors.total_assets_krw?.message}
                >
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    {...register('total_assets_krw', { valueAsNumber: true })}
                  />
                </FormField>

                <FormField
                  label="월 소득 (원)"
                  error={errors.monthly_income_krw?.message}
                >
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    {...register('monthly_income_krw', { valueAsNumber: true })}
                  />
                </FormField>

                <FormField
                  label="자동차 가액 (원)"
                  error={errors.car_value_krw?.message}
                >
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    {...register('car_value_krw', { valueAsNumber: true })}
                  />
                </FormField>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Section 4: Subscription history */}
        <AccordionItem value="subscription">
          <AccordionTrigger>
            <span className="text-sm font-medium">청약 이력</span>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="border-0 shadow-none">
              <CardContent className="space-y-4 p-0">
                <FormField
                  label="청약통장 유형"
                  error={errors.subscription_type?.message}
                >
                  <Select
                    value={subscriptionType ?? ''}
                    onChange={(e) =>
                      setValue(
                        'subscription_type',
                        (e.target.value || undefined) as ProfileUpdate['subscription_type'],
                        { shouldValidate: true, shouldDirty: true }
                      )
                    }
                  >
                    <SelectOption value="">선택 안 함</SelectOption>
                    <SelectOption value="savings">청약저축</SelectOption>
                    <SelectOption value="deposit">청약예금</SelectOption>
                    <SelectOption value="housing">주택청약종합저축</SelectOption>
                  </Select>
                </FormField>

                <FormField
                  label="청약통장 가입일"
                  error={errors.subscription_start_date?.message}
                >
                  <Input type="date" {...register('subscription_start_date')} />
                </FormField>

                <FormField
                  label="납입 횟수"
                  error={errors.deposit_count?.message}
                >
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    {...register('deposit_count', { valueAsNumber: true })}
                  />
                </FormField>

                <FormField
                  label="과거 당첨 이력"
                  error={errors.has_won_before?.message}
                >
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={hasWonBefore ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setValue('has_won_before', true, { shouldDirty: true })}
                    >
                      있음
                    </Button>
                    <Button
                      type="button"
                      variant={!hasWonBefore ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setValue('has_won_before', false, { shouldDirty: true })}
                    >
                      없음
                    </Button>
                  </div>
                </FormField>

                {hasWonBefore && (
                  <FormField
                    label="당첨 날짜"
                    error={errors.won_date?.message}
                    required
                  >
                    <Input type="date" {...register('won_date')} />
                  </FormField>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-4 w-4" />
              저장하기
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
