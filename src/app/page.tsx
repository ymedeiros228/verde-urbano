'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, MapPin, Target, Thermometer, Trees, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mapa } from '@/components/mapa/Mapa';
import { FeedRail } from '@/components/feed/FeedRail';
import { DemandaTile } from '@/components/feed/DemandaTile';
import { StoryStrip } from '@/components/feed/StoryStrip';
import { MutiraoCover } from '@/components/demanda/DemandaCover';
import { useDemandas } from '@/hooks/useDemandas';
import { useMutiroes } from '@/hooks/useMutiroes';
import { useEngagement } from '@/hooks/useEngagement';
import { BAIRROS_PRIORITARIOS } from '@/lib/map/terezina';
import {
  ESCALAS,
  gradienteCSS,
  nivelPrioridade,
  useBairrosVerde,
  useMapaVerdeMeta,
  type Lente,
} from '@/lib/map/verde';

/** Número que conta até o valor quando entra na tela */
function Contador({ valor, casas = 0, sufixo = '' }: { valor: number; casas?: number; sufixo?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(valor);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min((t - t0) / 1400, 1);
        setV(valor * (1 - Math.pow(1 - p, 4)));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor]);
  return (
    <span ref={ref} className="tabular-nums">
      {v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}
      {sufixo}
    </span>
  );
}

const LENTES: { id: Lente; icon: typeof Target; texto: string }[] = [
  {
    id: 'prioridade',
    icon: Target,
    texto: 'Cruza falta de copa, calor do chão e densidade de casas para apontar onde uma árvore faz mais diferença.',
  },
  {
    id: 'copa',
    icon: Trees,
    texto: 'Quanto de cada quadra está debaixo de árvore, medido por satélite com 10 m de resolução.',
  },
  {
    id: 'calor',
    icon: Thermometer,
    texto: 'A temperatura do chão nas tardes de seca. Onde falta sombra, o asfalto passa dos 48 °C.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { data: demandas = [] } = useDemandas();
  const { data: mutiroes = [] } = useMutiroes();
  const { data: meta } = useMapaVerdeMeta();
  const { data: bairros = [] } = useBairrosVerde();
  const { extra } = useEngagement();

  const destaques = useMemo(
    () =>
      [...demandas]
        .map((d) => ({ ...d, votos: d.votos + extra(d.id) }))
        .sort((a, b) => b.votos - a.votos)
        .slice(0, 8),
    [demandas, extra]
  );

  const criticos = useMemo(
    () => bairros.filter((b) => b.hexagonos >= 6).sort((a, b) => b.prioridade - a.prioridade).slice(0, 6),
    [bairros]
  );
  const verdes = useMemo(
    () => bairros.filter((b) => b.hexagonos >= 6).sort((a, b) => b.copa - a.copa).slice(0, 3),
    [bairros]
  );

  const storyItems = useMemo(
    () =>
      BAIRROS_PRIORITARIOS.filter((b) => demandas.some((d) => d.bairro === b)).map((b) => {
        const sample = demandas.find((d) => d.bairro === b && d.foto);
        return { id: b, label: b, foto: sample?.foto };
      }),
    [demandas]
  );

  const t = meta?.totais;

  return (
    <div className="bg-sol">
      {/* HERO ------------------------------------------------------------ */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[58svh] md:inset-0 md:h-auto">
          <Mapa
            className="vu-no-attrib h-full w-full"
            interactive={false}
            showControls={false}
            quiet
            lente="prioridade"
            showAreas={false}
            showPins={false}
            extrude
            ambient
            heroFrame
            initialZoom={11.7}
            initialPitch={55}
          />
          <div className="hero-map-veil-x pointer-events-none absolute inset-0" aria-hidden />
          <div className="hero-map-veil-y pointer-events-none absolute inset-0" aria-hidden />
        </div>

        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-10 pt-[46svh] sm:px-6 md:justify-center md:pb-24 md:pt-24 [&_a]:pointer-events-auto">
          <div className="max-w-xl">
            <p className="vu-hero-in text-[11px] font-semibold uppercase tracking-[0.22em] text-folha-light" style={{ animationDelay: '80ms' }}>
              Verde Urbano · Teresina / PI
            </p>
            <h1
              className="vu-hero-in mt-3 font-display text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-tinta sm:text-6xl md:text-7xl"
              style={{ animationDelay: '160ms' }}
            >
              Teresina precisa de <span className="text-folha">sombra</span>.
            </h1>
            <p
              className="vu-hero-in mt-5 max-w-md text-base leading-relaxed text-tinta-muted sm:text-lg"
              style={{ animationDelay: '260ms' }}
            >
              Medimos cada quadra da cidade por satélite: onde tem árvore, onde o chão ferve e onde
              plantar primeiro. Agora a gente transforma isso em mutirão.
            </p>
            <div className="vu-hero-in mt-7 flex flex-wrap gap-3" style={{ animationDelay: '360ms' }}>
              <Link
                href="/mapear"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-folha pl-5 pr-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(26,92,58,0.35)] transition hover:bg-folha-light active:scale-[0.98]"
              >
                Explorar o mapa
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/feed"
                className="inline-flex h-12 items-center rounded-full bg-white/85 px-5 text-sm font-semibold text-tinta ring-1 ring-inset ring-folha-muted/40 backdrop-blur transition hover:bg-white active:scale-[0.98]"
              >
                Pedidos dos bairros
              </Link>
            </div>

            {t && (
              <dl className="vu-hero-in mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-tinta/10 pt-5" style={{ animationDelay: '480ms' }}>
                <div>
                  <dt className="text-[11px] leading-tight text-tinta-muted">copa média urbana</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-folha sm:text-3xl">
                    <Contador valor={t.copa_urbana_media} casas={1} sufixo="%" />
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] leading-tight text-tinta-muted">chão na seca</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-laterita sm:text-3xl">
                    <Contador valor={t.temp_urbana_media ?? 0} sufixo=" °C" />
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] leading-tight text-tinta-muted">quadras sem sombra</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-tinta sm:text-3xl">
                    <Contador valor={t.criticos} />
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* LENTES ---------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-folha-light">Três jeitos de ler a cidade</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight text-tinta md:text-4xl">
          Dados reais, não achismo. Cada hexágono é uma quadra de Teresina.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {LENTES.map(({ id, icon: Icon, texto }) => (
            <Link
              key={id}
              href={`/mapear?lente=${id}`}
              className="group relative overflow-hidden rounded-3xl border border-folha-muted/25 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(28,43,34,0.18)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sol text-folha">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <ArrowRight className="h-4 w-4 text-tinta-faint transition group-hover:translate-x-0.5 group-hover:text-folha" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-tinta">{ESCALAS[id].titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-tinta-muted">{texto}</p>
              <div className="mt-5 h-2 rounded-full" style={{ background: gradienteCSS(id) }} />
              <div className="mt-1 flex justify-between text-[10.5px] font-medium text-tinta-faint">
                <span>{ESCALAS[id].rotulos[0]}</span>
                <span>{ESCALAS[id].rotulos[1]}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* RANKING --------------------------------------------------------- */}
      {criticos.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-laterita">Onde plantar primeiro</p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-tinta md:text-4xl">
                Os bairros que mais precisam de árvore
              </h2>
              <ol className="mt-8 space-y-2">
                {criticos.map((b, i) => {
                  const nivel = nivelPrioridade(b.prioridade);
                  return (
                    <li key={b.bairro}>
                      <Link
                        href={`/mapear?bairro=${encodeURIComponent(b.bairro)}`}
                        className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-sol"
                      >
                        <span className="font-display text-2xl font-semibold tabular-nums text-tinta-faint/70">{i + 1}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-tinta group-hover:text-folha">{b.bairro}</span>
                          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-sol">
                            <span className="block h-full rounded-full" style={{ width: `${b.prioridade}%`, background: nivel.tom }} />
                          </span>
                        </span>
                        <span className="text-right text-xs tabular-nums text-tinta-muted">
                          <span className="block font-semibold text-tinta">{b.copa.toLocaleString('pt-BR')}% copa</span>
                          {b.temp != null && <span>{b.temp.toLocaleString('pt-BR')} °C</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="self-end rounded-3xl bg-folha p-6 text-white md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-folha-muted">Para comparar</p>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">Onde a sombra já existe</h3>
              <ul className="mt-6 space-y-4">
                {verdes.map((b) => (
                  <li key={b.bairro} className="flex items-baseline justify-between gap-3 border-b border-white/15 pb-3">
                    <span className="font-medium">{b.bairro}</span>
                    <span className="font-display text-xl font-semibold tabular-nums text-ipe-soft">
                      {b.copa.toLocaleString('pt-BR')}%
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm leading-relaxed text-white/75">
                Em bairros com mais copa, o chão fica até 6 °C mais fresco na seca. Árvore é
                infraestrutura.
              </p>
              <Link
                href="/mapear?lente=copa"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ipe-soft hover:underline"
              >
                Ver no mapa <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* COMO FUNCIONA --------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20">
        <h2 className="font-display text-3xl font-semibold text-tinta">Do mapa ao mutirão</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: MapPin, title: 'Mapeie', text: 'Viu um terreno sem sombra? Registre com foto e GPS em 1 minuto.' },
            { icon: ArrowUp, title: 'Apoie', text: 'Os pedidos com mais apoio sobem na fila da SEMAM e da ONG parceira.' },
            { icon: Users, title: 'Plante junto', text: 'Mutirões com mudas nativas dos viveiros municipais.' },
          ].map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-3xl border border-folha-muted/25 bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-folha text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-display text-sm font-semibold text-tinta-faint">0{i + 1}</span>
              </div>
              <p className="mt-4 font-display text-xl font-semibold text-tinta">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-tinta-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {destaques.length > 0 && (
        <section className="pb-12">
          <FeedRail
            className="md:mx-auto md:max-w-6xl"
            title="Pedidos em destaque"
            action={
              <Link href="/feed" className="text-xs font-semibold text-folha hover:underline">
                Ver todos
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
        <section className="pb-12">
          <FeedRail
            className="md:mx-auto md:max-w-6xl"
            title="Próximos mutirões"
            action={
              <Link href="/mutiroes" className="text-xs font-semibold text-folha hover:underline">
                Agenda
              </Link>
            }
          >
            {mutiroes.slice(0, 6).map((m) => (
              <Link
                key={m.id}
                href={m.demandaId ? `/pontos/${m.demandaId}` : '/mutiroes'}
                className="flex w-64 shrink-0 snap-start gap-3 rounded-2xl border border-folha-muted/25 bg-white p-2.5 transition hover:-translate-y-0.5 hover:border-folha/30 sm:w-72"
              >
                <MutiraoCover compact foto={m.foto} />
                <div className="min-w-0 py-0.5">
                  <p className="line-clamp-2 font-display text-sm font-semibold text-tinta">{m.titulo}</p>
                  <p className="mt-1 text-xs text-tinta-muted">{m.bairro}</p>
                  <p className="mt-1 text-xs font-semibold text-folha">
                    {format(parseISO(m.data), "dd 'de' MMM", { locale: ptBR })} · {m.horario}
                  </p>
                </div>
              </Link>
            ))}
          </FeedRail>
        </section>
      )}

      {storyItems.length > 0 && (
        <section className="pb-16">
          <div className="mb-3 px-4 md:mx-auto md:max-w-6xl md:px-6">
            <h2 className="font-display text-lg font-semibold text-folha md:text-xl">Explore por bairro</h2>
          </div>
          <StoryStrip
            className="md:mx-auto md:max-w-6xl"
            items={storyItems}
            selectedId={null}
            onSelect={(id) => router.push(id ? `/feed?bairro=${encodeURIComponent(id)}` : '/feed')}
          />
        </section>
      )}

      <footer className="border-t border-folha-muted/25 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-tinta-muted md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-folha">Verde Urbano</p>
            <p className="mt-1">Trabalho de extensão · Teresina/PI</p>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-tinta-faint">
            Dados: ESA WorldCover 2021 (CC BY 4.0) · Landsat 8/9, USGS via Microsoft Planetary
            Computer · Mapa base: OpenFreeMap, © OpenMapTiles, © OpenStreetMap contributors · Conteúdo institucional: SEMAM/Prefeitura de
            Teresina.{' '}
            <Link href="/gestao" className="text-folha hover:underline">
              Painel de gestão
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
