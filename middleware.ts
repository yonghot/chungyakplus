import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

const PUBLIC_ROUTES = new Set(['/', '/login', '/signup', '/api/health']);

/** 인증 없이 접근 가능한 API 경로 접두사 */
const PUBLIC_API_PREFIXES = ['/api/map/'];

const AUTH_ONLY_ROUTES = new Set(['/login', '/signup']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 인증 체크 없이 바로 통과
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (PUBLIC_ROUTES.has(pathname) || isPublicApi) {
    return NextResponse.next();
  }

  const { supabase, response } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 미인증 사용자 -> 보호 라우트 접근 시 로그인 페이지로 리다이렉트
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 인증된 사용자 -> 로그인/회원가입 접근 시 메인 페이지로 리다이렉트
  if (user && AUTH_ONLY_ROUTES.has(pathname)) {
    const mainUrl = request.nextUrl.clone();
    mainUrl.pathname = '/complexes';
    return NextResponse.redirect(mainUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
