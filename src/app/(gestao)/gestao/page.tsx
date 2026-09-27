'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Mapa } from '@/components/mapa/Mapa';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { MutiraoCover } from '@/components/demanda/DemandaCover';
import { useCountUp } from '@/lib/useCountUp';
import { useMapaPontos } from '@/hooks/useDemandas';
import { useMutiroes } from '@/hooks/useMutiroes';
import {
  KPI_MOCK,
  TIPOS_DEMANDA_CHART,
  STATUS_CHART,
  PRIORIDADES_BAIRRO,
} from '@/lib/data/mock';
import { ESPECIES_NATIVAS_PIAUI } from '@/lib/map/terezina';
import { SEMAM } from '@/lib/data/semam';
import { useEngagement } from '@/hooks/useEngagement';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 80;
  const h = 28;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} className="opacity-80" aria-hidden>
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
    </svg>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(26,92,58,0.15)',
  fontSize: 12,
  boxShadow: '0 8px 30px rgba(28,43,34,0.08)',
};

const kpis = [
  {
    label: 'Demandas no piloto',
    value: KPI_MOCK.demandasAtivas,
    spark: KPI_MOCK.sparkDemandas,
    color: '#1A5C3A',
  },
  {
    label: 'Mudas (mutirões)',
    value: KPI_MOCK.arvoresPlantadas,
    spark: KPI_MOCK.sparkArvores,
    color: '#2D8A58',
  },
  {
    label: 'Mutirões',
    value: KPI_MOCK.mutiroesAgendados,
    spark: KPI_MOCK.sparkMutiroes,
    color: '#E8B84A',
  },
  {
    label: 'Apoios no feed',
    value: KPI_MOCK.usuariosApp,
    spark: KPI_MOCK.sparkUsuarios,
    color: '#2A6B7C',
  },
];

function KpiCard({
  label,
  value,
  spark,
  color,
  suffix,
}: {
  label: string;
  value: number;
  spark: number[];
  color: string;
  suffix?: string;
}) {
  const animated = useCountUp(value, 1400);
  return (
    <div className="flex items-end justify-between rounded-2xl border border-folha-muted/30 bg-white px-4 py-4 shadow-soft">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-tinta-faint">
          {label}
        </p>
        <p className="mt-1 font-display text-3xl font-semibold text-folha">
          {animated.toLocaleString('pt-BR')}
          {suffix ? (
            <span className="text-base font-medium text-tinta-muted">
              {suffix}
            </span>
          ) : null}
        </p>
      </div>
      <Sparkline values={spark} color={color} />
    </div>
  );
}

export default function GestaoDashboardPage() {
  const { data: mapaPontos = [] } = useMapaPontos();
  const { extra } = useEngagement();
  const { data: mutiroes = [] } = useMutiroes();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gestão pública"
        title="Painel · Teresina"
        description={`Inteligência territorial · ${SEMAM.sigla} / Prefeitura`}
      />

      <div className="vu-enter grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            spark={k.spark}
            color={k.color}
          />
        ))}
      </div>

      <div className="vu-enter grid gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-folha-muted/30 bg-white shadow-soft xl:col-span-2">
          <div className="border-b border-folha-muted/25 px-4 py-3">
            <h2 className="font-display text-lg font-semibold text-folha">
              Prioridade de arborização
            </h2>
            <p className="text-xs text-tinta-muted">
              Copa (ESA WorldCover) × temperatura de superfície (Landsat) · pedidos da comunidade
            </p>
          </div>
          <div className="h-[360px] p-3">
            <Mapa
              className="h-full w-full rounded-xl"
              pontos={mapaPontos}
              lente="prioridade"
              showAreas={false}
              quiet
              showControls
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-folha-muted/30 bg-white p-4 shadow-soft">
            <h2 className="font-display text-base font-semibold text-folha">
              Tipos de demanda
            </h2>
            <div className="mt-2 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={TIPOS_DEMANDA_CHART}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={100}
                    tick={{ fontSize: 10, fill: '#4A5C52' }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="valor" fill="#1A5C3A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-folha-muted/30 bg-white p-4 shadow-soft">
            <h2 className="font-display text-base font-semibold text-folha">
              Status
            </h2>
            <div className="mt-2 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATUS_CHART}
                    dataKey="valor"
                    nameKey="nome"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {STATUS_CHART.map((s) => (
                      <Cell key={s.nome} fill={s.cor} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1.5">
              {STATUS_CHART.map((s) => (
                <li
                  key={s.nome}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-tinta-muted"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: s.cor }}
                    aria-hidden
                  />
                  {s.nome}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="vu-enter grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-folha-muted/30 bg-white shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between border-b border-folha-muted/25 px-4 py-3">
            <h2 className="font-display text-lg font-semibold text-folha">
              Próximos mutirões
            </h2>
            <Link
              href="/gestao/mutiroes"
              className="text-xs font-semibold text-folha hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto p-4">
            {mutiroes.length === 0 ? (
              <EmptyState
                title="Nenhum mutirão"
                description="Quando houver ações agendadas, elas aparecem aqui."
              />
            ) : (
              <table className="w-full min-w-[560px] text-left text-sm">
                <caption className="sr-only">Próximos mutirões</caption>
                <thead className="text-xs uppercase text-tinta-faint">
                  <tr>
                    <th className="pb-2"> </th>
                    <th className="pb-2">Data</th>
                    <th className="pb-2">Local</th>
                    <th className="pb-2">Tipo</th>
                    <th className="pb-2">Vol.</th>
                    <th className="pb-2">ONG</th>
                  </tr>
                </thead>
                <tbody>
                  {mutiroes.map((m) => (
                    <tr
                      key={m.id}
                      className="border-t border-folha-muted/25 transition hover:bg-sol/60"
                    >
                      <td className="py-2.5 pr-2">
                        <MutiraoCover compact foto={m.foto} />
                      </td>
                      <td className="py-2.5">
                        {format(parseISO(m.data), 'dd/MM', { locale: ptBR })}
                      </td>
                      <td className="py-2.5">
                        {m.local} — {m.bairro}
                      </td>
                      <td className="py-2.5">{m.tipo}</td>
                      <td className="py-2.5">
                        {m.voluntarios}/{m.capacidade}
                      </td>
                      <td className="py-2.5">{m.ong}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-folha-muted/30 bg-white p-4 shadow-soft">
            <h2 className="font-display text-base font-semibold text-folha">
              Prioridades
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {PRIORIDADES_BAIRRO.map((p) => (
                <li
                  key={p.demanda}
                  className="flex justify-between border-b border-folha-muted/20 pb-2"
                >
                  <span className="text-tinta-muted">{p.demanda}</span>
                  <span className="font-semibold text-folha">
                    {p.score.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-folha-muted/30 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-folha">
                Espécies
              </h2>
              <Link
                href="/gestao/projetos"
                className="text-xs font-semibold text-folha hover:underline"
              >
                Curadoria
              </Link>
            </div>
            <ul className="mt-3 space-y-2.5 text-sm">
              {ESPECIES_NATIVAS_PIAUI.slice(0, 4).map((e) => (
                <li key={e.id} className="flex items-center gap-2.5">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-folha to-rio">
                    {e.foto ? (
                      <Image
                        src={e.foto}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="font-medium text-tinta">{e.nome}</span>
                    <span className="block truncate font-display text-xs italic text-tinta-faint">
                      {e.cientifico}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-tinta-faint">
              Apoios locais no aparelho:{' '}
              {mapaPontos
                .filter((p) => !p.heatOnly)
                .reduce((n, p) => n + extra(p.id), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
