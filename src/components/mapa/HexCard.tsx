'use client';

import Link from 'next/link';
import { Sprout, X } from 'lucide-react';
import {
  CLASSE_LABEL,
  formatHa,
  nivelPrioridade,
  useMapaVerdeMeta,
  type AreaVerdeProps,
  type HexProps,
} from '@/lib/map/verde';
import { cn } from '@/lib/utils/cn';

export type Selecao =
  | { kind: 'hex'; hex: HexProps; lngLat?: [number, number] }
  | { kind: 'area'; area: AreaVerdeProps };

/** Card flutuante (não-modal) com o raio-x da quadra ou da área verde */
export function HexCard({
  selecao,
  onClose,
  onMarcar,
  className,
}: {
  selecao: Selecao;
  onClose: () => void;
  /** Se presente, abre o modo "marcar ponto" no próprio mapa */
  onMarcar?: (lngLat?: [number, number]) => void;
  className?: string;
}) {
  const { data: meta } = useMapaVerdeMeta();

  if (selecao.kind === 'area') {
    const a = selecao.area;
    const tipo =
      a.tipo === 'praca' ? 'Praça' : a.tipo === 'bosque' ? 'Bosque' : a.tipo === 'parque' ? 'Parque' : 'Área de lazer';
    return (
      <Shell onClose={onClose} className={className}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-folha-light">{tipo}</p>
        <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-tinta">
          {a.nome || 'Área verde sem nome'}
        </h3>
        <p className="mt-2 text-sm text-tinta-muted">
          <span className="font-semibold tabular-nums text-folha">{formatHa(a.area_m2)}</span> mapeados
          no OpenStreetMap.
        </p>
      </Shell>
    );
  }

  const h = selecao.hex;
  const classe = CLASSE_LABEL[h.classe];
  const nivel = nivelPrioridade(h.prioridade);
  const mediaCopa = meta?.totais.copa_urbana_media;
  const mediaTemp = meta?.totais.temp_urbana_media;
  const difTemp = h.temp != null && mediaTemp != null ? h.temp - mediaTemp : null;

  const params = new URLSearchParams({ bairro: h.bairro ?? '' });
  if (selecao.lngLat) {
    params.set('lng', selecao.lngLat[0].toFixed(5));
    params.set('lat', selecao.lngLat[1].toFixed(5));
  }

  return (
    <Shell onClose={onClose} className={className}>
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
        style={{ color: classe.tom, background: `${classe.tom}14` }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: classe.tom }} />
        {classe.label}
      </span>
      <h3 className="mt-1.5 font-display text-xl font-semibold leading-tight text-tinta">
        {h.bairro ?? 'Teresina'}
      </h3>

      <dl className="mt-3 grid grid-cols-3 gap-2">
        <Metric label="Copa" value={`${h.copa.toLocaleString('pt-BR')}%`} />
        <Metric label="Superfície" value={h.temp != null ? `${h.temp.toLocaleString('pt-BR')}°` : '—'} />
        <Metric label="Construído" value={`${Math.round(h.construido)}%`} />
      </dl>

      {h.urbano && (
        <div className="mt-3">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-tinta-muted">Prioridade de plantio</span>
            <span className="font-semibold tabular-nums" style={{ color: nivel.tom }}>
              {nivel.label} · {h.prioridade}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sol">
            <div
              className="vu-grow h-full rounded-full"
              style={{ width: `${Math.max(4, h.prioridade)}%`, background: nivel.tom }}
            />
          </div>
        </div>
      )}

      <p className="mt-3 text-[13px] leading-relaxed text-tinta-muted">
        {mediaCopa != null && (
          <>
            {h.copa < mediaCopa ? 'Menos' : 'Mais'} árvores que a média urbana de Teresina (
            {mediaCopa.toLocaleString('pt-BR')}%)
          </>
        )}
        {difTemp != null && Math.abs(difTemp) >= 0.3 && (
          <>
            {' '}
            e o chão fica{' '}
            <span className="font-semibold text-tinta">
              {Math.abs(difTemp).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} °C{' '}
              {difTemp > 0 ? 'mais quente' : 'mais fresco'}
            </span>{' '}
            na seca
          </>
        )}
        .
      </p>

      {h.urbano && h.prioridade >= 35 && onMarcar && (
        <button
          type="button"
          onClick={() => onMarcar(selecao.lngLat)}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-folha text-sm font-semibold text-white shadow-soft transition hover:bg-folha-light active:scale-[0.98]"
        >
          <Sprout className="h-4 w-4" />
          Marcar ponto aqui com foto
        </button>
      )}
      {h.urbano && h.prioridade >= 35 && !onMarcar && (
        <Link
          href={`/pontos/novo?${params.toString()}`}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-folha text-sm font-semibold text-white shadow-soft transition hover:bg-folha-light active:scale-[0.98]"
        >
          <Sprout className="h-4 w-4" />
          Pedir árvores aqui
        </Link>
      )}
    </Shell>
  );
}

function Shell({
  children,
  onClose,
  className,
}: {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div className={cn('vu-card-in vu-glass relative rounded-3xl p-4 pr-11', className)} role="dialog" aria-label="Detalhes do local">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2.5 top-2.5 rounded-xl p-1.5 text-tinta-faint transition hover:bg-sol hover:text-tinta"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-sol/80 px-2.5 py-2">
      <dt className="text-[10.5px] font-medium text-tinta-faint">{label}</dt>
      <dd className="font-display text-lg font-semibold tabular-nums leading-tight text-tinta">{value}</dd>
    </div>
  );
}
