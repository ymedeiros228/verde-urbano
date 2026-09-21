'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ExternalLink, Phone } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GUIAS_MOCK } from '@/lib/data/mock';
import { ESPECIES_NATIVAS_PIAUI } from '@/lib/map/terezina';
import {
  SEMAM,
  VIVEIROS_SEMAM,
  REGRAS_MUDAS_SEMAM,
  NOTICIAS_SEMAM,
  COMPETENCIAS_TERESINA,
  CANAIS_DENUNCIA,
  ORIENTACOES_ORGAOS,
  listOrgaosFlat,
} from '@/lib/data/semam';
import { Badge } from '@/components/ui/Badge';
import { SearchField } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils/cn';

const SECTIONS = [
  { id: 'semam', label: 'SEMAM' },
  { id: 'faq', label: 'FAQ' },
  { id: 'orgaos', label: 'Órgãos' },
  { id: 'denuncia', label: 'Denúncia' },
  { id: 'noticias', label: 'Notícias' },
  { id: 'viveiros', label: 'Viveiros' },
  { id: 'especies', label: 'Espécies' },
] as const;

function matchQuery(haystack: string, q: string) {
  return haystack.toLowerCase().includes(q);
}

function AccordionItem({
  pergunta,
  resposta,
  orgao,
  tags,
  onTag,
  defaultOpen,
}: {
  pergunta: string;
  resposta: string;
  orgao: string;
  tags: readonly string[];
  onTag: (t: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="overflow-hidden rounded-2xl border border-folha-muted/30 bg-white shadow-soft">
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-sol/60"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <Badge tone="ipe" className="normal-case">
            {orgao}
          </Badge>
          <p className="mt-1.5 font-display text-base font-semibold text-tinta">
            {pergunta}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 h-5 w-5 shrink-0 text-folha transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="border-t border-folha-muted/25 px-4 pb-4 pt-3">
          <p className="text-sm leading-relaxed text-tinta-muted">{resposta}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTag(t)}
                className="rounded-full bg-folha/5 px-2 py-0.5 text-[11px] text-folha hover:bg-folha/10"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuiasPage() {
  const [q, setQ] = useState('');
  const [activeTab, setActiveTab] = useState<string>('semam');
  const query = q.trim().toLowerCase();

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && SECTIONS.some((s) => s.id === hash)) {
      setActiveTab(hash);
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const esferas = [
    COMPETENCIAS_TERESINA.municipal,
    COMPETENCIAS_TERESINA.policial,
    COMPETENCIAS_TERESINA.estadual,
    COMPETENCIAS_TERESINA.controle,
  ];

  const filtered = useMemo(() => {
    if (!query) {
      return {
        orgaos: listOrgaosFlat(),
        orientacoes: [...ORIENTACOES_ORGAOS],
        canais: [...CANAIS_DENUNCIA],
        noticias: [...NOTICIAS_SEMAM],
        viveiros: [...VIVEIROS_SEMAM],
        guias: [...GUIAS_MOCK],
        especies: [...ESPECIES_NATIVAS_PIAUI],
      };
    }

    return {
      orgaos: listOrgaosFlat().filter((o) =>
        matchQuery(`${o.sigla} ${o.nome} ${o.papel} ${o.esfera}`, query)
      ),
      orientacoes: ORIENTACOES_ORGAOS.filter((o) =>
        matchQuery(
          `${o.pergunta} ${o.resposta} ${o.orgao} ${o.tags.join(' ')}`,
          query
        )
      ),
      canais: CANAIS_DENUNCIA.filter((c) =>
        matchQuery(`${c.titulo} ${c.como}`, query)
      ),
      noticias: NOTICIAS_SEMAM.filter((n) =>
        matchQuery(
          `${n.titulo} ${n.resumo} ${n.tags.join(' ')} ${n.fonte}`,
          query
        )
      ),
      viveiros: VIVEIROS_SEMAM.filter((v) =>
        matchQuery(`${v.nome} ${v.local} ${v.zona} ${v.destaque}`, query)
      ),
      guias: GUIAS_MOCK.filter((g) =>
        matchQuery(`${g.titulo} ${g.resumo} ${g.categoria}`, query)
      ),
      especies: ESPECIES_NATIVAS_PIAUI.filter((e) =>
        matchQuery(
          `${e.nome} ${e.cientifico} ${e.observacao ?? ''} ${e.porte}`,
          query
        )
      ),
    };
  }, [query]);

  const totalHits =
    filtered.orgaos.length +
    filtered.orientacoes.length +
    filtered.canais.length +
    filtered.noticias.length +
    filtered.viveiros.length +
    filtered.guias.length +
    filtered.especies.length;

  function goSection(id: string) {
    setActiveTab(id);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:px-6 md:pb-10 md:pt-8">
      <PageHeader
        eyebrow="App cidadão · Teresina"
        title="Guias & órgãos"
        description="Fontes oficiais SEMAM, Prefeitura, Defesa Civil, BPA e MPPI — busque por órgão, tema ou serviço."
      />

      <div className="sticky top-0 z-20 -mx-4 mt-4 space-y-2 border-b border-folha-muted/30 bg-sol/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-2xl md:border md:px-3">
        <SearchField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ex.: mudas, queimada, SEMAM, poda, 153…"
          aria-label="Pesquisar órgãos e orientações"
        />
        {query && (
          <p className="text-xs text-tinta-faint">
            {totalHits} resultado{totalHits === 1 ? '' : 's'} para “{q.trim()}”
          </p>
        )}
        <nav
          className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Seções dos guias"
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goSection(s.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                activeTab === s.id
                  ? 'bg-folha text-white'
                  : 'text-folha hover:bg-folha/10'
              )}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      {!query && (
        <div className="mt-3 flex flex-wrap gap-2">
          {['mudas', 'queimada', 'poda', 'SEMAM', '153', 'viveiro'].map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQ(tag)}
                className="rounded-full border border-folha/20 bg-folha/5 px-3 py-1 text-xs font-medium text-folha hover:bg-folha/10"
              >
                {tag}
              </button>
            )
          )}
        </div>
      )}

      {query && totalHits === 0 && (
        <EmptyState
          className="mt-6"
          title="Nada encontrado"
          description="Tente outro termo: mudas, queimada, SEMAM, poda, 153…"
        />
      )}

      {/* Hero SEMAM */}
      {(!query ||
        matchQuery(
          `${SEMAM.nome} ${SEMAM.sigla} ${SEMAM.missao} ${SEMAM.endereco}`,
          query
        )) && (
        <section
          id="semam"
          className="vu-enter mt-6 scroll-mt-28 overflow-hidden rounded-3xl bg-gradient-to-br from-folha via-folha-light to-rio p-6 text-white shadow-soft md:p-8"
        >
          <Badge className="!border-white/30 !bg-white/15 !text-white">
            {SEMAM.sigla}
          </Badge>
          <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
            {SEMAM.nome}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/85">{SEMAM.missao}</p>
          <ul className="mt-4 space-y-1 text-sm text-white/90">
            <li>{SEMAM.endereco}</li>
            <li>{SEMAM.horario}</li>
            <li className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {SEMAM.telefone}
            </li>
            <li>{SEMAM.email}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={SEMAM.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-folha"
            >
              Site oficial <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={SEMAM.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 underline-offset-2 hover:underline"
            >
              Instagram
            </a>
          </div>
        </section>
      )}

      {(filtered.orientacoes.length > 0 || !query) && (
        <section id="faq" className="vu-enter mt-10 scroll-mt-28">
          <h2 className="font-display text-xl font-semibold text-folha">
            Perguntas frequentes
          </h2>
          <p className="mt-1 text-sm text-tinta-muted">
            Respostas sintetizadas a partir de orientações oficiais.
          </p>
          <div className="mt-4 space-y-2">
            {filtered.orientacoes.map((o, i) => (
              <AccordionItem
                key={o.id}
                pergunta={o.pergunta}
                resposta={o.resposta}
                orgao={o.orgao}
                tags={o.tags}
                onTag={setQ}
                defaultOpen={!query && i === 0}
              />
            ))}
          </div>
        </section>
      )}

      <section id="orgaos" className="vu-enter mt-10 scroll-mt-28">
        <h2 className="font-display text-xl font-semibold text-folha">
          Quem fiscaliza e autoriza
        </h2>
        <p className="mt-1 text-sm text-tinta-muted">
          Competências por esfera — útil para cidadão e gestão.
        </p>
        {query ? (
          <ul className="mt-4 divide-y divide-folha-muted/25 overflow-hidden rounded-2xl border border-folha-muted/30 bg-white">
            {filtered.orgaos.map((o) => (
              <li key={`${o.sigla}-${o.esfera}`} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="rio">{o.sigla}</Badge>
                  <span className="text-[11px] uppercase text-tinta-faint">
                    {o.esfera}
                  </span>
                </div>
                <p className="mt-1 font-semibold text-tinta">{o.nome}</p>
                <p className="text-sm text-tinta-muted">{o.papel}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 space-y-5">
            {esferas.map((esfera) => (
              <div key={esfera.titulo}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-folha-light">
                  {esfera.titulo}
                </h3>
                <ul className="mt-2 divide-y divide-folha-muted/25 overflow-hidden rounded-2xl border border-folha-muted/30 bg-white">
                  {esfera.orgaos.map((o) => (
                    <li key={o.sigla} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge tone="rio">{o.sigla}</Badge>
                          <p className="mt-1 font-semibold text-tinta">
                            {o.nome}
                          </p>
                          <p className="text-sm text-tinta-muted">{o.papel}</p>
                        </div>
                        {'url' in o && o.url && (
                          <a
                            href={o.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-folha"
                            aria-label={`Site ${o.sigla}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="denuncia" className="vu-enter mt-10 scroll-mt-28">
        <h2 className="font-display text-xl font-semibold text-folha">
          Canais de denúncia
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {filtered.canais.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-folha-muted/30 bg-white p-4 shadow-soft"
            >
              <p className="font-semibold text-tinta">{c.titulo}</p>
              <p className="mt-1 text-sm text-tinta-muted">{c.como}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {'telefone' in c && c.telefone ? (
                  <a
                    href={`tel:${String(c.telefone).replace(/\D/g, '')}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-folha hover:underline"
                  >
                    <Phone className="h-3 w-3" /> {c.telefone}
                  </a>
                ) : null}
                {'url' in c && c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-folha hover:underline"
                  >
                    Acessar <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="noticias" className="vu-enter mt-10 scroll-mt-28">
        <h2 className="font-display text-xl font-semibold text-folha">
          Notícias oficiais
        </h2>
        <ul className="mt-3 divide-y divide-folha-muted/25 overflow-hidden rounded-2xl border border-folha-muted/30 bg-white">
          {filtered.noticias.map((n) => (
            <li key={n.id}>
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 px-4 py-3.5 transition hover:bg-sol/70"
              >
                <time className="w-20 shrink-0 text-xs font-semibold text-folha">
                  {format(parseISO(n.data), 'dd MMM', { locale: ptBR })}
                </time>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-tinta">{n.titulo}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-tinta-muted">
                    {n.resumo}
                  </p>
                </div>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-folha" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section id="viveiros" className="vu-enter mt-10 scroll-mt-28">
        <h2 className="font-display text-xl font-semibold text-folha">
          Viveiros municipais
        </h2>
        <p className="mt-1 text-sm text-tinta-muted">
          Até {REGRAS_MUDAS_SEMAM.limitePorPessoa} mudas por pessoa —{' '}
          {REGRAS_MUDAS_SEMAM.documentos.join('; ')}.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {filtered.viveiros.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl border border-folha-muted/30 bg-white p-4 shadow-soft"
            >
              <Badge tone="ipe">{v.zona}</Badge>
              <p className="mt-2 font-semibold">{v.nome}</p>
              <p className="text-sm text-tinta-muted">{v.local}</p>
              {'horario' in v && v.horario && (
                <p className="mt-1 text-xs text-folha">{v.horario}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="especies" className="vu-enter mt-10 scroll-mt-28">
        <h2 className="font-display text-xl font-semibold text-folha">
          Espécies em curadoria
        </h2>
        <p className="mt-1 text-sm text-tinta-muted">
          Nativas e adaptadas do Piauí — alinhado à distribuição de mudas.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.especies.map((e) => (
            <li
              key={e.id}
              className="overflow-hidden rounded-2xl border border-folha-muted/25 bg-white shadow-soft"
            >
              <div
                className="flex h-16 items-end bg-gradient-to-br from-folha to-rio p-3"
                aria-hidden
              >
                <Badge className="!border-white/30 !bg-white/20 !text-white normal-case">
                  {e.porte}
                </Badge>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-tinta">{e.nome}</p>
                <p className="font-display text-[11px] italic text-tinta-faint">
                  {e.cientifico}
                </p>
                <p className="mt-1.5 text-[10px] uppercase tracking-wide text-folha-light">
                  raiz {e.raiz} · sombra {e.sombra}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-center text-xs text-tinta-faint">
        Fontes oficiais · confirme no órgão antes de agir.
      </p>
    </div>
  );
}
