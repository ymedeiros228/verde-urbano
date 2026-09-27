'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';
import { ESCALAS, gradienteCSS, type Lente } from '@/lib/map/verde';
import { cn } from '@/lib/utils/cn';

interface MapLegendProps {
  lente: Lente;
  showAreas?: boolean;
  showPins?: boolean;
  className?: string;
  compact?: boolean;
}

/** Legenda da lente ativa: gradiente com as mesmas paradas de cor do mapa */
export function MapLegend({
  lente,
  showAreas = true,
  showPins = true,
  className,
  compact = false,
}: MapLegendProps) {
  const [fonte, setFonte] = useState(false);
  const e = ESCALAS[lente];

  return (
    <div
      className={cn(
        'vu-glass rounded-2xl p-3',
        compact && 'px-3 py-2.5',
        className
      )}
      role="group"
      aria-label="Legenda do mapa"
    >
      <div className="flex items-start justify-between gap-3">
        <div key={lente} className="vu-fade-in min-w-0">
          <p className="font-display text-sm font-semibold leading-tight text-tinta">
            {e.titulo}
          </p>
          {!compact && (
            <p className="mt-0.5 text-[11px] leading-snug text-tinta-muted">{e.descricao}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFonte((v) => !v)}
          className="-m-1 shrink-0 rounded-lg p-1 text-tinta-faint transition hover:bg-sol hover:text-folha"
          aria-label="Fonte dos dados"
          aria-expanded={fonte}
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      <div
        className="mt-2 h-2.5 rounded-full transition-[background] duration-500"
        style={{ background: gradienteCSS(lente) }}
      />
      <div className="mt-1 flex justify-between text-[10.5px] font-medium tabular-nums text-tinta-muted">
        <span>{e.rotulos[0]}</span>
        <span>{e.rotulos[1]}</span>
      </div>

      {!compact && (showAreas || showPins) && (
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 border-t border-folha-muted/25 pt-2 text-[11px] text-tinta-muted">
          {showAreas && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[4px] border border-folha bg-folha-light/40" />
              Parques e praças
            </span>
          )}
          {showPins && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-white bg-laterita shadow" />
              Pedidos da comunidade
            </span>
          )}
        </div>
      )}

      {fonte && (
        <p className="vu-fade-in mt-2 border-t border-folha-muted/25 pt-2 text-[10.5px] leading-snug text-tinta-faint">
          Hexágonos de ~0,1 km². Copa: ESA WorldCover 10 m. Temperatura: Landsat 8/9, mediana
          da seca 2025. Parques: OpenStreetMap. Rio e lagoas ficam de fora.
        </p>
      )}
    </div>
  );
}
