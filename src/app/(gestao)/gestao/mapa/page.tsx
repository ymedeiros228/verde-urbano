'use client';

import { useState } from 'react';
import { Mapa } from '@/components/mapa/Mapa';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { DemandaSheet } from '@/components/demanda/DemandaSheet';
import { useToast } from '@/components/ui/Toast';
import { useMapaPontos } from '@/hooks/useDemandas';
import { useEngagement } from '@/hooks/useEngagement';
import { downloadDemandasGeoJSON } from '@/lib/map/exportGeoJSON';
import type { Demanda } from '@/lib/data/mock';

export default function GestaoMapaPage() {
  const { data: mapaPontos = [] } = useMapaPontos();
  const { toast } = useToast();
  const { extra } = useEngagement();
  const [heatmap, setHeatmap] = useState(true);
  const [cobertura, setCobertura] = useState(true);
  const [demandasLayer, setDemandasLayer] = useState(true);
  const [selected, setSelected] = useState<Demanda | null>(null);

  const votos = selected ? selected.votos + extra(selected.id) : 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mapa de Inteligência"
        description="Calor / cobertura / demandas — apoio SEMAM & SAADs."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              downloadDemandasGeoJSON(mapaPontos.filter((p) => !p.heatOnly));
              toast('GeoJSON exportado', 'folha');
            }}
          >
            Exportar GeoJSON
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Chip active={heatmap} onClick={() => setHeatmap((v) => !v)}>
          Calor
        </Chip>
        <Chip active={cobertura} onClick={() => setCobertura((v) => !v)}>
          Cobertura
        </Chip>
        <Chip active={demandasLayer} onClick={() => setDemandasLayer((v) => !v)}>
          Pins
        </Chip>
      </div>

      <div className="vu-enter relative h-[calc(100vh-14rem)] overflow-hidden rounded-2xl border border-folha-muted/30 bg-white shadow-soft">
        <Mapa
          className="h-full w-full"
          pontos={mapaPontos}
          heatmapIntensity={1.55}
          heatmapRadius={34}
          onSelectPonto={(id) => {
            const p = mapaPontos.find((x) => x.id === id);
            if (p) setSelected(p);
          }}
          layers={{
            demandas: demandasLayer,
            heatmap,
            cobertura,
          }}
        />
        <div className="absolute bottom-4 left-4 rounded-xl border border-folha-muted/30 bg-white/95 p-2.5 text-[10px] shadow-soft">
          <p className="mb-1 font-semibold text-tinta">Legenda</p>
          <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-ipe to-laterita" />
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
