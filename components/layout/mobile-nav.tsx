'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Home, Star, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MobileNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: MobileNavItem[] = [
  { href: '/complexes', label: '홈', icon: Home },
  { href: '/recommend', label: '추천', icon: Star },
  { href: '/profile', label: '프로필', icon: User },
  { href: '/notifications', label: '알림', icon: Bell },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 block border-t bg-background md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-14 items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
