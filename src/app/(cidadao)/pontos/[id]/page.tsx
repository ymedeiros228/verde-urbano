'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowUp, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { DemandaCover } from '@/components/demanda/DemandaCover';
import { DemandaTile } from '@/components/feed/DemandaTile';
import { FeedRail } from '@/components/feed/FeedRail';
import { useToast } from '@/components/ui/Toast';
import { useDemandas } from '@/hooks/useDemandas';
import { useEngagement } from '@/hooks/useEngagement';
import {
  DEMANDAS_MOCK,
  DEMANDA_STEPS_ANALISE,
  DEMANDA_STEPS_DEFAULT,
  stepIndex,
} from '@/lib/data/mock';
import { STATUS_PONTO } from '@/lib/map/terezina';
import { QuadraRaioX } from '@/components/mapa/QuadraRaioX';

export default function PontoDetalhePage() {
  const params = useParams();
  const id = String(params.id);
  const { data } = useDemandas();
  const { toast } = useToast();
  const { apoiar, extra } = useEngagement();

  const demanda =
    data?.find((d) => d.id === id) || DEMANDAS_MOCK.find((d) => d.id === id);

  const sameBairro = useMemo(() => {
    if (!demanda || !data) return [];
    return data
      .filter(
        (d) => !d.heatOnly && d.id !== demanda.id && d.bairro === demanda.bairro
      )
      .slice(0, 8);
  }, [data, demanda]);

  if (!demanda) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <EmptyState
          title="Ponto não encontrado"
          description="Este local pode ter sido removido ou o link está incorreto."
          actionHref="/feed"
          actionLabel="Voltar ao feed"
        />
      </div>
    );
  }

  const votos = demanda.votos + extra(demanda.id);
  const steps =
    demanda.step === 'analise' ? DEMANDA_STEPS_ANALISE : DEMANDA_STEPS_DEFAULT;
  const current =
    demanda.step === 'analise'
      ? 1
      : Math.min(stepIndex(demanda.step), steps.length - 1);
  const hasMutirao = demanda.step === 'mutirao' || Boolean(demanda.mutiraoData);

  return (
    <div className="vu-enter pb-[calc(var(--cidadao-nav-h)+4.5rem+env(safe-area-inset-bottom))] md:mx-auto md:max-w-2xl md:px-6 md:pb-10 md:pt-8">
      <div className="overflow-hidden md:rounded-2xl">
        <DemandaCover
          tall
          tipo={demanda.tipo}
          local={demanda.local}
          bairro={demanda.bairro}
          foto={demanda.foto}
          votos={votos}
        />
      </div>
      <div className="space-y-4 p-4 md:px-0 md:pt-6">
        {demanda.badge && (
          <Badge tone={demanda.badgeTone || 'folha'} className="normal-case">
            {demanda.badge}
          </Badge>
        )}
        <h1 className="font-display text-2xl font-semibold text-folha md:text-3xl">
          {demanda.titulo}
        </h1>
        {demanda.autor && (
          <p className="flex items-center gap-2 text-sm text-tinta-muted">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-folha to-rio text-xs font-semibold text-white">
              {demanda.autor.nome.slice(0, 1).toUpperCase()}
            </span>
            Marcado por <span className="font-semibold text-tinta">{demanda.autor.nome}</span>
          </p>
        )}
        <p className="leading-relaxed text-tinta">{demanda.descricao}</p>

        <QuadraRaioX demanda={demanda} />

        {hasMutirao && (
          <div className="rounded-2xl border border-ipe/40 bg-ipe/15 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-tinta">
              Mutirão agendado
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-folha">
              {demanda.mutiraoData || 'Em breve'}
            </p>
            <Link href="/mutiroes" className="mt-3 inline-block">
              <Button size="sm" variant="ipe">
                Ver agenda de mutirões
              </Button>
            </Link>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-tinta">Progresso</h2>
          <ProgressStepper
            className="mt-2"
            steps={steps}
            currentIndex={current}
          />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-tinta">Necessidades</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {demanda.necessidades.map((n) => (
              <Badge key={n} tone="muted" className="normal-case">
                {n}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="laterita">Urgência {demanda.urgencia}</Badge>
          <Badge tone="muted">{STATUS_PONTO[demanda.status].label}</Badge>
        </div>
      </div>

      {sameBairro.length > 0 && (
        <div className="mt-2 md:-mx-6">
          <FeedRail title={`No mesmo bairro · ${demanda.bairro.split(' ')[0]}`}>
            {sameBairro.map((d) => (
              <div key={d.id} className="snap-start">
                <DemandaTile
                  demanda={{
                    ...d,
                    votos: d.votos + extra(d.id),
                  }}
                />
              </div>
            ))}
          </FeedRail>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-[calc(var(--cidadao-nav-h)+env(safe-area-inset-bottom))] z-40 border-t border-folha-muted/30 bg-white/95 p-3 backdrop-blur md:static md:mt-6 md:rounded-2xl md:border md:p-4">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Button
            className="flex-1"
            onClick={() => {
              apoiar(demanda.id);
              toast('Apoio registrado — obrigado!', 'folha');
            }}
          >
            <ArrowUp className="h-4 w-4" />
            Apoiar ({votos.toLocaleString('pt-BR')})
          </Button>
          <Link href={`/mapear?ponto=${demanda.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <MapPin className="h-4 w-4" />
              Ver no mapa
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
