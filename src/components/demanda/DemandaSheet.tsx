'use client';

import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { DemandaCover } from '@/components/demanda/DemandaCover';
import { TIPOS_PONTO, STATUS_PONTO } from '@/lib/map/terezina';
import type { Demanda } from '@/lib/data/mock';

interface DemandaSheetProps {
  demanda: Demanda | null;
  open: boolean;
  onClose: () => void;
  votos: number;
  showApoiar?: boolean;
  onApoiar?: () => void;
  detailHref?: string;
}

export function DemandaSheet({
  demanda,
  open,
  onClose,
  votos,
  showApoiar = true,
  onApoiar,
  detailHref,
}: DemandaSheetProps) {
  const href = detailHref || (demanda ? `/pontos/${demanda.id}` : '#');

  return (
    <BottomSheet open={open} onClose={onClose}>
      {demanda && (
        <div className="space-y-3">
          <div className="-mx-1 overflow-hidden rounded-2xl">
            <DemandaCover
              tipo={demanda.tipo}
              local={demanda.local}
              bairro={demanda.bairro}
              foto={demanda.foto}
              votos={votos}
              className="aspect-[16/10]"
            />
          </div>
          {demanda.badge && (
            <Badge
              tone={demanda.badgeTone || 'folha'}
              className="normal-case"
            >
              {demanda.badge}
            </Badge>
          )}
          <h2 className="font-display text-xl font-semibold text-folha">
            {demanda.titulo}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge tone="folha">{TIPOS_PONTO[demanda.tipo].label}</Badge>
            <Badge tone="laterita">Urgência {demanda.urgencia}</Badge>
            <Badge tone="muted">{STATUS_PONTO[demanda.status].label}</Badge>
            <Badge tone="folha">
              {votos.toLocaleString('pt-BR')} apoios
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-tinta">
            {demanda.descricao}
          </p>
          {demanda.necessidades?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {demanda.necessidades.map((n) => (
                <Badge key={n} tone="muted" className="normal-case">
                  {n}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2 pt-1">
            {showApoiar && onApoiar && (
              <Button className="w-full" onClick={onApoiar}>
                <ArrowUp className="h-4 w-4" />
                Apoiar ({votos.toLocaleString('pt-BR')})
              </Button>
            )}
            <Link href={href} onClick={onClose}>
              <Button
                variant={showApoiar ? 'secondary' : 'primary'}
                className="w-full"
              >
                Ver detalhes
              </Button>
            </Link>
            {(demanda.step === 'mutirao' || demanda.mutiraoData) && (
              <Link href="/mutiroes" onClick={onClose}>
                <Button variant="outline" className="w-full">
                  Ver mutirão
                  {demanda.mutiraoData ? ` · ${demanda.mutiraoData}` : ''}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
