import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { type ReactNode } from 'react';
import { SEMAM } from '@/lib/data/semam';

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-folha lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #2D8A58 0%, transparent 45%), radial-gradient(circle at 80% 70%, #E8B84A 0%, transparent 40%)',
          }}
          aria-hidden
        />
        <Link href="/" className="relative z-10 flex items-center gap-2 text-white">
          <Leaf className="h-6 w-6" />
          <span className="font-display text-2xl font-semibold">Verde Urbano</span>
        </Link>
        <div className="relative z-10 max-w-md text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ipe-soft">
            Extensão · Teresina · {SEMAM.sigla}
          </p>
          <p className="mt-4 font-display text-3xl font-semibold leading-tight">
            Mapear, apoiar e arborizar a cidade com a comunidade.
          </p>
          <p className="mt-3 text-sm text-white/75">
            Conteúdo alinhado à Prefeitura e canais oficiais de denúncia e mudas.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/50">
          Free tier · MapLibre · trabalho de extensão
        </p>
      </aside>

      <div className="flex flex-col justify-center bg-sol px-6 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-folha lg:hidden"
          >
            <Leaf className="h-5 w-5" />
            <span className="font-display text-xl font-semibold">Verde Urbano</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-folha">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-tinta-muted">{description}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
