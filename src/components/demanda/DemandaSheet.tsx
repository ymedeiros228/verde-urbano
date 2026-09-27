'use client';

import Link from 'next/link';
import { ArrowUp, CheckCircle2, ClipboardCheck, Trees } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { DemandaCover } from '@/components/demanda/DemandaCover';
import { STATUS_PONTO, TIPOS_PONTO } from '@/lib/map/terezina';
import type { Demanda } from '@/lib/data/mock';

interface DemandaSheetProps {
  demanda: Demanda | null;
  open: boolean;
  onClose: () => void;
  votos: number;
  showApoiar?: boolean;
  onApoiar?: () => void;
  detailHref?: string;
  /** Triagem SEMAM/SDU (demo gestão) */
  showTriagem?: boolean;
  onTriagem?: (
    action: 'aprovar' | 'mutirao' | 'concluir'
  ) => void;
}

export function DemandaSheet({
  demanda,
  open,
  onClose,
  votos,
  showApoiar = true,
  onApoiar,
  detailHref,
  showTriagem = false,
  onTriagem,
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
          {demanda.autor && (
            <p className="flex items-center gap-2 text-xs text-tinta-muted">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-folha to-rio text-[10px] font-semibold text-white">
                {demanda.autor.nome.slice(0, 1).toUpperCase()}
              </span>
              Marcado por <span className="font-semibold text-tinta">{demanda.autor.nome}</span>
              {demanda.criadoEm &&
                ` · ${new Date(demanda.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge tone="folha">{TIPOS_PONTO[demanda.tipo].label}</Badge>
            <Badge tone="muted">{STATUS_PONTO[demanda.status].label}</Badge>
            <Badge tone="laterita">Urgência {demanda.urgencia}</Badge>
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
            {showTriagem && onTriagem && (
              <div className="space-y-2 rounded-xl border border-folha-muted/30 bg-sol/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-folha">
                  Triagem · demo SEMAM
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    disabled={demanda.status === 'aprovado'}
                    onClick={() => onTriagem('aprovar')}
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    disabled={demanda.status === 'em_mutirao'}
                    onClick={() => onTriagem('mutirao')}
                  >
                    <Trees className="h-4 w-4" />
                    Em mutirão
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={demanda.status === 'concluido'}
                    onClick={() => onTriagem('concluir')}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Concluir
                  </Button>
                </div>
              </div>
            )}
            {showApoiar && onApoiar && (
              <Button className="w-full" onClick={onApoiar}>
                <ArrowUp className="h-4 w-4" />
                Apoiar ({votos.toLocaleString('pt-BR')})
              </Button>
            )}
            <Link href={href} onClick={onClose}>
              <Button
                variant={showApoiar || showTriagem ? 'secondary' : 'primary'}
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
