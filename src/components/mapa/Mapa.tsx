'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl, { type Map, type Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  OPENFREEMAP_STYLE,
  TERESINA_BOUNDS,
  TERESINA_CENTER,
  TIPOS_PONTO,
  type TipoPonto,
} from '@/lib/map/terezina';
import { COBERTURA_GEOJSON, type Demanda } from '@/lib/data/mock';
import { cn } from '@/lib/utils/cn';

export type MapFilter =
  | 'todos'
  | 'arvores'
  | 'pracas'
  | 'terrenos'
  | 'mutiroes';

export interface MapaLayers {
  demandas?: boolean;
  heatmap?: boolean;
  cobertura?: boolean;
}

interface MapaProps {
  className?: string;
  interactive?: boolean;
  showControls?: boolean;
  /** Esconde o overlay "Carregando…" (útil na landing) */
  quiet?: boolean;
  pontos?: Demanda[];
  filter?: MapFilter;
  layers?: MapaLayers;
  /** Intensidade do heatmap (cidadão ~1.6, painel ~1.2) */
  heatmapIntensity?: number;
  heatmapRadius?: number;
  onSelectPonto?: (id: string) => void;
  onReady?: (map: Map) => void;
  /** Centra o mapa neste ponto quando disponível */
  focusPontoId?: string | null;
}

function matchesFilter(d: Demanda, filter: MapFilter): boolean {
  if (filter === 'todos') return true;
  if (filter === 'terrenos') return d.tipo === 'terreno_baldio';
  if (filter === 'pracas') return d.tipo === 'praca' || d.tipo === 'lazer_infantil';
  if (filter === 'arvores')
    return d.tipo === 'canteiro' || d.badgeTone === 'ipe';
  if (filter === 'mutiroes')
    return d.step === 'mutirao' || Boolean(d.mutiraoData);
  return true;
}

function createMarkerEl(tipo: TipoPonto, urgencia: number) {
  const color = TIPOS_PONTO[tipo].color;
  const el = document.createElement('button');
  el.type = 'button';
  el.setAttribute('aria-label', TIPOS_PONTO[tipo].label);
  el.style.cssText = `
    width: ${urgencia > 80 ? 28 : 22}px;
    height: ${urgencia > 80 ? 28 : 22}px;
    border-radius: 9999px;
    border: 2px solid #fff;
    background: ${color};
    box-shadow: 0 2px 8px rgba(28,43,34,0.35);
    cursor: pointer;
    padding: 0;
    position: relative;
  `;
  if (urgencia > 75) {
    const pulse = document.createElement('span');
    pulse.style.cssText = `
      position: absolute; inset: -6px; border-radius: 9999px;
      border: 2px solid ${color}; opacity: 0.5;
      animation: vu-pulse 1.8s ease-out infinite; pointer-events: none;
    `;
    el.appendChild(pulse);
  }
  return el;
}

function syncLayers(
  map: Map,
  layers: MapaLayers,
  pontos: Demanda[],
  heatmapIntensity = 1.2,
  heatmapRadius = 28
) {
  const heatId = 'vu-heat';
  const heatSrc = 'vu-heat-src';
  const cobId = 'vu-cob';
  const cobSrc = 'vu-cob-src';
  const cobOutline = 'vu-cob-outline';

  if (layers.heatmap) {
    const fc = {
      type: 'FeatureCollection' as const,
      features: pontos.map((p) => ({
        type: 'Feature' as const,
        properties: { weight: Math.max(0.15, p.urgencia / 100) },
        geometry: {
          type: 'Point' as const,
          coordinates: [p.lng, p.lat],
        },
      })),
    };
    if (map.getSource(heatSrc)) {
      (map.getSource(heatSrc) as maplibregl.GeoJSONSource).setData(fc);
      if (map.getLayer(heatId)) {
        map.setPaintProperty(heatId, 'heatmap-intensity', heatmapIntensity);
        map.setPaintProperty(heatId, 'heatmap-radius', heatmapRadius);
      }
    } else {
      map.addSource(heatSrc, { type: 'geojson', data: fc });
      map.addLayer({
        id: heatId,
        type: 'heatmap',
        source: heatSrc,
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': heatmapIntensity,
          'heatmap-radius': heatmapRadius,
          'heatmap-opacity': 0.72,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(232,184,74,0)',
            0.25,
            'rgba(232,184,74,0.55)',
            0.5,
            'rgba(200,100,40,0.7)',
            0.75,
            'rgba(181,74,42,0.85)',
            1,
            'rgba(120,25,18,0.95)',
          ],
        },
      });
    }
  } else if (map.getLayer(heatId)) {
    map.removeLayer(heatId);
    map.removeSource(heatSrc);
  }

  if (layers.cobertura) {
    if (!map.getSource(cobSrc)) {
      map.addSource(cobSrc, { type: 'geojson', data: COBERTURA_GEOJSON });
      map.addLayer({
        id: cobId,
        type: 'fill',
        source: cobSrc,
        paint: {
          'fill-color': '#1A5C3A',
          'fill-opacity': 0.28,
        },
      });
      map.addLayer({
        id: cobOutline,
        type: 'line',
        source: cobSrc,
        paint: {
          'line-color': '#1A5C3A',
          'line-width': 2,
        },
      });
    }
  } else {
    if (map.getLayer(cobOutline)) map.removeLayer(cobOutline);
    if (map.getLayer(cobId)) map.removeLayer(cobId);
    if (map.getSource(cobSrc)) map.removeSource(cobSrc);
  }
}

export function Mapa({
  className,
  interactive = true,
  showControls = true,
  quiet = false,
  pontos = [],
  filter = 'todos',
  layers = { demandas: true, heatmap: false, cobertura: false },
  heatmapIntensity = 1.2,
  heatmapRadius = 28,
  onSelectPonto,
  onReady,
  focusPontoId = null,
}: MapaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = pontos.filter((p) => matchesFilter(p, filter));

  const refreshMarkers = useCallback(
    (map: Map) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (layers.demandas === false) return;

      for (const ponto of filtered) {
        if (ponto.heatOnly) continue;
        const el = createMarkerEl(ponto.tipo, ponto.urgencia);
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectPonto?.(ponto.id);
        });
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([ponto.lng, ponto.lat])
          .addTo(map);
        markersRef.current.push(marker);
      }
    },
    [filtered, layers.demandas, onSelectPonto]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const styleUrl =
      process.env.NEXT_PUBLIC_MAP_STYLE_URL || OPENFREEMAP_STYLE;

    let map: Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: styleUrl,
        center: TERESINA_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        maxBounds: TERESINA_BOUNDS,
        interactive,
      });
    } catch {
      setError('Não foi possível iniciar o mapa.');
      return;
    }

    mapRef.current = map;

    if (showControls && interactive) {
      map.addControl(
        new maplibregl.NavigationControl({ visualizePitch: false }),
        'top-right'
      );
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        'top-right'
      );
    }

    map.on('load', () => {
      setReady(true);
      onReady?.(map);
    });

    map.on('error', () => {
      setError('Falha ao carregar tiles do mapa (rede).');
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, showControls]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    refreshMarkers(map);
    try {
      syncLayers(map, layers, pontos, heatmapIntensity, heatmapRadius);
    } catch {
      /* style ainda carregando */
    }
  }, [ready, filtered, layers, pontos, refreshMarkers, heatmapIntensity, heatmapRadius]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !focusPontoId) return;
    const ponto = pontos.find((p) => p.id === focusPontoId);
    if (!ponto) return;
    map.flyTo({
      center: [ponto.lng, ponto.lat],
      zoom: Math.max(map.getZoom(), 14.5),
      essential: true,
    });
  }, [focusPontoId, ready, pontos]);

  return (
    <div className={cn('relative overflow-hidden bg-folha-muted/20', className)}>
      <style>{`
        @keyframes vu-pulse {
          0% { transform: scale(0.85); opacity: 0.55; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      {!ready && !error && !quiet && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#F3F6F1]/80 backdrop-blur-sm">
          <p className="font-display text-lg text-folha">Carregando Teresina…</p>
        </div>
      )}
      {error && !quiet && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#F3F6F1] p-6 text-center">
          <p className="text-sm text-laterita">{error}</p>
        </div>
      )}
    </div>
  );
}
