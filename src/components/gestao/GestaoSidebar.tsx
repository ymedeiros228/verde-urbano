'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  Inbox,
  Users,
  FileText,
  Settings,
  Trees,
  LogOut,
  Leaf,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/components/providers/AuthProvider';

const nav = [
  { href: '/gestao', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/gestao/mapa', label: 'Mapa', icon: Map },
  { href: '/gestao/demandas', label: 'Demandas', icon: Inbox },
  { href: '/gestao/mutiroes', label: 'Mutirões', icon: Users },
  { href: '/gestao/projetos', label: 'Espécies', icon: Trees },
  { href: '/gestao/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/gestao/configuracoes', label: 'Configurações', icon: Settings },
];

export function GestaoSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();

  return (
    <aside className="flex h-full min-h-screen w-64 shrink-0 flex-col border-r border-folha-muted/30 bg-white shadow-soft lg:shadow-none">
      <div className="border-b border-folha-muted/30 bg-gradient-to-br from-folha to-rio px-4 py-5 text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Leaf className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-display text-lg font-semibold leading-tight">
              Verde Urbano
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/75">
              Gestão · Teresina
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/gestao'
              ? pathname === '/gestao'
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-folha text-white shadow-soft'
                  : 'text-tinta-muted hover:bg-sol hover:text-folha'
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-ipe"
                  aria-hidden
                />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 border-t border-folha-muted/30 p-4">
        <Link
          href="/feed"
          onClick={onNavigate}
          className="block rounded-xl border border-folha/20 bg-folha/5 px-3 py-2 text-center text-xs font-semibold text-folha hover:bg-folha/10"
        >
          Abrir app cidadão
        </Link>
        <div>
          <p className="truncate text-xs text-tinta-muted">
            {user?.email || 'Visitante'}
          </p>
          <p className="text-[11px] font-semibold uppercase text-folha">
            {role === 'prefeitura'
              ? 'Prefeitura'
              : role === 'ong'
                ? 'ONG Ambiental'
                : 'Acesso limitado'}
          </p>
          <button
            type="button"
            onClick={() => {
              signOut();
              onNavigate?.();
            }}
            className="mt-2 flex items-center gap-1.5 text-xs text-tinta-faint hover:text-laterita"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
