'use client';

import Link from 'next/link';
import { User, Users, Home, CreditCard, Pencil } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CompletionBadge } from '@/components/features/profile/completion-badge';
import { formatDate } from '@/lib/utils/format';
import type { Profile } from '@/types';

interface ProfileCardProps {
  profile: Profile;
  completion: number;
}

const MARITAL_STATUS_LABELS: Record<string, string> = {
  single: '미혼',
  married: '기혼',
  divorced: '이혼',
  widowed: '사별',
};

const SUBSCRIPTION_TYPE_LABELS: Record<string, string> = {
  savings: '청약저축',
  deposit: '청약예금',
  housing: '주택청약종합저축',
};

export function ProfileCard({ profile, completion }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">내 프로필</CardTitle>
          <CompletionBadge completion={completion} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{profile.name}</span>
            <span className="text-muted-foreground">
              {formatDate(profile.birth_date)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {MARITAL_STATUS_LABELS[profile.marital_status] ?? profile.marital_status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              세대주: {profile.is_household_head ? '예' : '아니오'} / 부양가족:{' '}
              {profile.dependents_count}명
            </span>
          </div>

          {profile.subscription_type && (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {SUBSCRIPTION_TYPE_LABELS[profile.subscription_type] ??
                  profile.subscription_type}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">프로필 완성도</span>
            <span className="font-medium">{completion}%</span>
          </div>
          <Progress value={completion} max={100} />
        </div>
      </CardContent>

      <CardFooter>
        <Link href="/profile" className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            수정하기
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
