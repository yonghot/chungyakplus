import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /** 실험적 기능 */
  experimental: {
    /** Server Actions 활성화 (Next.js 15에서는 기본 활성화) */
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },

  /** 이미지 최적화 설정 */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  /** 리다이렉트 — 후행 슬래시 제거 */
  trailingSlash: false,

  /** 보안 헤더 — 모든 라우트에 적용 */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
