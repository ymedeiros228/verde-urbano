'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { GestaoSidebar } from '@/components/gestao/GestaoSidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils/cn';

export default function GestaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/eu?aviso=gestao');
      return;
    }
    if (role !== 'ong' && role !== 'prefeitura') {
      router.replace('/eu?aviso=gestao');
    }
  }, [user, role, loading, router]);

  if (loading || !user || (role !== 'ong' && role !== 'prefeitura')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sol">
        <div className="w-full max-w-sm space-y-3 px-6">
          <div className="h-4 w-32 animate-pulse rounded bg-folha-muted/30" />
          <div className="h-24 animate-pulse rounded-2xl bg-folha-muted/25" />
          <div className="h-24 animate-pulse rounded-2xl bg-folha-muted/25" />
          <p className="text-center text-sm text-folha">Carregando painel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sol density-gestao">
      <a
        href="#conteudo-gestao"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-folha focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ir para o conteúdo
      </a>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <GestaoSidebar />
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <button
          type="button"
          aria-label="Fechar menu"
          className={cn(
            'absolute inset-0 bg-tinta/40 transition-opacity',
            open ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 transition-transform duration-200',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <GestaoSidebar onNavigate={() => setOpen(false)} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-folha-muted/30 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-tinta-muted hover:bg-sol lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="font-display text-sm font-semibold text-folha sm:text-base">
              Painel
            </h1>
          </div>
          <span className="shrink-0 rounded-full bg-folha/10 px-3 py-1 text-xs font-semibold text-folha">
            Teresina / PI
          </span>
        </header>
        <div
          id="conteudo-gestao"
          className="density-gestao flex-1 overflow-auto p-3 sm:p-5"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
