'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Sun, Sprout, TreeDeciduous } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import type { EspecieNativa } from '@/lib/map/terezina';
import { cn } from '@/lib/utils/cn';

const PORTE = { pequeno: 'Pequeno porte', medio: 'Médio porte', grande: 'Grande porte' } as const;
const PORTE_N = { pequeno: 1, medio: 2, grande: 3 } as const;
const SOMBRA_N = { baixa: 1, media: 2, alta: 3 } as const;
const RAIZ = {
  pivotante: 'Raiz pivotante — cresce para baixo, amiga da calçada',
  superficial: 'Raiz superficial — precisa de canteiro largo',
  mista: 'Raiz mista — pede espaço moderado',
} as const;

/** 3 pontinhos: nível visual de 1 a 3 */
function Nivel({ n, cor, vazio = 'rgba(28,43,34,0.12)' }: { n: number; cor: string; vazio?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-1.5 w-3 rounded-full"
          style={{ background: i <= n ? cor : vazio }}
        />
      ))}
    </span>
  );
}

export function EspeciesGaleria({ especies }: { especies: EspecieNativa[] }) {
  const [aberta, setAberta] = useState<EspecieNativa | null>(null);

  return (
    <>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {especies.map((e, i) => (
          <li key={e.id} className="vu-stagger" style={{ animationDelay: `${i * 40}ms` }}>
            <button
              type="button"
              onClick={() => setAberta(e)}
              className="group relative block aspect-[3/4] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-folha to-rio text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(28,43,34,0.35)] focus-visible:ring-2 focus-visible:ring-folha/50"
            >
              {e.foto && (
                <Image
                  src={e.foto}
                  alt={`${e.nome} (${e.cientifico})`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-[#0c2417]/90 via-[#0c2417]/25 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[10.5px] font-semibold text-white ring-1 ring-inset ring-white/30 backdrop-blur-md">
                {PORTE[e.porte]}
              </span>
              <span className="absolute inset-x-0 bottom-0 p-3.5">
                <span className="block font-display text-lg font-semibold leading-tight text-white">
                  {e.nome}
                </span>
                <span className="block truncate text-[11.5px] italic text-white/70">{e.cientifico}</span>
                <span className="mt-2 flex items-center gap-2 text-[10.5px] font-medium text-white/85">
                  <Sun className="h-3 w-3" />
                  <Nivel n={SOMBRA_N[e.sombra]} cor="#F5D98A" vazio="rgba(255,255,255,0.28)" />
                  <span>sombra</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <BottomSheet open={Boolean(aberta)} onClose={() => setAberta(null)} title={aberta?.nome}>
        {aberta && (
          <div className="space-y-4">
            <div className="relative -mx-1 aspect-[4/3] overflow-hidden rounded-2xl bg-folha">
              {aberta.foto && (
                <Image
                  src={aberta.foto}
                  alt={aberta.nome}
                  fill
                  sizes="(max-width: 768px) 100vw, 28rem"
                  className="object-cover"
                />
              )}
            </div>
            <p className="font-display text-sm italic text-tinta-muted">{aberta.cientifico}</p>
            <dl className="grid gap-2">
              {[
                { icon: TreeDeciduous, label: 'Porte', valor: PORTE[aberta.porte], n: PORTE_N[aberta.porte], cor: '#2D8A58' },
                { icon: Sun, label: 'Sombra', valor: `Sombra ${aberta.sombra}`, n: SOMBRA_N[aberta.sombra], cor: '#E8B84A' },
              ].map(({ icon: Icon, label, valor, n, cor }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl bg-sol px-3 py-2.5">
                  <Icon className="h-4 w-4 text-folha" />
                  <dt className="sr-only">{label}</dt>
                  <dd className="flex-1 text-sm font-medium text-tinta">{valor}</dd>
                  <Nivel n={n} cor={cor} />
                </div>
              ))}
              <div className="flex items-start gap-3 rounded-2xl bg-sol px-3 py-2.5">
                <Sprout className="mt-0.5 h-4 w-4 text-folha" />
                <dd className="text-sm text-tinta">{RAIZ[aberta.raiz]}</dd>
              </div>
            </dl>
            {aberta.observacao && (
              <p className={cn('rounded-2xl border-l-4 border-ipe bg-ipe/10 px-3 py-2.5 text-sm leading-relaxed text-tinta')}>
                {aberta.observacao}
              </p>
            )}
            <p className="text-[11px] text-tinta-faint">
              Foto: Wikimedia Commons (licenças CC, créditos em /especies/CREDITOS.txt). Mudas grátis nos viveiros municipais — até 5 por CPF.
            </p>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
