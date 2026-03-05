'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ClipboardCheck, Home, Star, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  href: string;
  label: string;
  description?: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/complexes',
    label: '홈',
    icon: Home,
  },
  {
    href: '/complexes',
    label: '자격진단',
    description: '단지를 선택하여 진단',
    icon: ClipboardCheck,
  },
  {
    href: '/recommend',
    label: '맞춤추천',
    icon: Star,
  },
  {
    href: '/profile',
    label: '내 프로필',
    icon: User,
  },
  {
    href: '/notifications',
    label: '알림',
    icon: Bell,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-14 h-[calc(100vh-3.5rem)] w-60 overflow-y-auto border-r bg-sidebar-background">
      <nav className="space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <span className="block truncate">{item.label}</span>
                {item.description && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
