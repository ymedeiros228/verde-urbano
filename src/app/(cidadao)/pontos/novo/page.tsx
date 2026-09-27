'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { useToast } from '@/components/ui/Toast';
import {
  TIPOS_PONTO,
  type TipoPonto,
  BAIRROS_PRIORITARIOS,
} from '@/lib/map/terezina';

const STEPS = [
  { id: 'tipo', label: 'Tipo' },
  { id: 'gps', label: 'GPS' },
  { id: 'foto', label: 'Foto' },
  { id: 'revisar', label: 'Revisar' },
];

export default function NovoPontoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoPonto>('terreno_baldio');
  const [bairro, setBairro] = useState<string>(BAIRROS_PRIORITARIOS[0]);
  const [descricao, setDescricao] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function capturarGPS() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocalização não disponível neste dispositivo.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setGeoError('Não foi possível obter GPS. Permita a localização.'),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  function onFoto(file: File | null) {
    if (!file) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit() {
    if (!coords) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const { addLocalPonto } = await import('@/lib/localPontos');
    const ponto = addLocalPonto({
      titulo: titulo.trim(),
      descricao: descricao.trim() || 'Ponto mapeado pelo cidadão (demo local).',
      local: `${bairro} — GPS`,
      bairro,
      tipo,
      urgencia: tipo === 'terreno_baldio' ? 82 : 68,
      lng: coords.lng,
      lat: coords.lat,
      foto: preview || undefined,
      necessidades: ['Análise SEMAM'],
    });
    setSaving(false);
    toast('Ponto no mapa — aparece neste aparelho', 'folha');
    router.push(`/mapear?ponto=${encodeURIComponent(ponto.id)}`);
  }

  function canNext() {
    if (step === 0) return Boolean(titulo.trim());
    if (step === 1) return Boolean(coords);
    return true;
  }

  return (
    <div className="mx-auto max-w-lg p-4 md:max-w-xl md:px-6 md:pb-10 md:pt-8">
      <PageHeader
        title="Mapear novo local"
        description="Tipo → GPS → Foto → Revisar"
      />
      <ProgressStepper
        className="mt-6"
        steps={STEPS}
        currentIndex={step}
      />

      <div className="vu-enter mt-6 space-y-4">
        {step === 0 && (
          <>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-tinta-faint">
                Título
              </span>
              <Input
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Terreno na Rua Projetada B"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-tinta-faint">
                Tipo
              </span>
              <Select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoPonto)}
              >
                {(Object.keys(TIPOS_PONTO) as TipoPonto[]).map((k) => (
                  <option key={k} value={k}>
                    {TIPOS_PONTO[k].label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-tinta-faint">
                Bairro
              </span>
              <Select
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              >
                {BAIRROS_PRIORITARIOS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-tinta-faint">
                Descrição
              </span>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                placeholder="O que precisa melhorar neste local?"
              />
            </label>
          </>
        )}

        {step === 1 && (
          <div className="space-y-3 rounded-2xl border border-folha-muted/30 bg-white p-5 shadow-soft">
            <p className="text-sm text-tinta-muted">
              Use o GPS do aparelho para marcar o ponto com precisão.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={capturarGPS}
            >
              Capturar GPS
            </Button>
            {coords && (
              <p className="rounded-xl bg-folha/5 px-3 py-2 text-sm font-medium text-folha">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            )}
            {geoError && <p className="text-xs text-laterita">{geoError}</p>}
          </div>
        )}

        {step === 2 && (
          <FileDropzone preview={preview} onFile={onFoto} />
        )}

        {step === 3 && (
          <div className="space-y-3 rounded-2xl border border-folha-muted/30 bg-white p-5 shadow-soft">
            <p className="font-display text-lg font-semibold text-folha">
              {titulo}
            </p>
            <p className="text-sm text-tinta-muted">
              {TIPOS_PONTO[tipo].label} · {bairro}
            </p>
            {descricao && (
              <p className="text-sm text-tinta">{descricao}</p>
            )}
            {coords && (
              <p className="text-xs text-folha">
                GPS {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            )}
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="h-32 w-full rounded-xl object-cover"
              />
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setStep((s) => s - 1)}
          >
            Voltar
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            className="flex-1"
            disabled={!canNext()}
            onClick={() => setStep((s) => s + 1)}
          >
            Continuar
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1"
            disabled={saving || !titulo}
            onClick={onSubmit}
          >
            {saving ? 'Salvando…' : 'Registrar ponto'}
          </Button>
        )}
      </div>
    </div>
  );
}
