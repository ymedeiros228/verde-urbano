'use client';

import { Suspense, useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ClipboardList,
  Leaf,
  LayoutDashboard,
  MapPin,
  Pencil,
  Users,
} from 'lucide-react';
import { useBairrosVerde } from '@/lib/map/verde';
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
  const { user, role, perfil, loading, signOut, demoLogin, updatePerfil } = useAuth();
  const { data: bairros = [] } = useBairrosVerde();
  const [editando, setEditando] = useState(false);
  const [nomeEd, setNomeEd] = useState('');
  const [bairroEd, setBairroEd] = useState('');
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
    perfil?.nome || user?.email?.split('@')[0]?.replace(/\./g, ' ') || 'Visitante';

  const meusPontos = useMemo(
    () =>
      demandas.filter(
        (d) => d.id.startsWith('local-') || (perfil?.nome && d.autor?.nome === perfil.nome)
      ),
    [demandas, perfil]
  );

  function abrirEdicao() {
    setNomeEd(perfil?.nome ?? displayName);
    setBairroEd(perfil?.bairro ?? '');
    setEditando(true);
  }

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeEd.trim()) return;
    await updatePerfil({ nome: nomeEd.trim(), bairro: bairroEd.trim() || undefined });
    setEditando(false);
    toast('Perfil atualizado', 'folha');
  }

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
          Seu perfil assina os pontos que você marca no mapa.
        </p>
      </div>

      <div className="vu-enter mt-6 rounded-2xl border border-folha-muted/30 bg-white p-5 shadow-soft">
        {loading ? (
          <p className="text-sm text-tinta-muted">Carregando sessão…</p>
        ) : user ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <ProfileHeader
                name={displayName}
                email={perfil?.bairro ? `Mora em ${perfil.bairro}` : user.email}
                roleLabel={ROLE_LABEL[role || 'cidadao']}
              />
              {!editando && (
                <button
                  type="button"
                  onClick={abrirEdicao}
                  className="shrink-0 rounded-xl p-2 text-tinta-faint transition hover:bg-sol hover:text-folha"
                  aria-label="Editar perfil"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>

            {editando ? (
              <form onSubmit={salvarPerfil} className="vu-fade-in mt-5 space-y-2">
                <input
                  value={nomeEd}
                  onChange={(e) => setNomeEd(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="h-11 w-full rounded-xl bg-sol px-3.5 text-sm outline-none ring-1 ring-inset ring-folha-muted/30 focus:bg-white focus:ring-folha/40"
                />
                <input
                  value={bairroEd}
                  onChange={(e) => setBairroEd(e.target.value)}
                  placeholder="Seu bairro"
                  list="bairros-eu"
                  className="h-11 w-full rounded-xl bg-sol px-3.5 text-sm outline-none ring-1 ring-inset ring-folha-muted/30 focus:bg-white focus:ring-folha/40"
                />
                <datalist id="bairros-eu">
                  {bairros.map((b) => (
                    <option key={b.bairro} value={b.bairro} />
                  ))}
                </datalist>
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditando(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Salvar
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <dl className="mt-5 grid grid-cols-3 divide-x divide-folha-muted/25 rounded-2xl bg-sol py-3 text-center">
                  {[
                    { n: meusPontos.length, l: 'pontos' },
                    { n: apoiosIds.length, l: 'apoios' },
                    { n: mutiroesIds.length, l: 'mutirões' },
                  ].map(({ n, l }) => (
                    <div key={l}>
                      <dd className="font-display text-2xl font-semibold tabular-nums text-folha">{n}</dd>
                      <dt className="text-[11px] text-tinta-muted">{l}</dt>
                    </div>
                  ))}
                </dl>
                <Button variant="ghost" className="mt-3 w-full" onClick={() => signOut()}>
                  Sair
                </Button>
              </>
            )}
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

      {user && (
        <section className="mt-8">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-lg font-semibold text-folha">Meus pontos no mapa</h2>
            <Link href="/mapear" className="text-xs font-semibold text-folha hover:underline">
              Marcar novo
            </Link>
          </div>
          {meusPontos.length === 0 ? (
            <EmptyState
              className="mt-3"
              title="Você ainda não marcou nenhum ponto"
              description="No mapa, toque em “Marcar ponto”, posicione o pino e tire a foto do local."
              actionHref="/mapear"
              actionLabel="Abrir o mapa"
            />
          ) : (
            <div className="mt-3 -mx-4 md:-mx-6">
              <FeedRail>
                {meusPontos.map((d) => (
                  <div key={d.id} className="snap-start">
                    <DemandaTile demanda={{ ...d, votos: d.votos + extra(d.id) }} />
                  </div>
                ))}
              </FeedRail>
            </div>
          )}
        </section>
      )}

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
