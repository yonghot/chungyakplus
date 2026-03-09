'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
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

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <FadeInUp duration={0.4}>
        <Card className="shadow-lg rounded-xl border-border/50">
          <CardContent className="flex flex-col items-center gap-5 px-8 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">이메일 인증을 확인해주세요</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="font-semibold text-foreground">
                  {email}
                </strong>
                으로 인증 링크를 발송했습니다.
                <br />
                이메일을 확인하고 인증을 완료해주세요.
              </p>
            </div>
            <Button asChild className="mt-2 h-10 w-full font-semibold">
              <Link href="/login">로그인으로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      </FadeInUp>
    );
  }

  return (
    <FadeInUp duration={0.4}>
      <Card className="shadow-lg rounded-xl border-border/50">
        <CardHeader className="pb-4 pt-6 text-center">
          <CardTitle className="text-xl font-bold">회원가입</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            청약플러스와 함께 내 집 마련을 시작하세요
          </p>
        </CardHeader>

        <CardContent>
          <form
            id="signup-form"
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
                autoComplete="new-password"
                placeholder="최소 6자 이상"
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="비밀번호를 다시 입력하세요"
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
                  가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t pb-6 pt-4">
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              로그인
            </Link>
          </p>
        </CardFooter>
      </Card>
    </FadeInUp>
  );
}
