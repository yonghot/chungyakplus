import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/providers';

export const metadata: Metadata = {
  title: '청약플러스',
  description:
    '내 청약 경쟁력에 +를 더하는 — 물건 가치 분석 x 경쟁률 예측 x 청약 기회 보호 통합 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
