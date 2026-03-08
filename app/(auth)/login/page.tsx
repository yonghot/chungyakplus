'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { FadeInUp } from '@/components/ui/motion';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/complexes';
  // 오픈 리다이렉트 방지: 상대 경로만 허용
  const redirectTo =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/complexes';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? '이메일 또는 비밀번호가 올바르지 않습니다.'
            : authError.message,
        );
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <FadeInUp duration={0.4}>
      <Card className="shadow-lg rounded-xl border-border/50">
        <CardHeader className="pb-4 pt-6 text-center">
          <CardTitle className="text-xl font-bold">로그인</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            계정에 로그인하여 서비스를 이용하세요
          </p>
        </CardHeader>

        <CardContent>
          <form
            id="login-form"
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@example.com"
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="비밀번호를 입력하세요"
                disabled={loading}
                className="h-10"
              />
            </div>

            {error && (
              <div
                className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t pb-6 pt-4">
          <p className="text-sm text-muted-foreground">
            계정이 없으신가요?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              회원가입
            </Link>
          </p>
        </CardFooter>
      </Card>
    </FadeInUp>
  );
}
