'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Leaf, MapPin, ArrowUp, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Mapa } from '@/components/mapa/Mapa';
import { FeedRail } from '@/components/feed/FeedRail';
import { DemandaTile } from '@/components/feed/DemandaTile';
import { StoryStrip } from '@/components/feed/StoryStrip';
import { MutiraoCover } from '@/components/demanda/DemandaCover';
import { useMapaPontos, useDemandas } from '@/hooks/useDemandas';
import { useMutiroes } from '@/hooks/useMutiroes';
import { useEngagement } from '@/hooks/useEngagement';
import { BAIRROS_PRIORITARIOS } from '@/lib/map/terezina';
import { SEMAM } from '@/lib/data/semam';

export default function LandingPage() {
  const router = useRouter();
  const { data: pontos = [] } = useMapaPontos();
  const { data: demandas = [] } = useDemandas();
  const { data: mutiroes = [] } = useMutiroes();
  const { extra } = useEngagement();

  const destaques = useMemo(() => {
    return [...demandas]
      .filter((d) => !d.heatOnly)
      .map((d) => ({ ...d, votos: d.votos + extra(d.id) }))
      .sort((a, b) => b.votos - a.votos)
      .slice(0, 8);
  }, [demandas, extra]);

  const storyItems = useMemo(
    () =>
      BAIRROS_PRIORITARIOS.slice(0, 8).map((b) => {
        const sample = demandas.find((d) => d.bairro === b && d.foto);
        return { id: b, label: b, foto: sample?.foto };
      }),
    [demandas]
  );

  return (
    <div className="bg-sol">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Mapa
            className="h-full w-full"
            pontos={pontos}
            interactive={false}
            showControls={false}
            quiet
            heatmapIntensity={1.4}
            heatmapRadius={32}
            layers={{ demandas: true, heatmap: true, cobertura: false }}
          />
          <div
            className="hero-map-veil-x pointer-events-none absolute inset-0"
            aria-hidden
          />
          <div
            className="hero-map-veil-y pointer-events-none absolute inset-0"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-end px-6 pb-16 pt-24 sm:justify-center sm:pb-24">
          <div className="landing-panel-enter max-w-xl sm:max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-folha-light">
              Extensão · Teresina / PI · {SEMAM.sigla}
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-folha drop-shadow-sm sm:text-6xl md:text-7xl">
              Verde Urbano
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-tinta sm:text-lg">
              Mapeie terrenos baldios, vote nas prioridades do bairro e organize
              mutirões — com orientação da SEMAM.
            </p>
            <div className="mt-8">
              <Link href="/feed">
                <Button
                  size="lg"
                  className="transition hover:scale-[1.02] motion-reduce:hover:scale-100"
                >
                  <Leaf className="h-5 w-5" />
                  Abrir app cidadão
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-tinta-muted">
              Fonte:{' '}
              <a
                href={SEMAM.url}
                className="font-medium text-folha underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                teresina.pi.gov.br/semam
              </a>
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-folha-muted/25 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-semibold text-folha">
            Como funciona
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: 'Mapear',
                text: 'Registre um local com foto e GPS.',
              },
              {
                icon: ArrowUp,
                title: 'Apoiar',
                text: 'Vote nas prioridades do seu bairro.',
              },
              {
                icon: Users,
                title: 'Mutirão',
                text: 'Participe das ações coletivas na cidade.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-folha/10 text-folha">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-tinta">
                    {title}
                  </p>
                  <p className="mt-0.5 text-sm text-tinta-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {destaques.length > 0 && (
        <section className="pb-10">
          <FeedRail
            title="Demandas em destaque"
            action={
              <Link
                href="/feed"
                className="text-xs font-semibold text-folha hover:underline"
              >
                Ver feed
              </Link>
            }
          >
            {destaques.map((d) => (
              <div key={d.id} className="snap-start">
                <DemandaTile demanda={d} />
              </div>
            ))}
          </FeedRail>
        </section>
      )}

      {mutiroes.length > 0 && (
        <section className="pb-10">
          <FeedRail
            title="Próximos mutirões"
            action={
              <Link
                href="/mutiroes"
                className="text-xs font-semibold text-folha hover:underline"
              >
                Agenda
              </Link>
            }
          >
            {mutiroes.slice(0, 6).map((m) => (
              <Link
                key={m.id}
                href={m.demandaId ? `/pontos/${m.demandaId}` : '/mutiroes'}
                className="flex w-64 shrink-0 snap-start gap-3 rounded-2xl border border-folha-muted/25 bg-white p-2.5 shadow-soft transition hover:border-folha/30 sm:w-72"
              >
                <MutiraoCover compact foto={m.foto} />
                <div className="min-w-0 py-0.5">
                  <p className="line-clamp-2 font-display text-sm font-semibold text-tinta">
                    {m.titulo}
                  </p>
                  <p className="mt-1 text-xs text-tinta-muted">{m.bairro}</p>
                  <p className="mt-1 text-xs font-semibold text-folha">
                    {format(parseISO(m.data), 'dd MMM', { locale: ptBR })} ·{' '}
                    {m.horario}
                  </p>
                </div>
              </Link>
            ))}
          </FeedRail>
        </section>
      )}

      <section className="pb-14">
        <div className="mb-3 px-6 md:mx-auto md:max-w-6xl">
          <h2 className="font-display text-lg font-semibold text-folha md:text-xl">
            Explore por bairro
          </h2>
        </div>
        <StoryStrip
          className="md:mx-auto md:max-w-6xl"
          items={storyItems}
          selectedId={null}
          onSelect={(id) => {
            if (id) {
              router.push(`/feed?bairro=${encodeURIComponent(id)}`);
            } else {
              router.push('/feed');
            }
          }}
        />
      </section>

      <footer className="border-t border-folha-muted/25 px-6 py-8 text-center text-sm text-tinta-faint">
        <p>
          Verde Urbano · trabalho de extensão ·{' '}
          <Link href="/eu" className="text-folha hover:underline">
            Demo painel
          </Link>
        </p>
      </footer>
    </div>
  );
}
