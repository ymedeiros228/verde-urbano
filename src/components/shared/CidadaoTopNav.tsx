'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Users, Leaf, User } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils/cn';

export const CIDADAO_NAV = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/mapear', label: 'Mapear', icon: MapPin },
  { href: '/mutiroes', label: 'Mutirões', icon: Users },
  { href: '/guias', label: 'Guias', icon: Leaf },
  { href: '/eu', label: 'Eu', icon: User },
] as const;

export function CidadaoTopNav() {
  const pathname = usePathname();
  const { role } = useAuth();
  const canGestao = role === 'ong' || role === 'prefeitura';

  return (
    <header className="sticky top-0 z-40 hidden border-b border-folha-muted/30 bg-white/90 backdrop-blur-md md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/feed" className="flex items-baseline gap-2 shrink-0">
          <span className="font-display text-xl font-semibold tracking-tight text-folha">
            Verde Urbano
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-tinta-faint">
            Teresina
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Principal">
          {CIDADAO_NAV.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-folha text-white shadow-soft'
                    : 'text-tinta-muted hover:bg-sol hover:text-folha'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        {canGestao ? (
          <Link
            href="/gestao"
            className="rounded-xl border border-folha/20 px-3 py-1.5 text-xs font-semibold text-folha transition hover:bg-folha/5"
          >
            Painel gestão
          </Link>
        ) : (
          <Link
            href="/eu"
            className="text-[11px] font-medium text-tinta-faint transition hover:text-folha"
          >
            Demo painel
          </Link>
        )}
      </div>
    </header>
  );
}
