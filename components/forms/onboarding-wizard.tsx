'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectOption } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { createProfileAction } from '@/lib/actions/profile-actions';
import {
  profileStep1Schema,
  profileStep2Schema,
  profileStep3Schema,
  profileStep4Schema,
  type ProfileStep1,
  type ProfileStep2,
  type ProfileStep3,
  type ProfileStep4,
} from '@/lib/validations/profile';

const STEP_TITLES = [
  '기본 정보',
  '세대 정보',
  '자산 정보',
  '청약 이력',
] as const;

/** FormField wrapper for consistent label + error styling */
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

/** Step 1: Basic info */
function Step1Form({
  defaultValues,
  onNext,
}: {
  defaultValues: Record<string, unknown> | null;
  onNext: (data: ProfileStep1) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileStep1>({
    resolver: zodResolver(profileStep1Schema),
    defaultValues: (defaultValues as Partial<ProfileStep1>) ?? {
      name: '',
      birth_date: '',
      phone: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <FormField label="이름" error={errors.name?.message} required>
        <Input placeholder="홍길동" {...register('name')} />
      </FormField>

      <FormField label="생년월일" error={errors.birth_date?.message} required>
        <Input type="date" {...register('birth_date')} />
      </FormField>

      <FormField label="전화번호" error={errors.phone?.message}>
        <Input placeholder="010-1234-5678" {...register('phone')} />
      </FormField>

      <div className="flex justify-end pt-4">
        <Button type="submit">
          다음
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

/** Step 2: Household info */
function Step2Form({
  defaultValues,
  onNext,
  onPrev,
}: {
  defaultValues: Record<string, unknown> | null;
  onNext: (data: ProfileStep2) => void;
  onPrev: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileStep2>({
    resolver: zodResolver(profileStep2Schema),
    defaultValues: (defaultValues as Partial<ProfileStep2>) ?? {
      is_household_head: false,
      marital_status: undefined,
      marriage_date: null,
      dependents_count: 0,
      homeless_start_date: null,
    },
  });

  const maritalStatus = watch('marital_status');
  const isHouseholdHead = watch('is_household_head');

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <FormField label="세대주 여부" error={errors.is_household_head?.message} required>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={isHouseholdHead ? 'default' : 'outline'}
            size="sm"
            onClick={() => setValue('is_household_head', true)}
          >
            예
          </Button>
          <Button
            type="button"
            variant={!isHouseholdHead ? 'default' : 'outline'}
            size="sm"
            onClick={() => setValue('is_household_head', false)}
          >
            아니오
          </Button>
        </div>
      </FormField>

      <FormField
        label="혼인 상태"
        error={errors.marital_status?.message}
        required
      >
        <Select
          value={maritalStatus ?? ''}
          onChange={(e) =>
            setValue(
              'marital_status',
              e.target.value as ProfileStep2['marital_status'],
              { shouldValidate: true }
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
        required
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

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          이전
        </Button>
        <Button type="submit">
          다음
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

/** Step 3: Asset info */
function Step3Form({
  defaultValues,
  onNext,
  onPrev,
}: {
  defaultValues: Record<string, unknown> | null;
  onNext: (data: ProfileStep3) => void;
  onPrev: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileStep3>({
    resolver: zodResolver(profileStep3Schema),
    defaultValues: (defaultValues as Partial<ProfileStep3>) ?? {
      total_assets_krw: null,
      monthly_income_krw: null,
      car_value_krw: null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
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

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          이전
        </Button>
        <Button type="submit">
          다음
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

/** Step 4: Subscription history */
function Step4Form({
  defaultValues,
  onNext,
  onPrev,
  isPending,
}: {
  defaultValues: Record<string, unknown> | null;
  onNext: (data: ProfileStep4) => void;
  onPrev: () => void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileStep4>({
    resolver: zodResolver(profileStep4Schema),
    defaultValues: (defaultValues as Partial<ProfileStep4>) ?? {
      subscription_type: null,
      subscription_start_date: null,
      deposit_count: null,
      has_won_before: false,
      won_date: null,
    },
  });

  const subscriptionType = watch('subscription_type');
  const hasWonBefore = watch('has_won_before');

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <FormField
        label="청약통장 유형"
        error={errors.subscription_type?.message}
      >
        <Select
          value={subscriptionType ?? ''}
          onChange={(e) =>
            setValue(
              'subscription_type',
              (e.target.value || null) as ProfileStep4['subscription_type'],
              { shouldValidate: true }
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

      <FormField label="납입 횟수" error={errors.deposit_count?.message}>
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
            onClick={() => setValue('has_won_before', true)}
          >
            있음
          </Button>
          <Button
            type="button"
            variant={!hasWonBefore ? 'default' : 'outline'}
            size="sm"
            onClick={() => setValue('has_won_before', false)}
          >
            없음
          </Button>
        </div>
      </FormField>

      {hasWonBefore && (
        <FormField label="당첨 날짜" error={errors.won_date?.message} required>
          <Input type="date" {...register('won_date')} />
        </FormField>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          이전
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            '완료'
          )}
        </Button>
      </div>
    </form>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { currentStep, stepData, setStep, setStepData, reset } =
    useOnboardingStore();

  function handleNext1(data: ProfileStep1) {
    setStepData(1, data as unknown as Record<string, unknown>);
    setStep(2);
  }

  function handleNext2(data: ProfileStep2) {
    setStepData(2, data as unknown as Record<string, unknown>);
    setStep(3);
  }

  function handleNext3(data: ProfileStep3) {
    setStepData(3, data as unknown as Record<string, unknown>);
    setStep(4);
  }

  function handleComplete(data: ProfileStep4) {
    setStepData(4, data as unknown as Record<string, unknown>);

    startTransition(async () => {
      setServerError(null);

      // Re-read from store after setting step4
      const merged = {
        ...(stepData.step1 ?? {}),
        ...(stepData.step2 ?? {}),
        ...(stepData.step3 ?? {}),
        ...(data as unknown as Record<string, unknown>),
      };

      const result = await createProfileAction(merged);

      if (result.success) {
        reset();
        router.push('/complexes');
      } else {
        setServerError(result.error ?? '프로필 생성 중 오류가 발생했습니다.');
      }
    });
  }

  function handlePrev() {
    setStep(Math.max(1, currentStep - 1));
  }

  const progressValue = (currentStep / 4) * 100;

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      {/* Step indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            {currentStep}/4 단계
          </span>
          <span className="font-medium">
            {STEP_TITLES[currentStep - 1]}
          </span>
        </div>
        <Progress value={progressValue} max={100} />

        <div className="flex justify-between">
          {STEP_TITLES.map((title, idx) => (
            <span
              key={title}
              className={`text-xs ${
                idx + 1 <= currentStep
                  ? 'font-medium text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {title}
            </span>
          ))}
        </div>
      </div>

      {/* Form card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {STEP_TITLES[currentStep - 1]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {serverError && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {currentStep === 1 && (
            <Step1Form
              defaultValues={stepData.step1}
              onNext={handleNext1}
            />
          )}
          {currentStep === 2 && (
            <Step2Form
              defaultValues={stepData.step2}
              onNext={handleNext2}
              onPrev={handlePrev}
            />
          )}
          {currentStep === 3 && (
            <Step3Form
              defaultValues={stepData.step3}
              onNext={handleNext3}
              onPrev={handlePrev}
            />
          )}
          {currentStep === 4 && (
            <Step4Form
              defaultValues={stepData.step4}
              onNext={handleComplete}
              onPrev={handlePrev}
              isPending={isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
