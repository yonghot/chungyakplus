import Link from 'next/link';
import { ClipboardCheck, Star, Calculator } from 'lucide-react';

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: '자격 진단',
    description: '7개 공급유형 자격 자동 판정',
  },
  {
    icon: Star,
    title: '맞춤 추천',
    description: '내 조건에 맞는 단지 추천',
  },
  {
    icon: Calculator,
    title: '가점 분석',
    description: '84점 가점 항목별 분석',
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            청약메이트
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            나에게 맞는 청약을 찾아보세요
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            시행사 도메인 지식 기반 청약 자격 진단 및 당첨 확률 분석
          </p>

          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold">
            주요 기능
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground">
        <p>&copy; 2025 청약메이트. All rights reserved.</p>
      </footer>
    </div>
  );
}
