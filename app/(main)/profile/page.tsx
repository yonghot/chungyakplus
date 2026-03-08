'use client';

import { toast } from 'sonner';
import { User, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProfileCard } from '@/components/features/profile/profile-card';
import { CompletionBadge } from '@/components/features/profile/completion-badge';
import { ProfileForm } from '@/components/forms/profile-form';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';
import {
  PageTransition,
  FadeIn,
  FadeInUp,
} from '@/components/ui/motion';

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      {/* CompletionBadge 스켈레톤 */}
      <Skeleton className="h-10 w-40 rounded-full" />
      {/* ProfileCard 스켈레톤 */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Skeleton className="h-3 w-full" />
        <div className="space-y-3 p-6">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      {/* ProfileForm 스켈레톤 */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="space-y-4 p-6">
          <Skeleton className="h-6 w-24" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
          </div>
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const updateProfile = useUpdateProfile();

  const handleUpdate = async (data: Record<string, unknown>) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success('프로필이 수정되었습니다.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '프로필 수정에 실패했습니다.';
      toast.error(message);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <p className="mt-4 font-medium text-destructive">
            프로필을 불러오는 중 오류가 발생했습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            잠시 후 다시 시도해주세요.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={() => refetch()}
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-8">
        {/* 페이지 헤더 */}
        <FadeIn>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">내 프로필</h1>
              <p className="mt-1 text-muted-foreground">
                청약 자격 진단에 필요한 정보를 관리하세요
              </p>
            </div>
          </div>
        </FadeIn>

        {profile && (
          <>
            {/* CompletionBadge */}
            <FadeIn delay={0.1}>
              <CompletionBadge completion={profile.profile_completion} />
            </FadeIn>

            {/* ProfileCard */}
            <FadeInUp delay={0.15}>
              <ProfileCard
                profile={profile}
                completion={profile.profile_completion}
              />
            </FadeInUp>
          </>
        )}

        {/* ProfileForm */}
        <FadeInUp delay={0.2}>
          <div>
            <h2 className="mb-4 text-lg font-semibold">프로필 수정</h2>
            {profile && (
              <ProfileForm
                profile={profile}
                onSubmit={handleUpdate}
              />
            )}
          </div>
        </FadeInUp>
      </div>
    </PageTransition>
  );
}
