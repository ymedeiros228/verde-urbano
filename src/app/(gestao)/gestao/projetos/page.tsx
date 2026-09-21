import { ESPECIES_NATIVAS_PIAUI } from '@/lib/map/terezina';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function GestaoEspeciesPage() {
  const list = ESPECIES_NATIVAS_PIAUI;

  return (
    <div className="vu-enter space-y-4">
      <PageHeader
        title="Espécies / curadoria"
        description="Catálogo técnico para o piloto em Teresina — sem projetos inventados. Validar com SEMAM / ONG."
      />
      {list.length === 0 ? (
        <EmptyState
          title="Sem espécies"
          description="A curadoria ainda não foi preenchida."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <article
              key={e.id}
              className="overflow-hidden rounded-2xl border border-folha-muted/30 bg-white shadow-soft"
            >
              <div className="flex h-14 items-end bg-gradient-to-br from-folha to-rio p-3">
                <Badge className="!border-white/30 !bg-white/20 !text-white normal-case">
                  {e.porte}
                </Badge>
              </div>
              <div className="p-4">
                <p className="font-semibold text-folha">{e.nome}</p>
                <p className="font-display text-sm italic text-tinta-faint">
                  {e.cientifico}
                </p>
                <p className="mt-2 text-xs uppercase tracking-wide text-folha-light">
                  raiz {e.raiz} · sombra {e.sombra}
                </p>
                {e.observacao && (
                  <p className="mt-2 line-clamp-2 text-sm text-tinta-muted">
                    {e.observacao}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
