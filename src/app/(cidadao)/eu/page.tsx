'use client';

import { Suspense, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ClipboardList,
  Leaf,
  LayoutDashboard,
  MapPin,
  Users,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { DemandaTile } from '@/components/feed/DemandaTile';
import { FeedRail } from '@/components/feed/FeedRail';
import { MutiraoCover } from '@/components/demanda/DemandaCover';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/providers/AuthProvider';
import { useDemandas } from '@/hooks/useDemandas';
import { useMutiroes } from '@/hooks/useMutiroes';
import { useEngagement } from '@/hooks/useEngagement';

const ROLE_LABEL: Record<string, string> = {
  cidadao: 'Cidadão',
  ong: 'ONG Ambiental',
  prefeitura: 'Prefeitura',
};

export default function EuPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg p-4 text-sm text-tinta-muted">
          Carregando…
        </div>
      }
    >
      <EuPageInner />
    </Suspense>
  );
}

function EuPageInner() {
  const { user, role, loading, signOut, demoLogin } = useAuth();
  const { data: demandas = [] } = useDemandas();
  const { data: mutiroes = [] } = useMutiroes();
  const { apoiosIds, mutiroesIds, extra } = useEngagement();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('aviso') !== 'gestao') return;
    toast('Entre com demo ONG ou Prefeitura para abrir o painel.', 'ipe');
    router.replace('/eu');
  }, [searchParams, toast, router]);

  const displayName =
    user?.email?.split('@')[0]?.replace(/\./g, ' ') || 'Visitante';

  const apoios = useMemo(() => {
    return apoiosIds
      .map((id) => demandas.find((d) => d.id === id))
      .filter(Boolean)
      .slice(0, 8)
      .map((d) => ({
        ...d!,
        votos: d!.votos + extra(d!.id),
      }));
  }, [apoiosIds, demandas, extra]);

  const meusMutiroes = useMemo(() => {
    return mutiroesIds
      .map((id) => mutiroes.find((m) => m.id === id))
      .filter(Boolean)
      .slice(0, 6);
  }, [mutiroesIds, mutiroes]);

  return (
    <div className="mx-auto max-w-lg p-4 md:max-w-xl md:px-6 md:pb-10 md:pt-8">
      <div className="vu-enter">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-folha-light">
          App cidadão · Teresina
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-folha">
          Eu
        </h1>
        <p className="mt-1 text-sm text-tinta-muted">
          Seus apoios e mutirões neste aparelho — continue de onde parou.
        </p>
      </div>

      <div className="vu-enter mt-6 rounded-2xl border border-folha-muted/30 bg-white p-5 shadow-soft">
        {loading ? (
          <p className="text-sm text-tinta-muted">Carregando sessão…</p>
        ) : user ? (
          <>
            <ProfileHeader
              name={displayName}
              email={user.email}
              roleLabel={ROLE_LABEL[role || 'cidadao']}
            />
            <Button
              variant="secondary"
              className="mt-5 w-full"
              onClick={() => signOut()}
            >
              Sair
            </Button>
          </>
        ) : (
          <>
            <ProfileHeader name="Convidado" roleLabel="Sem sessão" />
            <p className="mt-3 text-sm text-tinta-muted">
              Sem Supabase? Use login demo para apresentar o painel.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={() => demoLogin('cidadao')}>Demo cidadão</Button>
              <Button variant="secondary" onClick={() => demoLogin('ong')}>
                Demo ONG
              </Button>
              <Button
                variant="outline"
                onClick={() => demoLogin('prefeitura')}
              >
                Demo Prefeitura
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Login com e-mail
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      <section className="mt-8">
        <h2 className="px-0 font-display text-lg font-semibold text-folha">
          Apoios recentes
        </h2>
        {apoios.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="Nenhum apoio ainda"
            description="Apoie demandas no feed — elas aparecem aqui neste aparelho."
            actionHref="/feed"
            actionLabel="Abrir feed"
          />
        ) : (
          <div className="mt-3 -mx-4 md:-mx-6">
            <FeedRail>
              {apoios.map((d) => (
                <div key={d.id} className="snap-start">
                  <DemandaTile demanda={d} />
                </div>
              ))}
            </FeedRail>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-folha">
          Mutirões inscritos
        </h2>
        {meusMutiroes.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="Nenhuma inscrição"
            description="Participe de um mutirão na agenda."
            actionHref="/mutiroes"
            actionLabel="Ver mutirões"
          />
        ) : (
          <ul className="mt-3 space-y-2">
            {meusMutiroes.map((m) => (
              <li key={m!.id}>
                <Link
                  href={
                    m!.demandaId
                      ? `/pontos/${m!.demandaId}`
                      : `/mutiroes?destaque=${m!.id}`
                  }
                  className="flex gap-3 rounded-2xl border border-folha-muted/25 bg-white p-2.5 shadow-soft transition hover:border-folha/30"
                >
                  <MutiraoCover compact foto={m!.foto} />
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold text-tinta">
                      {m!.titulo}
                    </p>
                    <p className="text-xs text-folha">
                      {format(parseISO(m!.data), 'dd MMM', { locale: ptBR })} ·{' '}
                      {m!.horario}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-tinta-faint">
          Atalhos
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-2">
          {[
            { href: '/feed', label: 'Demandas', icon: ClipboardList },
            { href: '/mutiroes', label: 'Mutirões', icon: Users },
            { href: '/mapear', label: 'Mapa', icon: MapPin },
            { href: '/guias#semam', label: 'SEMAM', icon: Leaf },
          ].map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-2 rounded-xl border border-folha-muted/30 bg-white px-3 py-3 text-sm font-semibold text-folha shadow-soft transition hover:border-folha/30 hover:bg-sol"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {(role === 'ong' || role === 'prefeitura') && (
        <Link href="/gestao" className="mt-4 block">
          <Button className="w-full" variant="ipe">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Abrir painel de gestão
          </Button>
        </Link>
      )}
    </div>
  );
}
