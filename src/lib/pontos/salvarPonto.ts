'use client';

import type { User } from '@supabase/supabase-js';
import type { Perfil } from '@/components/providers/AuthProvider';
import type { Demanda } from '@/lib/data/mock';
import type { TipoPonto } from '@/lib/map/terezina';
import { addLocalPonto } from '@/lib/localPontos';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';
import { mapRow } from '@/hooks/useDemandas';

export interface NovoPonto {
  titulo: string;
  descricao: string;
  tipo: TipoPonto;
  bairro: string;
  lng: number;
  lat: number;
  urgencia: number;
  necessidades: string[];
}

/** Reduz a foto do celular (5–10 MB) para JPEG leve, já corrigindo a orientação */
export async function comprimirFoto(file: File, max = 1280, quality = 0.74): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao processar a foto'))), 'image/jpeg', quality)
  );
}

function blobToDataURL(b: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(b);
  });
}

/**
 * Salva o ponto assinado pelo perfil.
 * Com Supabase: foto no Storage (bucket `fotos`) + linha em `pontos` com user_id.
 * Sem Supabase (demo): fica neste aparelho, foto comprimida em dataURL.
 */
export async function salvarPonto(
  input: NovoPonto,
  ctx: { user: User | null; perfil: Perfil | null; foto: File }
): Promise<Demanda> {
  const autor = ctx.perfil ?? { nome: ctx.user?.email?.split('@')[0] ?? 'Cidadão' };
  const online = isSupabaseConfigured() && ctx.user && ctx.user.id !== 'demo';

  if (online && ctx.user) {
    const supabase = createClient();
    const blob = await comprimirFoto(ctx.foto);
    const path = `${ctx.user.id}/${Date.now()}.jpg`;
    const up = await supabase.storage.from('fotos').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (up.error) throw new Error(`Não foi possível enviar a foto: ${up.error.message}`);
    const foto_url = supabase.storage.from('fotos').getPublicUrl(path).data.publicUrl;
    const { data, error } = await supabase
      .from('pontos')
      .insert({
        user_id: ctx.user.id,
        autor_nome: autor.nome,
        titulo: input.titulo,
        descricao: input.descricao,
        local: input.bairro,
        bairro: input.bairro,
        tipo: input.tipo,
        urgencia: input.urgencia,
        lng: input.lng,
        lat: input.lat,
        foto_url,
        necessidades: input.necessidades,
        badge: 'Novo',
        badge_tone: 'folha',
      })
      .select()
      .single();
    if (error) throw new Error(`Não foi possível salvar: ${error.message}`);
    return mapRow(data);
  }

  const foto = await blobToDataURL(await comprimirFoto(ctx.foto, 900, 0.7));
  return addLocalPonto({
    titulo: input.titulo,
    descricao: input.descricao,
    local: input.bairro,
    bairro: input.bairro,
    tipo: input.tipo,
    urgencia: input.urgencia,
    lng: input.lng,
    lat: input.lat,
    foto,
    necessidades: input.necessidades,
    autor,
    criadoEm: new Date().toISOString(),
  });
}
