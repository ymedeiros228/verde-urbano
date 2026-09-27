'use client';

import { useState } from 'react';
import { Box, MapPin, Satellite, Trees } from 'lucide-react';
import { Mapa, type FlyTarget, type MapBasemap } from '@/components/mapa/Mapa';
import { MapLegend } from '@/components/mapa/MapLegend';
import { LenteSwitch } from '@/components/mapa/LenteSwitch';
import { HexCard, type Selecao } from '@/components/mapa/HexCard';
import { BairroRanking } from '@/components/mapa/BairroRanking';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { DemandaSheet } from '@/components/demanda/DemandaSheet';
import { useToast } from '@/components/ui/Toast';
import { useMapaPontos } from '@/hooks/useDemandas';
import { useEngagement } from '@/hooks/useEngagement';
import { downloadDemandasGeoJSON } from '@/lib/map/exportGeoJSON';
import type { Lente } from '@/lib/map/verde';
import type { Demanda } from '@/lib/data/mock';

export default function GestaoMapaPage() {
  const { data: mapaPontos = [] } = useMapaPontos();
  const { toast } = useToast();
  const { extra } = useEngagement();
  const [lente, setLente] = useState<Lente>('prioridade');
  const [showAreas, setShowAreas] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [extrude, setExtrude] = useState(false);
  const [basemap, setBasemap] = useState<MapBasemap>('streets');
  const [selecao, setSelecao] = useState<Selecao | null>(null);
  const [selected, setSelected] = useState<Demanda | null>(null);
  const [focusPontoId, setFocusPontoId] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);

  const votos = selected ? selected.votos + extra(selected.id) : 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mapa de Inteligência"
        description="Onde falta copa e sobra calor — dados de satélite em quadras de ~0,1 km², cruzados com os pedidos da comunidade."
        actions={
          <div className="flex gap-2">
            <a href="/map/hex-verde.geojson" download="teresina-prioridade-arborizacao.geojson">
              <Button variant="secondary" size="sm">Baixar grade (GeoJSON)</Button>
            </a>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                downloadDemandasGeoJSON(mapaPontos);
                toast('GeoJSON exportado', 'folha');
              }}
            >
              Exportar pedidos
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <LenteSwitch value={lente} onChange={setLente} className="w-full sm:w-80" />
        <Chip active={showAreas} onClick={() => setShowAreas((v) => !v)}>
          <span className="inline-flex items-center gap-1.5"><Trees className="h-3.5 w-3.5" />Parques</span>
        </Chip>
        <Chip active={showPins} onClick={() => setShowPins((v) => !v)}>
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Pedidos</span>
        </Chip>
        <Chip
          active={basemap === 'satellite'}
          onClick={() => setBasemap((b) => (b === 'satellite' ? 'streets' : 'satellite'))}
        >
          <span className="inline-flex items-center gap-1.5"><Satellite className="h-3.5 w-3.5" />Satélite</span>
        </Chip>
        <Chip active={extrude} onClick={() => setExtrude((v) => !v)}>
          <span className="inline-flex items-center gap-1.5"><Box className="h-3.5 w-3.5" />3D</span>
        </Chip>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
        <div className="vu-enter relative h-[calc(100vh-15rem)] min-h-[28rem] overflow-hidden rounded-2xl border border-folha-muted/30 bg-white shadow-soft">
          <Mapa
            className="h-full w-full"
            pontos={mapaPontos}
            showPins={showPins}
            lente={lente}
            showAreas={showAreas}
            extrude={extrude}
            basemap={basemap}
            focusPontoId={focusPontoId}
            flyTarget={flyTarget}
            selectedHex={selecao?.kind === 'hex' ? selecao.hex.h3 : null}
            controlsPosition="top-right"
            onSelectHex={(hex, lngLat) => setSelecao(hex ? { kind: 'hex', hex, lngLat } : null)}
            onSelectArea={(area) => setSelecao({ kind: 'area', area })}
            onSelectPonto={(id) => {
              const p = mapaPontos.find((x) => x.id === id);
              if (p) {
                setSelected(p);
                setFocusPontoId(p.id);
              }
            }}
          />
          {selecao && (
            <div className="absolute left-3 top-3 z-20 w-[min(20rem,calc(100%-4.5rem))]">
              <HexCard selecao={selecao} onClose={() => setSelecao(null)} />
            </div>
          )}
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 w-[17rem]">
            <MapLegend lente={lente} showAreas={showAreas} showPins={showPins} className="pointer-events-auto" />
          </div>
        </div>
        <div className="rounded-2xl border border-folha-muted/30 bg-white p-4 shadow-soft xl:max-h-[calc(100vh-15rem)] xl:overflow-y-auto">
          <h2 className="font-display text-base font-semibold text-folha">Ranking de bairros</h2>
          <p className="mb-3 text-xs text-tinta-muted">Clique para ir ao bairro no mapa</p>
          <BairroRanking
            limit={20}
            onSelect={(b) => setFlyTarget({ center: b.centro, zoom: 14.2, key: `${b.bairro}-${Date.now()}` })}
          />
        </div>
      </div>

      <DemandaSheet
        demanda={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        votos={votos}
        showApoiar={false}
      />
    </div>
  );
}
