'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { CIDADAO_NAV } from '@/components/shared/CidadaoTopNav';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-folha-muted/30 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex h-[4.25rem] max-w-lg items-stretch justify-around px-1">
        {CIDADAO_NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition',
                  active ? 'text-folha' : 'text-tinta-faint hover:text-folha'
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl transition',
                    active
                      ? 'bg-folha text-white shadow-soft vu-filter-in'
                      : 'bg-transparent'
                  )}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={active ? 2.25 : 1.75}
                    aria-hidden
                  />
                </span>
                <span className="relative">
                  {label}
                  {active && (
                    <span
                      className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-folha"
                      aria-hidden
                    />
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
