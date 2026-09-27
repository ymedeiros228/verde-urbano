'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, ImagePlus, Loader2, RefreshCw, Thermometer, Trees } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useAuth } from '@/components/providers/AuthProvider';
import { TIPOS_PONTO, type TipoPonto } from '@/lib/map/terezina';
import { TIPO_ICON } from '@/lib/map/tipoIcons';
import { salvarPonto } from '@/lib/pontos/salvarPonto';
import type { HexProps } from '@/lib/map/verde';
import type { Demanda } from '@/lib/data/mock';
import { cn } from '@/lib/utils/cn';

const TIPOS: TipoPonto[] = ['terreno_baldio', 'canteiro', 'praca', 'lazer_infantil', 'outro'];

const SUGESTAO: Record<TipoPonto, string> = {
  terreno_baldio: 'Terreno sem sombra',
  canteiro: 'Canteiro para arborizar',
  praca: 'Praça precisando de árvores',
  lazer_infantil: 'Área das crianças sem sombra',
  outro: 'Local para arborizar',
};

const NECESSIDADES = ['Plantio', 'Limpeza', 'Rega', 'Bancos', 'Iluminação', 'Poda'];

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function MarcarPontoSheet({
  open,
  onClose,
  lngLat,
  hex,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  lngLat: [number, number] | null;
  hex: HexProps | null;
  onSaved: (d: Demanda) => void;
}) {
  const { user, perfil, loading } = useAuth();
  const [tipo, setTipo] = useState<TipoPonto>('terreno_baldio');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precisa, setPrecisa] = useState<string[]>(['Plantio']);
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);

  const bairro = hex?.bairro ?? perfil?.bairro ?? 'Teresina';

  useEffect(() => {
    if (!open) return;
    setErro(null);
    setTitulo('');
  }, [open]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const tituloFinal = titulo.trim() || `${SUGESTAO[tipo]} — ${bairro}`;
  // urgência parte do índice real de satélite da quadra
  const urgencia = useMemo(
    () => Math.max(hex?.urbano ? hex.prioridade : 50, tipo === 'terreno_baldio' ? 70 : 55),
    [hex, tipo]
  );

  function onFoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErro('Escolha uma imagem.');
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFoto(file);
    setPreview(URL.createObjectURL(file));
    setErro(null);
  }

  async function enviar() {
    if (!lngLat || !foto) return;
    setSalvando(true);
    setErro(null);
    try {
      const d = await salvarPonto(
        {
          titulo: tituloFinal,
          descricao: descricao.trim() || 'Local marcado pela comunidade com foto do lugar.',
          tipo,
          bairro,
          lng: lngLat[0],
          lat: lngLat[1],
          urgencia,
          necessidades: precisa,
        },
        { user, perfil, foto }
      );
      setFoto(null);
      setPreview(null);
      setDescricao('');
      onSaved(d);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  if (!loading && !user) {
    return (
      <BottomSheet open={open} onClose={onClose} title="Entre para marcar">
        <p className="text-sm leading-relaxed text-tinta-muted">
          Cada ponto é assinado por quem marcou — é isso que dá credibilidade ao pedido quando ele
          chega na SEMAM. Leva 30 segundos.
        </p>
        <div className="mt-5 grid gap-2">
          <Link
            href="/cadastro?next=/mapear"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-folha text-sm font-semibold text-white"
          >
            Criar conta
          </Link>
          <Link
            href="/login?next=/mapear"
            className="inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold text-folha ring-1 ring-inset ring-folha/25"
          >
            Já tenho conta
          </Link>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Novo ponto no mapa">
      <div className="space-y-5">
        {/* Autor + contexto da quadra */}
        <div className="flex items-center gap-3 rounded-2xl bg-sol p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-folha to-rio font-display text-sm font-semibold text-white">
            {iniciais(perfil?.nome ?? user?.email ?? 'VU')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-tinta">
              {perfil?.nome ?? user?.email?.split('@')[0]}
            </p>
            <p className="truncate text-xs text-tinta-muted">
              Marcando em <span className="font-medium text-tinta">{bairro}</span>
            </p>
          </div>
          {hex && (
            <div className="flex shrink-0 flex-col items-end gap-0.5 text-[11px] tabular-nums text-tinta-muted">
              <span className="inline-flex items-center gap-1">
                <Trees className="h-3 w-3 text-folha-light" />
                {hex.copa.toLocaleString('pt-BR')}%
              </span>
              {hex.temp != null && (
                <span className="inline-flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-laterita" />
                  {hex.temp.toLocaleString('pt-BR')}°
                </span>
              )}
            </div>
          )}
        </div>

        {/* Foto real */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-faint">
            Foto do local <span className="text-laterita">*</span>
          </p>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => onFoto(e.target.files?.[0])}
          />
          <input
            ref={galeriaRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onFoto(e.target.files?.[0])}
          />
          {preview ? (
            <div className="vu-card-in relative overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob local */}
              <img src={preview} alt="Foto do local" className="aspect-[4/3] w-full object-cover" />
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Trocar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-[1.6fr_1fr] gap-2">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-folha/30 bg-folha/5 text-folha transition hover:bg-folha/10 active:scale-[0.99]"
              >
                <Camera className="h-7 w-7" />
                <span className="text-sm font-semibold">Tirar foto agora</span>
              </button>
              <button
                type="button"
                onClick={() => galeriaRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-folha-muted/40 text-tinta-muted transition hover:bg-sol"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-semibold">Galeria</span>
              </button>
            </div>
          )}
        </div>

        {/* Tipo */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-faint">O que é o local</p>
          <div className="flex flex-wrap gap-1.5">
            {TIPOS.map((t) => {
              const Icon = TIPO_ICON[t];
              const on = t === tipo;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  aria-pressed={on}
                  className={cn(
                    'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition active:scale-95',
                    on ? 'text-white shadow-soft' : 'bg-sol text-tinta-muted hover:text-tinta'
                  )}
                  style={on ? { background: TIPOS_PONTO[t].color } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {TIPOS_PONTO[t].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demanda */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-tinta-faint">A demanda</p>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder={tituloFinal}
            maxLength={90}
            className="h-11 w-full rounded-xl bg-sol px-3.5 text-sm text-tinta outline-none ring-1 ring-inset ring-folha-muted/25 placeholder:text-tinta-faint focus:bg-white focus:ring-folha/40"
          />
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="O que você viu? Ex.: calçada sem nenhuma árvore, crianças brincando no sol…"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl bg-sol px-3.5 py-3 text-sm text-tinta outline-none ring-1 ring-inset ring-folha-muted/25 placeholder:text-tinta-faint focus:bg-white focus:ring-folha/40"
          />
          <div className="flex flex-wrap gap-1.5">
            {NECESSIDADES.map((n) => {
              const on = precisa.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPrecisa((l) => (on ? l.filter((x) => x !== n) : [...l, n]))}
                  className={cn(
                    'h-8 rounded-full px-3 text-xs font-medium transition',
                    on ? 'bg-folha/10 text-folha ring-1 ring-inset ring-folha/30' : 'text-tinta-muted ring-1 ring-inset ring-folha-muted/30'
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        {erro && <p className="rounded-xl bg-laterita/10 px-3 py-2 text-sm text-laterita">{erro}</p>}

        <button
          type="button"
          onClick={enviar}
          disabled={!foto || salvando}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-folha text-sm font-semibold text-white shadow-[0_10px_24px_rgba(26,92,58,0.3)] transition hover:bg-folha-light active:scale-[0.99] disabled:opacity-40 disabled:shadow-none"
        >
          {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {salvando ? 'Publicando…' : foto ? 'Publicar no mapa' : 'Adicione uma foto para publicar'}
        </button>
      </div>
    </BottomSheet>
  );
}
