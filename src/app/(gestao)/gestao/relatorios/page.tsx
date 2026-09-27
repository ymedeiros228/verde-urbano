'use client';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/Toast';
import { useDemandas } from '@/hooks/useDemandas';
import { downloadDemandasGeoJSON } from '@/lib/map/exportGeoJSON';
import { KPI_MOCK } from '@/lib/data/mock';
import { FileDown, Printer, BarChart3 } from 'lucide-react';

export default function GestaoRelatoriosPage() {
  const { data: demandas = [] } = useDemandas();
  const { toast } = useToast();
  const pontos = demandas.filter((d) => !d.heatOnly);

  return (
    <div className="vu-enter space-y-6">
      <PageHeader
        title="Relatórios"
        description="Material para banca e Prefeitura — KPI, GeoJSON e vista imprimível."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-folha-muted/30 bg-white p-5 shadow-soft">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-folha/10 text-folha">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold text-folha">
            Resumo KPI
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm text-tinta">
            <li>
              Demandas no piloto:{' '}
              <strong>{KPI_MOCK.demandasAtivas.toLocaleString('pt-BR')}</strong>
            </li>
            <li>
              Pontos no mapa: <strong>{pontos.length}</strong>
            </li>
            <li>
              Mudas (mutirões):{' '}
              <strong>
                {KPI_MOCK.arvoresPlantadas.toLocaleString('pt-BR')}
              </strong>
            </li>
            <li>
              Apoios no feed:{' '}
              <strong>{KPI_MOCK.usuariosApp.toLocaleString('pt-BR')}</strong>
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-folha-muted/30 bg-white p-5 shadow-soft">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rio/10 text-rio">
            <FileDown className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold text-folha">
            Export GeoJSON
          </h3>
          <p className="mt-2 text-sm text-tinta-muted">
            Camada de demandas para QGIS / MapLibre / apresentação técnica.
          </p>
          <Button
            className="mt-4"
            size="sm"
            onClick={() => {
              downloadDemandasGeoJSON(pontos);
              toast('demandas.geojson baixado', 'folha');
            }}
          >
            Baixar demandas.geojson
          </Button>
        </article>

        <article className="rounded-2xl border border-folha-muted/30 bg-white p-5 shadow-soft print:border-0 print:shadow-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ipe/20 text-tinta">
            <Printer className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold text-folha">
            Vista imprimível
          </h3>
          <p className="mt-2 text-sm text-tinta-muted">
            Abra a impressão do navegador para anexar à documentação da banca.
          </p>
          <Button
            className="mt-4"
            size="sm"
            variant="secondary"
            onClick={() => window.print()}
          >
            Imprimir / PDF
          </Button>
        </article>
      </div>

      <div className="hidden print:block">
        <h2 className="font-display text-xl font-semibold">
          Verde Urbano — Relatório de extensão
        </h2>
        <p className="mt-2 text-sm">
          Demandas no piloto: {KPI_MOCK.demandasAtivas} · Pontos: {pontos.length}{' '}
          · Mutirões: {KPI_MOCK.mutiroesAgendados} · Apoios:{' '}
          {KPI_MOCK.usuariosApp}
        </p>
      </div>
    </div>
  );
}
