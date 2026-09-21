'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SEMAM } from '@/lib/data/semam';

export default function GestaoConfigPage() {
  const supabaseOk = isSupabaseConfigured();
  const mapStyle = Boolean(process.env.NEXT_PUBLIC_MAP_STYLE_URL);

  return (
    <div className="vu-enter space-y-6">
      <PageHeader
        title="Configurações"
        description="Status do ambiente demo — sem SSO falso. Persistência real fica no backlog Supabase."
      />

      <section className="rounded-2xl border border-folha-muted/30 bg-white p-5 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-folha">
          Modo demo
        </h2>
        <p className="mt-1 text-sm text-tinta-muted">
          Login demo em <Link href="/eu" className="font-semibold text-folha underline">/eu</Link>{' '}
          libera o painel (ONG / Prefeitura) sem backend.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center justify-between gap-3 border-b border-folha-muted/20 py-2">
            <span>Supabase (.env)</span>
            <Badge tone={supabaseOk ? 'folha' : 'muted'}>
              {supabaseOk ? 'Configurado' : 'Não configurado'}
            </Badge>
          </li>
          <li className="flex items-center justify-between gap-3 border-b border-folha-muted/20 py-2">
            <span>Estilo de mapa custom</span>
            <Badge tone={mapStyle ? 'folha' : 'muted'}>
              {mapStyle ? 'NEXT_PUBLIC_MAP_STYLE_URL' : 'OpenFreeMap padrão'}
            </Badge>
          </li>
          <li className="flex items-center justify-between gap-3 py-2">
            <span>Dados</span>
            <Badge tone="ipe" className="normal-case">
              Mock local
            </Badge>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-folha-muted/30 bg-white p-5 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-folha">
          Links SEMAM
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <a
              href={SEMAM.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-folha hover:underline"
            >
              Site oficial <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
          <li>
            <a
              href={SEMAM.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-folha hover:underline"
            >
              Instagram <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
          <li className="text-tinta-muted">{SEMAM.telefone} · {SEMAM.email}</li>
        </ul>
      </section>
    </div>
  );
}
