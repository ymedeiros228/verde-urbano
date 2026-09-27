'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, {
  type ExpressionSpecification,
  type Map,
  type MapGeoJSONFeature,
  type MapMouseEvent,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  POSITRON_STYLE,
  SATELLITE_STYLE,
  TERESINA_BOUNDS,
  TERESINA_CENTER,
  TIPOS_PONTO,
} from '@/lib/map/terezina';
import {
  AREAS_URL,
  CLASSE_LABEL,
  HEX_URL,
  corExpr,
  corHex,
  type AreaVerdeProps,
  type HexProps,
  type Lente,
} from '@/lib/map/verde';
import type { Demanda } from '@/lib/data/mock';
import { cn } from '@/lib/utils/cn';

export type MapFilter = 'todos' | 'arvores' | 'pracas' | 'terrenos' | 'mutiroes';
export type MapBasemap = 'streets' | 'satellite';

export interface FlyTarget {
  center: [number, number];
  zoom?: number;
  /** muda a cada pedido, para repetir o mesmo destino */
  key: string | number;
}

interface MapaProps {
  className?: string;
  interactive?: boolean;
  showControls?: boolean;
  quiet?: boolean;
  /** Demandas comunitárias (pins) */
  pontos?: Demanda[];
  filter?: MapFilter;
  showPins?: boolean;
  /** Lente dos hexágonos reais; null = sem camada */
  lente?: Lente | null;
  /** Parques, praças e bosques do OpenStreetMap */
  showAreas?: boolean;
  /** Hexágonos em 3D (altura = valor da lente) */
  extrude?: boolean;
  /** Esmaece os hexágonos (ex.: para posicionar um pino vendo a rua) */
  dim?: boolean;
  /** Câmera girando devagar (hero) */
  ambient?: boolean;
  /** Reserva espaço para texto sobreposto: cidade à direita (desktop) ou em cima (celular) */
  heroFrame?: boolean;
  basemap?: MapBasemap;
  initialZoom?: number;
  initialPitch?: number;
  onSelectPonto?: (id: string) => void;
  onSelectHex?: (hex: HexProps | null, lngLat?: [number, number]) => void;
  onSelectArea?: (area: AreaVerdeProps) => void;
  selectedHex?: string | null;
  focusPontoId?: string | null;
  flyTarget?: FlyTarget | null;
  controlsPosition?: 'top-right' | 'bottom-right';
  onReady?: (map: Map) => void;
}

export function matchesMapFilter(d: Demanda, filter: MapFilter): boolean {
  if (filter === 'todos') return true;
  if (filter === 'terrenos') return d.tipo === 'terreno_baldio';
  if (filter === 'pracas') return d.tipo === 'praca' || d.tipo === 'lazer_infantil';
  if (filter === 'arvores') return d.tipo === 'canteiro' || d.badgeTone === 'ipe';
  if (filter === 'mutiroes') return d.step === 'mutirao' || Boolean(d.mutiraoData);
  return true;
}

const HEX_SRC = 'vu-hex';
const HEX_FILL = 'vu-hex-fill';
const HEX_3D = 'vu-hex-3d';
const HEX_LINE = 'vu-hex-line';
const HEX_HL = 'vu-hex-hl';
const AREAS_SRC = 'vu-areas';
const AREAS_FILL = 'vu-areas-fill';
const AREAS_LINE = 'vu-areas-line';
const AREAS_LABEL = 'vu-areas-label';
const PINS_SRC = 'vu-pins';
const PINS_HALO = 'vu-pins-halo';
const PINS_LAYER = 'vu-pins-dot';

/** Troca de lente: some (fade) → troca a cor → volta. Cor por expressão não anima sozinha. */
const FADE = { duration: 260, delay: 0 };

function alturaExpr(lente: Lente): ExpressionSpecification {
  if (lente === 'copa') return ['*', ['get', 'copa'], 22];
  if (lente === 'calor')
    return ['*', ['max', 0, ['-', ['coalesce', ['get', 'temp'], 41], 41]], 130];
  return ['*', ['case', ['get', 'urbano'], ['get', 'prioridade'], 0], 11];
}

function pinsData(pontos: Demanda[], filter: MapFilter, focus: string | null) {
  return {
    type: 'FeatureCollection' as const,
    features: pontos
      .filter((p) => !p.heatOnly && matchesMapFilter(p, filter))
      .map((p) => ({
        type: 'Feature' as const,
        properties: {
          id: p.id,
          selected: focus === p.id ? 1 : 0,
          urgente: p.urgencia > 80 ? 1 : 0,
          color: TIPOS_PONTO[p.tipo].color,
        },
        geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      })),
  };
}

/** Primeira camada de texto do estilo: nossas camadas ficam por baixo dos rótulos */
function firstSymbolId(map: Map): string | undefined {
  return map.getStyle().layers?.find((l) => l.type === 'symbol')?.id;
}

function hexOpacity(satellite: boolean, dim = false) {
  if (dim) return 0.22;
  return satellite ? 0.5 : 0.74;
}

function addLayers(map: Map, satellite: boolean, lenteRef: { current: Lente | null }) {
  const before = firstSymbolId(map);

  if (!map.getSource(HEX_SRC)) {
    map.addSource(HEX_SRC, { type: 'geojson', data: HEX_URL, promoteId: 'h3' });
  }
  if (!map.getSource(AREAS_SRC)) {
    map.addSource(AREAS_SRC, { type: 'geojson', data: AREAS_URL, promoteId: 'id' });
  }
  if (!map.getSource(PINS_SRC)) {
    map.addSource(PINS_SRC, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
  }

  if (!map.getLayer(HEX_FILL)) {
    map.addLayer(
      {
        id: HEX_FILL,
        type: 'fill',
        source: HEX_SRC,
        paint: {
          'fill-color': corExpr(lenteRef.current ?? 'prioridade'),
          'fill-opacity': hexOpacity(satellite),
        },
      },
      before
    );
  }
  if (!map.getLayer(HEX_3D)) {
    map.addLayer(
      {
        id: HEX_3D,
        type: 'fill-extrusion',
        source: HEX_SRC,
        layout: { visibility: 'none' },
        paint: {
          'fill-extrusion-color': corExpr(lenteRef.current ?? 'prioridade'),
          'fill-extrusion-height': alturaExpr(lenteRef.current ?? 'prioridade'),
          'fill-extrusion-opacity': 0.88,
          'fill-extrusion-vertical-gradient': true,
        },
      },
      before
    );
  }
  if (!map.getLayer(HEX_LINE)) {
    map.addLayer(
      {
        id: HEX_LINE,
        type: 'line',
        source: HEX_SRC,
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0, 13, 0.5, 16, 1.2],
          'line-opacity': satellite ? 0.35 : 0.75,
        },
      },
      before
    );
  }
  if (!map.getLayer(HEX_HL)) {
    map.addLayer(
      {
        id: HEX_HL,
        type: 'line',
        source: HEX_SRC,
        paint: {
          'line-color': '#1C2B22',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            3,
            2,
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            1,
            ['boolean', ['feature-state', 'hover'], false],
            0.75,
            0,
          ],
        },
      },
      before
    );
  }

  if (!map.getLayer(AREAS_FILL)) {
    map.addLayer(
      {
        id: AREAS_FILL,
        type: 'fill',
        source: AREAS_SRC,
        minzoom: 11,
        paint: {
          'fill-color': '#2D8A58',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.55,
            0.28,
          ],
        },
      },
      before
    );
  }
  if (!map.getLayer(AREAS_LINE)) {
    map.addLayer(
      {
        id: AREAS_LINE,
        type: 'line',
        source: AREAS_SRC,
        minzoom: 11,
        paint: {
          'line-color': satellite ? '#B8F0C8' : '#1A5C3A',
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.4, 15, 1.4],
          'line-opacity': 0.8,
        },
      },
      before
    );
  }
  if (!map.getLayer(AREAS_LABEL)) {
    map.addLayer({
      id: AREAS_LABEL,
      type: 'symbol',
      source: AREAS_SRC,
      minzoom: 13.5,
      filter: ['has', 'nome'],
      layout: {
        'text-field': ['get', 'nome'],
        'text-font': ['Noto Sans Italic'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 13.5, 10.5, 17, 13],
        'text-max-width': 9,
        'symbol-placement': 'point',
      },
      paint: {
        'text-color': satellite ? '#E9FBEF' : '#1A5C3A',
        'text-halo-color': satellite ? 'rgba(10,30,18,0.8)' : 'rgba(255,255,255,0.92)',
        'text-halo-width': 1.4,
      },
    });
  }

  if (!map.getLayer(PINS_HALO)) {
    map.addLayer({
      id: PINS_HALO,
      type: 'circle',
      source: PINS_SRC,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 9, 15, 17],
        'circle-color': ['get', 'color'],
        'circle-opacity': ['case', ['==', ['get', 'selected'], 1], 0.35, ['==', ['get', 'urgente'], 1], 0.22, 0],
        'circle-blur': 0.5,
      },
    });
  }
  if (!map.getLayer(PINS_LAYER)) {
    map.addLayer({
      id: PINS_LAYER,
      type: 'circle',
      source: PINS_SRC,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10,
          ['case', ['==', ['get', 'selected'], 1], 7.5, 5],
          15,
          ['case', ['==', ['get', 'selected'], 1], 12, 8.5],
        ],
        'circle-color': ['get', 'color'],
        'circle-stroke-width': ['case', ['==', ['get', 'selected'], 1], 3, 2],
        'circle-stroke-color': ['case', ['==', ['get', 'selected'], 1], '#E8B84A', '#ffffff'],
      },
    });
  }
}

interface Tip {
  x: number;
  y: number;
  kind: 'hex' | 'area';
  hex?: HexProps;
  area?: AreaVerdeProps;
}

export function Mapa({
  className,
  interactive = true,
  showControls = true,
  quiet = false,
  pontos = [],
  filter = 'todos',
  showPins = true,
  lente = 'prioridade',
  showAreas = true,
  extrude = false,
  dim = false,
  ambient = false,
  heroFrame = false,
  basemap = 'streets',
  initialZoom = DEFAULT_ZOOM,
  initialPitch = 0,
  onSelectPonto,
  onSelectHex,
  onSelectArea,
  selectedHex = null,
  focusPontoId = null,
  flyTarget = null,
  controlsPosition = 'bottom-right',
  onReady,
}: MapaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const handlers = useRef({ onSelectPonto, onSelectHex, onSelectArea });
  handlers.current = { onSelectPonto, onSelectHex, onSelectArea };
  const lenteRef = useRef(lente);
  lenteRef.current = lente;
  const basemapRef = useRef<MapBasemap>(basemap);
  const appliedLente = useRef<Lente | null>(null);
  const dimRef = useRef(dim);
  dimRef.current = dim;
  const hoverRef = useRef<{ src: string; id: string | number } | null>(null);
  const [ready, setReady] = useState(false);
  const [styleEpoch, setStyleEpoch] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  /* ------------------------------------------------------------ init */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const streets = process.env.NEXT_PUBLIC_MAP_STYLE_URL || POSITRON_STYLE;
    let map: Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: basemap === 'satellite' ? SATELLITE_STYLE : streets,
        center: TERESINA_CENTER,
        zoom: initialZoom,
        pitch: initialPitch,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        maxBounds: TERESINA_BOUNDS,
        maxPitch: 65,
        interactive,
        attributionControl: { compact: true },
        fadeDuration: 180,
      });
    } catch {
      setError('Não foi possível iniciar o mapa.');
      return;
    }
    mapRef.current = map;
    basemapRef.current = basemap;
    appliedLente.current = null;
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __vuMap?: Map }).__vuMap = map;

    if (showControls && interactive) {
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), controlsPosition);
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        controlsPosition
      );
    }

    const canHover =
      typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
    let raf = 0;

    const setHover = (next: { src: string; id: string | number } | null) => {
      const prev = hoverRef.current;
      if (prev && (!next || prev.id !== next.id || prev.src !== next.src)) {
        map.setFeatureState({ source: prev.src, id: prev.id }, { hover: false });
      }
      if (next) map.setFeatureState({ source: next.src, id: next.id }, { hover: true });
      hoverRef.current = next;
    };

    const layersAt = () =>
      [PINS_LAYER, AREAS_FILL, HEX_FILL, HEX_3D].filter(
        (id) => map.getLayer(id) && map.getLayoutProperty(id, 'visibility') !== 'none'
      );

    const pick = (e: MapMouseEvent): MapGeoJSONFeature | undefined => {
      const feats = map.queryRenderedFeatures(e.point, { layers: layersAt() });
      const order = [PINS_LAYER, AREAS_FILL, HEX_FILL, HEX_3D];
      return feats.sort((a, b) => order.indexOf(a.layer.id) - order.indexOf(b.layer.id))[0];
    };

    const onMove = (e: MapMouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const f = pick(e);
        map.getCanvas().style.cursor = f ? 'pointer' : '';
        if (!f || f.layer.id === PINS_LAYER) {
          setHover(null);
          setTip(null);
          return;
        }
        const isArea = f.layer.id === AREAS_FILL;
        setHover({ src: isArea ? AREAS_SRC : HEX_SRC, id: f.id as string });
        if (canHover) {
          setTip({
            x: e.point.x,
            y: e.point.y,
            kind: isArea ? 'area' : 'hex',
            hex: isArea ? undefined : (f.properties as HexProps),
            area: isArea ? (f.properties as AreaVerdeProps) : undefined,
          });
        }
      });
    };
    const onOut = () => {
      setHover(null);
      setTip(null);
    };
    const onClick = (e: MapMouseEvent) => {
      const f = pick(e);
      if (!f) {
        handlers.current.onSelectHex?.(null);
        return;
      }
      if (f.layer.id === PINS_LAYER) {
        handlers.current.onSelectPonto?.(String(f.properties.id));
      } else if (f.layer.id === AREAS_FILL) {
        handlers.current.onSelectArea?.(f.properties as AreaVerdeProps);
      } else {
        handlers.current.onSelectHex?.(f.properties as HexProps, [e.lngLat.lng, e.lngLat.lat]);
      }
    };

    const frame = () => {
      if (!heroFrame) return;
      const { clientWidth: w, clientHeight: h } = map.getContainer();
      map.setPadding(w >= 768 ? { left: w * 0.42, top: 0, right: 0, bottom: 0 } : { bottom: h * 0.18, top: 0, left: 0, right: 0 });
    };
    frame();
    map.on('resize', frame);

    map.on('load', () => {
      addLayers(map, basemapRef.current === 'satellite', lenteRef);
      map.setPaintProperty(HEX_FILL, 'fill-opacity-transition', FADE);
      setReady(true);
      onReady?.(map);
    });
    if (interactive) {
      map.on('mousemove', onMove);
      map.on('mouseout', onOut);
      map.on('click', onClick);
    }
    map.on('error', (ev) => {
      // tiles isolados falhando não devem derrubar a tela inteira
      if (!map.loaded() && !map.isStyleLoaded()) {
        setError('Falha ao carregar o mapa (rede).');
      }
      if (process.env.NODE_ENV !== 'production') console.warn(ev.error);
    });

    return () => {
      cancelAnimationFrame(raf);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, showControls, controlsPosition]);

  /* ------------------------------------------------------------ basemap */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || basemapRef.current === basemap) return;
    basemapRef.current = basemap;
    const streets = process.env.NEXT_PUBLIC_MAP_STYLE_URL || POSITRON_STYLE;
    map.setStyle(basemap === 'satellite' ? SATELLITE_STYLE : streets);
    map.once('style.load', () => {
      addLayers(map, basemap === 'satellite', lenteRef);
      map.setPaintProperty(HEX_FILL, 'fill-opacity-transition', FADE);
      appliedLente.current = lenteRef.current;
      setStyleEpoch((n) => n + 1);
    });
  }, [basemap, ready]);

  /* ------------------------------------------------------------ lente / camadas */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer(HEX_FILL)) return;
    const vis = (id: string, on: boolean) =>
      map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');

    const on = lente !== null;
    vis(HEX_FILL, on && !extrude);
    vis(HEX_LINE, on && !extrude);
    vis(HEX_HL, on && !extrude);
    vis(HEX_3D, on && extrude);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (lente && appliedLente.current !== lente) {
      const first = appliedLente.current === null;
      appliedLente.current = lente;
      const apply = () => {
        map.setPaintProperty(HEX_FILL, 'fill-color', corExpr(lente));
        map.setPaintProperty(HEX_3D, 'fill-extrusion-color', corExpr(lente));
        map.setPaintProperty(HEX_3D, 'fill-extrusion-height', alturaExpr(lente));
        map.setPaintProperty(HEX_FILL, 'fill-opacity', hexOpacity(basemapRef.current === 'satellite', dimRef.current));
      };
      if (first) {
        apply();
      } else {
        map.setPaintProperty(HEX_FILL, 'fill-opacity', 0);
        timer = setTimeout(apply, FADE.duration);
      }
    }
    vis(AREAS_FILL, showAreas);
    vis(AREAS_LINE, showAreas);
    vis(AREAS_LABEL, showAreas);
    vis(PINS_HALO, showPins);
    vis(PINS_LAYER, showPins);
    return () => clearTimeout(timer);
  }, [ready, styleEpoch, lente, extrude, showAreas, showPins]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer(HEX_FILL)) return;
    map.setPaintProperty(HEX_FILL, 'fill-opacity', hexOpacity(basemapRef.current === 'satellite', dim));
  }, [dim, ready, styleEpoch]);

  /* ------------------------------------------------------------ pins */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource(PINS_SRC) as maplibregl.GeoJSONSource | undefined;
    src?.setData(pinsData(pontos, filter, focusPontoId));
  }, [ready, styleEpoch, pontos, filter, focusPontoId]);

  /* ------------------------------------------------------------ hex selecionado */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !selectedHex) return;
    const target = { source: HEX_SRC, id: selectedHex };
    try {
      map.setFeatureState(target, { selected: true });
    } catch {
      return;
    }
    return () => {
      if (map.getSource(HEX_SRC)) map.setFeatureState(target, { selected: false });
    };
  }, [ready, styleEpoch, selectedHex]);

  /* ------------------------------------------------------------ câmera */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !focusPontoId) return;
    const p = pontos.find((x) => x.id === focusPontoId);
    if (!p) return;
    map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 14.5), essential: true, speed: 1.1 });
  }, [focusPontoId, ready, pontos]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !flyTarget) return;
    map.flyTo({ center: flyTarget.center, zoom: flyTarget.zoom ?? 14, essential: true, speed: 1.1, curve: 1.5 });
  }, [flyTarget, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !ambient) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let alive = true;
    const drift = () => {
      if (!alive) return;
      map.easeTo({ bearing: map.getBearing() + 12, duration: 16000, easing: (t) => t });
    };
    map.on('moveend', drift);
    drift();
    return () => {
      alive = false;
      map.off('moveend', drift);
      map.stop();
    };
  }, [ambient, ready]);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#EEF1EA]',
        controlsPosition === 'bottom-right' && 'vu-map-controls-br',
        className
      )}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />

      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[#EEF1EA] transition-opacity duration-700',
          ready || error ? 'opacity-0' : 'opacity-100'
        )}
        aria-hidden={ready}
      >
        {!quiet && (
          <div className="flex flex-col items-center gap-3">
            <span className="vu-pulse-dot" />
            <p className="font-display text-base text-folha">Carregando Teresina…</p>
          </div>
        )}
      </div>

      {error && !quiet && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-sol p-6 text-center">
          <p className="text-sm text-laterita">{error}</p>
        </div>
      )}

      {tip && lente !== null && <MapTooltip tip={tip} lente={lente} />}
    </div>
  );
}

function MapTooltip({ tip, lente }: { tip: Tip; lente: Lente }) {
  const style = {
    transform: `translate(${tip.x + 14}px, ${tip.y + 14}px)`,
  };
  if (tip.kind === 'area' && tip.area) {
    return (
      <div className="vu-tip pointer-events-none absolute left-0 top-0 z-[5]" style={style}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-folha-light">
          {tip.area.tipo === 'praca' ? 'Praça' : tip.area.tipo === 'bosque' ? 'Bosque' : 'Área verde'}
        </p>
        <p className="font-display text-sm font-semibold leading-tight text-tinta">
          {tip.area.nome || 'Área verde sem nome'}
        </p>
      </div>
    );
  }
  const h = tip.hex;
  if (!h) return null;
  return (
    <div className="vu-tip pointer-events-none absolute left-0 top-0 z-[5]" style={style}>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: corHex(lente, h) }} />
        <p className="font-display text-sm font-semibold leading-tight text-tinta">
          {h.bairro ?? 'Teresina'}
        </p>
      </div>
      <dl className="mt-1.5 grid grid-cols-3 gap-x-3 text-[11px] leading-tight">
        <div>
          <dt className="text-tinta-faint">Copa</dt>
          <dd className="font-semibold tabular-nums text-tinta">{h.copa}%</dd>
        </div>
        <div>
          <dt className="text-tinta-faint">Superfície</dt>
          <dd className="font-semibold tabular-nums text-tinta">{h.temp != null ? `${h.temp}°` : '—'}</dd>
        </div>
        <div>
          <dt className="text-tinta-faint">Prioridade</dt>
          <dd className="font-semibold tabular-nums text-tinta">{h.urbano ? h.prioridade : '—'}</dd>
        </div>
      </dl>
      <p className="mt-1 text-[10.5px] font-medium" style={{ color: CLASSE_LABEL[h.classe].tom }}>
        {CLASSE_LABEL[h.classe].label}
      </p>
    </div>
  );
}
