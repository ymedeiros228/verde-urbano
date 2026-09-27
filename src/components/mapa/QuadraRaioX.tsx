'use client';

import { useState } from 'react';
import { Mapa } from '@/components/mapa/Mapa';
import { CLASSE_LABEL, nivelPrioridade, type HexProps } from '@/lib/map/verde';
import type { Demanda } from '@/lib/data/mock';

/** Mini-mapa + dados de satélite da quadra onde o ponto foi marcado */
export function QuadraRaioX({ demanda }: { demanda: Demanda }) {
  const [hex, setHex] = useState<HexProps | null>(null);

  return (
    <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-folha-muted/25">
      <div className="relative h-48">
        <Mapa
          className="vu-no-attrib h-full w-full"
          interactive={false}
          showControls={false}
          quiet
          pontos={[demanda]}
          focusPontoId={demanda.id}
          lente="copa"
          initialZoom={15.3}
          onReady={(map) => {
            map.jumpTo({ center: [demanda.lng, demanda.lat], zoom: 15.3 });
            map.once('idle', () => {
              const f = map.queryRenderedFeatures(map.project([demanda.lng, demanda.lat]), {
                layers: ['vu-hex-fill'],
              })[0];
              if (f) setHex(f.properties as HexProps);
            });
          }}
        />
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-folha-light">
          Raio-x da quadra · satélite
        </p>
        {hex ? (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { l: 'Copa de árvore', v: `${hex.copa.toLocaleString('pt-BR')}%` },
                { l: 'Chão na seca', v: hex.temp != null ? `${hex.temp.toLocaleString('pt-BR')} °C` : '—' },
                { l: 'Prioridade', v: hex.urbano ? nivelPrioridade(hex.prioridade).label : '—' },
              ].map(({ l, v }) => (
                <div key={l} className="rounded-2xl bg-sol px-3 py-2.5">
                  <p className="font-display text-lg font-semibold tabular-nums leading-tight text-tinta">{v}</p>
                  <p className="mt-0.5 text-[11px] text-tinta-muted">{l}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs" style={{ color: CLASSE_LABEL[hex.classe].tom }}>
              {CLASSE_LABEL[hex.classe].label} — dados ESA WorldCover e Landsat.
            </p>
          </>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[3.6rem] animate-pulse rounded-2xl bg-sol" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
