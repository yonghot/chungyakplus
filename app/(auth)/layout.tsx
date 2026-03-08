import { Building2, CheckCircle2, TrendingUp, Shield } from 'lucide-react';

const BRAND_FEATURES = [
  {
    icon: CheckCircle2,
    title: '청약 자격 진단',
    description: '내 조건에 맞는 청약 자격을 정확하게 분석합니다',
  },
  {
    icon: TrendingUp,
    title: '당첨 확률 분석',
    description: '실제 데이터 기반으로 당첨 가능성을 예측합니다',
  },
  {
    icon: Shield,
    title: '안전한 정보 관리',
    description: '개인정보를 안전하게 보호합니다',
  },
] as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* 좌측 브랜드 패널 — 데스크톱 전용 */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-12">
        {/* 배경 장식 원 */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-1/4 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-white/5"
          aria-hidden="true"
        />

        {/* 상단 로고 */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            청약메이트
          </span>
        </div>

        {/* 중앙 카피 */}
        <div className="relative space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white">
              내 삶의 첫 집,
              <br />
              청약으로 시작하세요
            </h2>
            <p className="text-base leading-relaxed text-white/70">
              복잡한 청약 자격, 이제 직접 분석하지 않아도 됩니다.
              <br />
              청약메이트가 당신의 조건을 정밀하게 진단합니다.
            </p>
          </div>

          {/* 피처 목록 */}
          <ul className="space-y-4" role="list">
            {BRAND_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {feature.title}
                    </p>
                    <p className="mt-0.5 text-xs text-white/60">
                      {feature.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 하단 통계 */}
        <div className="relative flex items-center gap-8">
          <div>
            <p className="text-2xl font-bold text-white">2,400+</p>
            <p className="text-xs text-white/60">등록 단지</p>
          </div>
          <div className="h-8 w-px bg-white/20" aria-hidden="true" />
          <div>
            <p className="text-2xl font-bold text-white">98%</p>
            <p className="text-xs text-white/60">자격 진단 정확도</p>
          </div>
          <div className="h-8 w-px bg-white/20" aria-hidden="true" />
          <div>
            <p className="text-2xl font-bold text-white">15만+</p>
            <p className="text-xs text-white/60">누적 사용자</p>
          </div>
        </div>
      </div>

      {/* 우측 폼 영역 */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-12 lg:px-16">
        {/* 모바일 전용 로고 */}
        <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">청약메이트</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              내 삶의 첫 집, 청약으로 시작하세요
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
