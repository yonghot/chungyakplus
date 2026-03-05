'use client';

import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileCard } from '@/components/features/profile/profile-card';
import { CompletionBadge } from '@/components/features/profile/completion-badge';
import { ProfileForm } from '@/components/forms/profile-form';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
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
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">
            프로필을 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">내 프로필</h1>
        <p className="mt-1 text-muted-foreground">
          청약 자격 진단에 필요한 정보를 관리하세요
        </p>
      </div>

      {profile && (
        <div className="space-y-4">
          <CompletionBadge completion={profile.profile_completion} />
          <ProfileCard profile={profile} completion={profile.profile_completion} />
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold">프로필 수정</h2>
        {profile && (
          <ProfileForm
            profile={profile}
            onSubmit={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}
