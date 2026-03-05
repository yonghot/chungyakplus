'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-14 border-b bg-background">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link
            href="/complexes"
            className="text-lg font-bold text-primary"
          >
            청약메이트
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="알림"
          >
            <Bell className="h-5 w-5" />
          </Link>

          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="프로필"
          >
            <User className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="로그아웃"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <nav className="border-b bg-background px-4 pb-4 pt-2 md:hidden">
          <MobileMenuLinks onNavigate={() => setMobileMenuOpen(false)} />
        </nav>
      )}
    </header>
  );
}

function MobileMenuLinks({ onNavigate }: { onNavigate: () => void }) {
  const links = [
    { href: '/complexes', label: '홈' },
    { href: '/recommend', label: '맞춤추천' },
    { href: '/profile', label: '내 프로필' },
    { href: '/notifications', label: '알림' },
  ];

  return (
    <ul className="space-y-1">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            onClick={onNavigate}
            className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
