'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Map as MLMap } from 'maplibre-gl';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Check,
  Crosshair,
  ListOrdered,
  MapPin,
  Plus,
  Satellite,
  Search,
  Trees,
  X,
} from 'lucide-react';
import { Mapa, type FlyTarget, type MapBasemap } from '@/components/mapa/Mapa';
import { MapLegend } from '@/components/mapa/MapLegend';
import { LenteSwitch } from '@/components/mapa/LenteSwitch';
import { HexCard, type Selecao } from '@/components/mapa/HexCard';
import { BairroRanking } from '@/components/mapa/BairroRanking';
import { MarcarPontoSheet } from '@/components/mapa/MarcarPontoSheet';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { DemandaSheet } from '@/components/demanda/DemandaSheet';
import { MutiraoCover } from '@/components/demanda/DemandaCover';
import { useToast } from '@/components/ui/Toast';
import { useMapaPontos } from '@/hooks/useDemandas';
import { useMutiroes } from '@/hooks/useMutiroes';
import { useEngagement } from '@/hooks/useEngagement';
import {
  useBairrosVerde,
  useMapaVerdeMeta,
  type BairroVerde,
  type HexProps,
  type Lente,
} from '@/lib/map/verde';
import type { Demanda } from '@/lib/data/mock';
import { cn } from '@/lib/utils/cn';

export default function MapearPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <span className="vu-pulse-dot" />
        </div>
      }
    >
      <MapearPageInner />
    </Suspense>
  );
}

type Resultado =
  | { kind: 'bairro'; b: BairroVerde }
  | { kind: 'demanda'; d: Demanda };

function normalizar(s: string) {
  // remove acentos (marcas combinantes U+0300–U+036F) para a busca
  return Array.from(s.normalize('NFD'))
    .filter((c) => c.charCodeAt(0) < 768 || c.charCodeAt(0) > 879)
    .join('')
    .toLowerCase();
}

function MapearPageInner() {
  const searchParams = useSearchParams();
  const pontoParam = searchParams.get('ponto');
  const lenteParam = searchParams.get('lente');
  const bairroParam = searchParams.get('bairro');
  const { toast } = useToast();
  const { apoiar, extra } = useEngagement();
  const { data: pontos = [] } = useMapaPontos();
  const { data: mutiroes = [] } = useMutiroes();
  const { data: bairros = [] } = useBairrosVerde();

  const [lente, setLente] = useState<Lente>(
    lenteParam === 'copa' || lenteParam === 'calor' ? lenteParam : 'prioridade'
  );
  const [showAreas, setShowAreas] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [extrude, setExtrude] = useState(false);
  const [basemap, setBasemap] = useState<MapBasemap>('streets');
  const [selecao, setSelecao] = useState<Selecao | null>(null);
  const [demanda, setDemanda] = useState<Demanda | null>(null);
  const [focusPontoId, setFocusPontoId] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [rankingOpen, setRankingOpen] = useState(false);
  const [aba, setAba] = useState<'bairros' | 'mutiroes'>('bairros');
  const [q, setQ] = useState('');
  const [buscaAberta, setBuscaAberta] = useState(false);
  const buscaRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  // Modo "marcar ponto": pino fixo no centro, o mapa desliza por baixo
  const mapInst = useRef<MLMap | null>(null);
  const [marcando, setMarcando] = useState(false);
  const [movendo, setMovendo] = useState(false);
  const [aqui, setAqui] = useState<HexProps | null>(null);
  const [alvo, setAlvo] = useState<{ lngLat: [number, number]; hex: HexProps | null } | null>(null);

  useEffect(() => {
    const map = mapInst.current;
    if (!map || !marcando) return;
    const lerCentro = () => {
      const c = map.project(map.getCenter());
      const layers = ['vu-hex-fill', 'vu-hex-3d'].filter((l) => map.getLayer(l));
      const f = map.queryRenderedFeatures(c, { layers })[0];
      setAqui((f?.properties as HexProps) ?? null);
      setMovendo(false);
    };
    const inicio = () => setMovendo(true);
    map.on('movestart', inicio);
    map.on('moveend', lerCentro);
    lerCentro();
    return () => {
      map.off('movestart', inicio);
      map.off('moveend', lerCentro);
    };
  }, [marcando]);

  function iniciarMarcacao(lngLat?: [number, number]) {
    setSelecao(null);
    setMarcando(true);
    const map = mapInst.current;
    if (map) map.flyTo({ center: lngLat ?? map.getCenter(), zoom: Math.max(map.getZoom(), 16), speed: 1.2 });
  }

  function usarMinhaLocalizacao() {
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        mapInst.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 17, speed: 1.3 }),
      () => toast('Não consegui sua localização — arraste o mapa até o local.', 'ipe'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function confirmarLocal() {
    const map = mapInst.current;
    if (!map) return;
    const c = map.getCenter();
    setAlvo({ lngLat: [c.lng, c.lat], hex: aqui });
  }

  useEffect(() => {
    if (!pontoParam) return;
    const p = pontos.find((x) => x.id === pontoParam);
    if (p) {
      setDemanda(p);
      setFocusPontoId(p.id);
    }
  }, [pontoParam, pontos]);

  useEffect(() => {
    if (!bairroParam) return;
    const b = bairros.find((x) => x.bairro === bairroParam);
    if (b) setFlyTarget({ center: b.centro, zoom: 14.2, key: `url-${b.bairro}` });
  }, [bairroParam, bairros]);

  // fecha a lista de busca ao clicar fora
  useEffect(() => {
    function onDown(e: PointerEvent) {
      if (!buscaRef.current?.contains(e.target as Node)) setBuscaAberta(false);
    }
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  const resultados = useMemo<Resultado[]>(() => {
    const term = normalizar(q.trim());
    if (term.length < 2) return [];
    const bs: Resultado[] = bairros
      .filter((b) => normalizar(b.bairro).includes(term))
      .slice(0, 5)
      .map((b) => ({ kind: 'bairro', b }));
    const ds: Resultado[] = pontos
      .filter((d) => normalizar(`${d.titulo} ${d.bairro} ${d.local}`).includes(term))
      .slice(0, 4)
      .map((d) => ({ kind: 'demanda', d }));
    return [...bs, ...ds];
  }, [q, bairros, pontos]);

  function irParaBairro(b: BairroVerde) {
    setFlyTarget({ center: b.centro, zoom: 14.2, key: `${b.bairro}-${Date.now()}` });
    setRankingOpen(false);
    setSelecao(null);
  }

  function escolher(r: Resultado) {
    setBuscaAberta(false);
    setQ(r.kind === 'bairro' ? r.b.bairro : r.d.titulo);
    if (r.kind === 'bairro') irParaBairro(r.b);
    else {
      setDemanda(r.d);
      setFocusPontoId(r.d.id);
    }
  }

  const votos = demanda ? demanda.votos + extra(demanda.id) : 0;

  return (
    <div className="relative -mb-20 md:mb-0">
      <div className="relative flex h-[calc(100dvh-var(--cidadao-nav-h)-env(safe-area-inset-bottom))] md:h-[calc(100dvh-4rem)]">
        <div className="relative min-h-0 flex-1">
          <Mapa
            className="h-full w-full"
            pontos={pontos}
            showPins={showPins}
            lente={lente}
            showAreas={showAreas}
            extrude={extrude && !marcando}
            dim={marcando}
            basemap={basemap}
            initialPitch={0}
            selectedHex={selecao?.kind === 'hex' ? selecao.hex.h3 : null}
            focusPontoId={focusPontoId}
            flyTarget={flyTarget}
            onReady={(m) => {
              mapInst.current = m;
            }}
            onSelectHex={(hex, lngLat) => {
              if (!marcando) setSelecao(hex ? { kind: 'hex', hex, lngLat } : null);
            }}
            onSelectArea={(area) => {
              if (!marcando) setSelecao({ kind: 'area', area });
            }}
            onSelectPonto={(id) => {
              if (marcando) return;
              const p = pontos.find((x) => x.id === id);
              if (p) {
                setDemanda(p);
                setFocusPontoId(p.id);
              }
            }}
          />

          {/* Painel de controle */}
          <div
            className={cn(
              'absolute inset-x-2.5 top-2.5 z-20 transition-all duration-300 md:inset-x-auto md:left-4 md:top-4 md:w-[24rem]',
              marcando && 'pointer-events-none -translate-y-4 opacity-0'
            )}
          >
            <div className="vu-glass vu-enter rounded-3xl p-2.5 md:p-3">
              <div className="flex items-center gap-2 px-1">
                <div className="min-w-0 flex-1">
                  <p className="hidden text-[10.5px] font-semibold uppercase tracking-[0.16em] text-folha-light md:block">
                    Teresina · dados de satélite
                  </p>
                  <h1 className="truncate font-display text-base font-semibold text-tinta md:text-lg">
                    Onde falta sombra
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => setRankingOpen(true)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-folha px-3 text-xs font-semibold text-white shadow-soft transition active:scale-95 md:hidden"
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                  Ranking
                </button>
              </div>

              <div ref={buscaRef} className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-faint" />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setBuscaAberta(true);
                  }}
                  onFocus={() => setBuscaAberta(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && resultados[0]) escolher(resultados[0]);
                    if (e.key === 'Escape') setBuscaAberta(false);
                  }}
                  placeholder="Buscar bairro ou pedido…"
                  aria-label="Buscar no mapa"
                  className="h-10 w-full rounded-2xl bg-sol pl-9 pr-9 text-sm text-tinta outline-none ring-1 ring-inset ring-folha-muted/25 transition placeholder:text-tinta-faint focus:bg-white focus:ring-folha/40"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-tinta-faint hover:text-tinta"
                    aria-label="Limpar busca"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {buscaAberta && resultados.length > 0 && (
                  <ul className="vu-fade-in absolute inset-x-0 top-12 z-30 max-h-72 overflow-y-auto rounded-2xl border border-folha-muted/25 bg-white p-1.5 shadow-[0_16px_40px_rgba(28,43,34,0.16)]">
                    {resultados.map((r) => (
                      <li key={r.kind === 'bairro' ? `b-${r.b.bairro}` : `d-${r.d.id}`}>
                        <button
                          type="button"
                          onClick={() => escolher(r)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-sol"
                        >
                          {r.kind === 'bairro' ? (
                            <>
                              <Trees className="h-4 w-4 shrink-0 text-folha-light" />
                              <span className="flex-1 truncate font-medium text-tinta">{r.b.bairro}</span>
                              <span className="text-[11px] tabular-nums text-tinta-faint">{r.b.copa}% copa</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 shrink-0 text-laterita" />
                              <span className="flex-1 truncate text-tinta">{r.d.titulo}</span>
                            </>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <LenteSwitch value={lente} onChange={setLente} className="mt-2" />

              <div className="mt-2 grid grid-cols-4 gap-1.5">
                <Toggle on={showAreas} onClick={() => setShowAreas((v) => !v)} icon={Trees}>
                  Parques
                </Toggle>
                <Toggle on={showPins} onClick={() => setShowPins((v) => !v)} icon={MapPin}>
                  Pedidos
                </Toggle>
                <Toggle
                  on={basemap === 'satellite'}
                  onClick={() => setBasemap((b) => (b === 'satellite' ? 'streets' : 'satellite'))}
                  icon={Satellite}
                >
                  Satélite
                </Toggle>
                <Toggle on={extrude} onClick={() => setExtrude((v) => !v)} icon={Box}>
                  3D
                </Toggle>
              </div>
            </div>
          </div>

          {/* Card da seleção: embaixo no celular, à direita no desktop */}
          {selecao && (
            <div className="absolute inset-x-2.5 bottom-3 z-30 md:inset-x-auto md:bottom-auto md:right-4 md:top-4 md:w-[20rem]">
              <HexCard
                key={selecao.kind === 'hex' ? selecao.hex.h3 : selecao.area.id}
                selecao={selecao}
                onClose={() => setSelecao(null)}
                onMarcar={iniciarMarcacao}
              />
            </div>
          )}

          {/* Legenda */}
          <div
            className={cn(
              'pointer-events-none absolute bottom-3 left-2.5 z-10 w-[min(16rem,calc(100%-6rem))] transition-opacity duration-300 md:bottom-4 md:left-4 md:w-[17rem]',
              selecao && 'opacity-0 md:opacity-100',
              marcando && 'opacity-0 md:opacity-0'
            )}
          >
            <MapLegend
              lente={lente}
              showAreas={showAreas}
              showPins={showPins}
              className="pointer-events-auto"
              compact
            />
          </div>

          <button
            type="button"
            onClick={() => iniciarMarcacao()}
            className={cn(
              'absolute bottom-3 right-3 z-20 inline-flex h-12 items-center gap-2 rounded-full bg-folha pl-4 pr-5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(26,92,58,0.35)] transition hover:bg-folha-light active:scale-95 md:bottom-4 md:right-4',
              (selecao || marcando) && 'pointer-events-none translate-y-4 opacity-0',
              selecao && !marcando && 'md:pointer-events-auto md:translate-y-0 md:opacity-100'
            )}
          >
            <Plus className="h-5 w-5" />
            Marcar ponto
          </button>

          {marcando && (
            <>
              {/* pino fixo no centro */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-full">
                <div className={cn('transition-transform duration-200', movendo ? '-translate-y-3' : 'translate-y-0')}>
                  <svg width="44" height="56" viewBox="0 0 44 56" aria-hidden className="drop-shadow-[0_8px_10px_rgba(28,43,34,0.35)]">
                    <path d="M22 55s18-17.2 18-32A18 18 0 1 0 4 23c0 14.8 18 32 18 32z" fill="#1A5C3A" stroke="#fff" strokeWidth="3" />
                    <circle cx="22" cy="22" r="7" fill="#E8B84A" />
                  </svg>
                </div>
              </div>
              <span
                className={cn(
                  'pointer-events-none absolute left-1/2 top-1/2 z-30 block h-1.5 -translate-x-1/2 rounded-full bg-tinta/30 blur-[1px] transition-all duration-200',
                  movendo ? 'w-3 opacity-50' : 'w-5 opacity-100'
                )}
              />

              <div className="vu-card-in vu-glass absolute inset-x-2.5 top-2.5 z-30 rounded-2xl px-4 py-3 md:left-1/2 md:right-auto md:w-[26rem] md:-translate-x-1/2">
                <p className="font-display text-base font-semibold text-tinta">Arraste o mapa até o local</p>
                <p className="mt-0.5 text-xs text-tinta-muted">
                  {aqui
                    ? `${aqui.bairro ?? 'Teresina'} · ${aqui.copa.toLocaleString('pt-BR')}% de copa${aqui.temp != null ? ` · chão a ${aqui.temp.toLocaleString('pt-BR')} °C` : ''}`
                    : 'O pino marca o ponto exato onde você vai tirar a foto.'}
                </p>
              </div>

              <div className="vu-card-in absolute inset-x-2.5 bottom-3 z-30 flex gap-2 md:left-1/2 md:right-auto md:w-[26rem] md:-translate-x-1/2">
                <button
                  type="button"
                  onClick={() => setMarcando(false)}
                  className="vu-glass inline-flex h-12 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-tinta-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={usarMinhaLocalizacao}
                  className="vu-glass inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-folha"
                  aria-label="Usar minha localização"
                >
                  <Crosshair className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={confirmarLocal}
                  disabled={movendo}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-folha text-sm font-semibold text-white shadow-[0_10px_24px_rgba(26,92,58,0.35)] transition active:scale-[0.98] disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  Confirmar local
                </button>
              </div>
            </>
          )}
        </div>

        {/* Lateral desktop */}
        <aside className="hidden w-[23rem] shrink-0 flex-col border-l border-folha-muted/25 bg-white md:flex">
          <ResumoCidade />
          <div className="px-4">
            <div className="flex gap-4 border-b border-folha-muted/25 text-sm font-semibold">
              {(
                [
                  ['bairros', 'Bairros'],
                  ['mutiroes', 'Mutirões'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAba(id)}
                  className={cn(
                    'relative -mb-px py-2.5 transition',
                    aba === id ? 'text-folha' : 'text-tinta-faint hover:text-tinta'
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      'absolute inset-x-0 bottom-0 h-0.5 origin-left rounded-full bg-folha transition-transform duration-300',
                      aba === id ? 'scale-x-100' : 'scale-x-0'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pt-3">
            {aba === 'bairros' ? (
              <BairroRanking onSelect={irParaBairro} limit={15} />
            ) : (
              <div className="space-y-2">
                {mutiroes.map((m, i) => (
                  <Link
                    key={m.id}
                    href={m.demandaId ? `/mapear?ponto=${m.demandaId}` : '/mutiroes'}
                    className="vu-stagger flex gap-3 rounded-2xl p-2 transition hover:bg-sol"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <MutiraoCover compact foto={m.foto} />
                    <div className="min-w-0 py-0.5">
                      <p className="truncate text-sm font-semibold text-tinta">{m.titulo}</p>
                      <p className="text-xs text-tinta-muted">{m.bairro}</p>
                      <p className="mt-1 text-xs font-semibold text-folha">
                        {format(parseISO(m.data), "dd 'de' MMM", { locale: ptBR })} · {m.horario}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <BottomSheet open={rankingOpen} onClose={() => setRankingOpen(false)} title="Bairros de Teresina">
        <BairroRanking onSelect={irParaBairro} limit={20} />
      </BottomSheet>

      <MarcarPontoSheet
        open={Boolean(alvo)}
        onClose={() => setAlvo(null)}
        lngLat={alvo?.lngLat ?? null}
        hex={alvo?.hex ?? null}
        onSaved={(d) => {
          setAlvo(null);
          setMarcando(false);
          void qc.invalidateQueries({ queryKey: ['mapa-pontos'] });
          void qc.invalidateQueries({ queryKey: ['demandas'] });
          toast('Ponto publicado no mapa. Obrigado!', 'folha');
          setShowPins(true);
          setFocusPontoId(d.id);
          setDemanda(d);
        }}
      />

      <DemandaSheet
        demanda={demanda}
        open={Boolean(demanda)}
        onClose={() => {
          setDemanda(null);
          setFocusPontoId(null);
        }}
        votos={votos}
        showApoiar
        onApoiar={() => {
          if (!demanda) return;
          apoiar(demanda.id);
          toast('Apoio registrado — obrigado!', 'folha');
        }}
      />
    </div>
  );
}

function Toggle({
  on,
  onClick,
  icon: Icon,
  children,
}: {
  on: boolean;
  onClick: () => void;
  icon: typeof Trees;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'inline-flex h-8 min-w-0 items-center justify-center gap-1 rounded-full px-2 text-[11.5px] font-semibold transition active:scale-95',
        on
          ? 'bg-folha/10 text-folha ring-1 ring-inset ring-folha/25'
          : 'text-tinta-muted ring-1 ring-inset ring-folha-muted/30 hover:text-tinta'
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  );
}

function ResumoCidade() {
  const { data: meta } = useMapaVerdeMeta();
  const t = meta?.totais;
  return (
    <div className="border-b border-folha-muted/25 p-4">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-folha-light">
        Retrato da área urbana
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <Stat valor={t ? `${t.copa_urbana_media.toLocaleString('pt-BR')}%` : '—'} label="copa média" />
        <Stat
          valor={t?.temp_urbana_media != null ? `${Math.round(t.temp_urbana_media)}°C` : '—'}
          label="chão na seca"
        />
        <Stat valor={t ? String(t.criticos) : '—'} label="quadras sem sombra" />
      </div>
    </div>
  );
}

function Stat({ valor, label }: { valor: string; label: string }) {
  return (
    <div className="rounded-2xl bg-sol px-2.5 py-2">
      <p className="font-display text-xl font-semibold tabular-nums leading-none text-tinta">{valor}</p>
      <p className="mt-1 text-[10.5px] leading-tight text-tinta-muted">{label}</p>
    </div>
  );
}
