/**
 * Fontes oficiais / notícias públicas sobre meio ambiente em Teresina.
 * Base: SEMAM — https://www.teresina.pi.gov.br/semam/
 * Notícias e viveiros: portal da Prefeitura; canais citados em coberturas oficiais
 * (Colab, Defesa Civil 153, BPA, MPPI).
 */

export const SEMAM = {
  nome: 'Secretaria Municipal de Meio Ambiente e Recursos Hídricos',
  sigla: 'SEMAM',
  url: 'https://www.teresina.pi.gov.br/semam/',
  endereco:
    'Avenida Duque de Caxias, 3520 — Primavera (Parque da Cidade / Palácio Verde)',
  horario: 'Segunda a sexta, das 7h30 às 13h30',
  telefone: '(86) 9 9582-0034',
  email: 'protocolosemamthe@gmail.com',
  cnpj: '06.554.869/0017-21',
  missao:
    'Promover o uso sustentável dos bens e recursos naturais para a atual e futuras gerações de Teresina.',
  instagram: 'https://www.instagram.com/semam.teresina/',
} as const;

/** Viveiros municipais — portal da Prefeitura / SDU Leste / coberturas oficiais */
export const VIVEIROS_SEMAM = [
  {
    id: 'parque-cidade',
    nome: 'Viveiro — Sede SEMAM / Parque da Cidade',
    zona: 'Norte',
    local: 'Parque da Cidade, bairro Primavera',
    horario: 'Segunda a sexta (horário da SEMAM)',
    destaque: 'Sede da SEMAM; distribuição de mudas à população.',
    url: 'https://www.teresina.pi.gov.br/semam/',
  },
  {
    id: 'jardim-botanico',
    nome: 'Viveiro — Jardim Botânico',
    zona: 'Norte',
    local: 'Jardim Botânico, bairro Mocambinho',
    horario: 'Consultar SEMAM',
    destaque: 'Produção e educação ambiental no Parque Ambiental.',
    url: 'https://www.teresina.pi.gov.br/semam/',
  },
  {
    id: 'zona-leste',
    nome: 'Viveiro da Zona Leste',
    zona: 'Leste',
    local:
      'Av. Professor Arimateia Santos (Ininga), junto à Igreja de Santo Antônio',
    horario: 'Segunda a sexta, 7h–13h',
    destaque:
      'Produção estimada de ~4 mil mudas/mês (nativas, frutíferas e ornamentais). Coordenação histórica via SDU Leste / SEMAM.',
    url: 'https://www.teresina.pi.gov.br/viveiro-de-plantas-da-zona-leste-de-teresina-disponibiliza-mudas-gratuitas-para-a-populacao/',
  },
] as const;

export const REGRAS_MUDAS_SEMAM = {
  documentos: ['Documento de identificação (CPF)', 'Comprovante de residência'],
  limitePorPessoa: 5,
  observacao:
    'Plantio em calçada ou área pública deve seguir orientação técnica (Lei das Calçadas nº 4.522) e, quando necessário, autorização da SEMAM. “Planta certa no lugar certo”: evite grande porte junto a postes e fiação.',
  especiesCitadas: [
    'Caneleiro',
    'Sambaíba',
    'Abacate',
    'Caju',
    'Manga',
    'Mamão',
    'Goiaba',
  ],
  fonteUrl:
    'https://www.teresina.pi.gov.br/viveiro-de-plantas-da-zona-leste-de-teresina-disponibiliza-mudas-gratuitas-para-a-populacao/',
} as const;

/** Orientações práticas baseadas em órgãos oficiais (FAQ pesquisável) */
export const ORIENTACOES_ORGAOS = [
  {
    id: 'mudas',
    pergunta: 'Como retirar mudas gratuitas?',
    resposta:
      'Compareça a um dos três viveiros municipais com CPF e comprovante de residência. Cada pessoa pode retirar até 5 mudas por vez (nativas ou frutíferas, conforme estoque).',
    orgao: 'SEMAM / SAADs',
    tags: ['mudas', 'viveiro', 'SEMAM'],
  },
  {
    id: 'plantio-publico',
    pergunta: 'Posso plantar em calçada ou área pública?',
    resposta:
      'Consulte previamente a SEMAM para viabilidade. Plantio em logradouro público sem orientação pode gerar conflito com fiação, postes e Lei das Calçadas (nº 4.522).',
    orgao: 'SEMAM',
    tags: ['plantio', 'calçada', 'autorização'],
  },
  {
    id: 'poda-risco',
    pergunta: 'Árvore com risco de queda — o que fazer?',
    resposta:
      'Solicite vistoria/autorização na SEMAM. Em risco iminente, acione também Defesa Civil (153), SAAD da zona ou Corpo de Bombeiros. Em fiação elétrica, contate a concessionária. Prazo típico de retorno citado pela Defesa Civil: até 45 dias; urgência comprovada tem regras específicas.',
    orgao: 'SEMAM · Defesa Civil · SAADs',
    tags: ['poda', 'risco', 'Defesa Civil', '153'],
  },
  {
    id: 'queimadas',
    pergunta: 'Como denunciar queimada urbana?',
    resposta:
      'Ligue 153 (Defesa Civil — ligação gratuita). Também use o app Colab (canal digital da Prefeitura), SEMAM, BPA (190 ou WhatsApp do batalhão) e Linha Verde do MPPI.',
    orgao: 'Defesa Civil · SEMAM · BPA · MPPI',
    tags: ['queimada', 'denúncia', '153', 'Colab'],
  },
  {
    id: 'corte-ilegal',
    pergunta: 'Corte ilegal de árvore — a quem recorrer?',
    resposta:
      'Fiscalização e autorização de corte/supressão: SEMAM. Flagrante e patrulhamento: BPA (190). Investigação: DCCA (Polícia Civil). Acompanhamento institucional: Promotorias de Meio Ambiente do MPPI.',
    orgao: 'SEMAM · BPA · DCCA · MPPI',
    tags: ['corte', 'desmatamento', 'BPA', 'fiscalização'],
  },
  {
    id: 'entulho',
    pergunta: 'Terreno com entulho ou lote sujo?',
    resposta:
      'Manutenção e limpeza operacional em logradouros: SAADs (antigas SDUs) da sua zona. Fiscalização ambiental e autuações: SEMAM. Registre também no Colab com foto e localização.',
    orgao: 'SAADs · SEMAM · Colab',
    tags: ['entulho', 'limpeza', 'SAAD', 'lote'],
  },
] as const;

/** Notícias oficiais — foto local só da mesma matéria (public/fotos/README.txt) */
export const NOTICIAS_SEMAM = [
  {
    id: 'enau-mirim-2026',
    data: '2026-07-31',
    titulo:
      'Educação ambiental aproxima crianças da arborização no ENAU Mirim',
    resumo:
      'Durante o XII ENAU em Teresina, o ENAU Mirim reuniu 30 crianças em trilha sensorial e atividades sobre árvores da cidade. O Núcleo de Educação Ambiental da SEMAM foi parceiro da ação.',
    fonte: 'Prefeitura de Teresina / SEMAM',
    url: 'https://www.teresina.pi.gov.br/educacao-ambiental-aproxima-criancas-da-arborizacao-durante-o-enau-mirim-em-teresina/',
    tags: ['educação ambiental', 'ENAU', 'crianças'],
    foto: '/fotos/1.jpg',
  },
  {
    id: 'nucleo-parque-cidade',
    data: '2026-08-12',
    titulo: 'Crianças vivenciam a natureza no Parque da Cidade',
    resumo:
      'Atividade do Núcleo de Educação Ambiental da SEMAM no Parque da Cidade estimula os sentidos e o vínculo com a arborização urbana.',
    fonte: 'Prefeitura de Teresina / SEMAM',
    url: 'https://www.teresina.pi.gov.br/criancas-vivenciam-a-natureza-pelos-sentidos-em-atividade-do-nucleo-de-educacao-ambiental-no-parque-da-cidade/',
    tags: ['Parque da Cidade', 'educação ambiental'],
    foto: '/fotos/1.jpg',
  },
  {
    id: 'viveiro-leste-2026',
    data: '2026-07-06',
    titulo: 'Viveiro da Zona Leste disponibiliza mudas gratuitas',
    resumo:
      'Produção de cerca de 4 mil mudas/mês (nativas, frutíferas e ornamentais). Retirada com CPF e comprovante de residência, até 5 mudas por pessoa, 7h–13h em Ininga.',
    fonte: 'Prefeitura de Teresina / SDU Leste',
    url: 'https://www.teresina.pi.gov.br/viveiro-de-plantas-da-zona-leste-de-teresina-disponibiliza-mudas-gratuitas-para-a-populacao/',
    tags: ['viveiro', 'mudas', 'Ininga'],
    foto: '/fotos/5.jpg',
  },
  {
    id: 'plantio-eturb-2026',
    data: '2026-05-22',
    titulo: 'Plantio de mudas e conscientização na zona norte',
    resumo:
      'ETURB e parceiros realizaram plantio e educação ambiental na zona norte da capital.',
    fonte: 'Prefeitura de Teresina',
    url: 'https://www.teresina.pi.gov.br/eturb-e-parceiros-realizam-plantio-de-mudas-e-conscientizacao-ambiental-na-zona-norte-da-capital/',
    tags: ['plantio', 'zona norte'],
    foto: '/fotos/2.jpg',
  },
  {
    id: 'reflorestamento-poty-2026',
    data: '2026-05-21',
    titulo: 'Reflorestamento na zona norte às margens do Poty',
    resumo:
      'Órgãos públicos unidos em ação de reflorestamento beneficiando a comunidade às margens do Rio Poty.',
    fonte: 'Prefeitura de Teresina',
    url: 'https://www.teresina.pi.gov.br/reflorestamento-na-zona-norte-une-orgaos-publicos-e-beneficia-comunidade-as-margens-do-rio-poty/',
    tags: ['reflorestamento', 'Poty'],
    foto: '/fotos/2.jpg',
  },
  {
    id: 'frei-serafim-2026',
    data: '2026-06-18',
    titulo: 'Revitalização do canteiro central da Av. Frei Serafim',
    resumo:
      'SDU Centro entrega revitalização do canteiro/calçada no eixo Frei Serafim, com mobiliário e arborização.',
    fonte: 'Prefeitura de Teresina / SDU Centro',
    url: 'https://www.teresina.pi.gov.br/sdu-centro-entrega-revitalizacao-do-canteiro-central-da-avenida-frei-serafim/',
    tags: ['Frei Serafim', 'canteiro', 'revitalização'],
    foto: '/fotos/3.jpg',
  },
] as const;

/** Competências por esfera — arborização e controle ambiental em Teresina */
export const COMPETENCIAS_TERESINA = {
  municipal: {
    titulo: 'Esfera municipal (área urbana)',
    orgaos: [
      {
        sigla: 'SEMAM',
        nome: 'Secretaria Municipal de Meio Ambiente e Recursos Hídricos',
        papel:
          'Órgão central da política ambiental local: licenças e autorizações para corte/supressão (áreas públicas e privadas); fiscalização de corte ilegal, queimadas urbanas e limpeza irregular de lotes; coordenação do Plano Diretor de Arborização Urbana; viveiros e educação ambiental.',
        url: 'https://www.teresina.pi.gov.br/semam/',
      },
      {
        sigla: 'SAADs',
        nome: 'Superintendências das Ações Administrativas Descentralizadas',
        papel:
          'Antigas SDUs (Centro, Norte, Sul, Leste, Sudeste e Rural): manutenção operacional e poda preventiva em praças e logradouros; limpeza de entulho; apoio a viveiros (ex.: Zona Leste).',
        url: 'https://www.teresina.pi.gov.br/secretarias-e-orgaos/',
      },
      {
        sigla: 'Defesa Civil',
        nome: 'Defesa Civil de Teresina',
        papel:
          'Recebe denúncias de queimadas (153), avalia risco de árvores/galhos e articula com SAADs e SEMAM. Em risco iminente, atua com Bombeiros e orientação à população.',
        url: 'https://www.teresina.pi.gov.br/',
      },
    ],
  },
  policial: {
    titulo: 'Esfera policial e investigativa (crimes ambientais)',
    orgaos: [
      {
        sigla: 'BPA',
        nome: 'Batalhão de Polícia Ambiental da PMPI',
        papel:
          'Flagrante e patrulhamento ostensivo: desmatamento sem licença, vegetação em APPs (margens dos rios Poti e Parnaíba) e queimadas. Acionamento: 190 ou WhatsApp do batalhão.',
        url: 'https://www.pm.pi.gov.br/',
      },
      {
        sigla: 'DCCA',
        nome: 'Delegacia de Proteção ao Meio Ambiente (Polícia Civil do Piauí)',
        papel:
          'Inquéritos policiais, investigação de autores de desmatamento ilegal e danos ao patrimônio florestal/ambiental urbano.',
      },
    ],
  },
  estadual: {
    titulo: 'Esfera estadual',
    orgaos: [
      {
        sigla: 'SEMARH',
        nome: 'Secretaria de Meio Ambiente e Recursos Hídricos do Estado do Piauí',
        papel:
          'Impacto regional, áreas rurais de maior extensão, licenciamento de grandes empreendimentos ou bacias hidrográficas estaduais.',
        url: 'https://www.semarh.pi.gov.br/',
      },
    ],
  },
  controle: {
    titulo: 'Fiscalização e apoio da sociedade',
    orgaos: [
      {
        sigla: 'MPPI',
        nome: 'Ministério Público do Estado do Piauí',
        papel:
          'Promotorias de Meio Ambiente e Linha Verde: fiscalizam o cumprimento da legislação pelos órgãos públicos e cobram compensação vegetal em supressões ilegais. Denúncias 24h pelo site.',
        url: 'https://www.mppi.mp.br/',
      },
    ],
  },
} as const;

export const CANAIS_DENUNCIA = [
  {
    id: 'colab',
    titulo: 'Colab (app oficial da Prefeitura)',
    como: 'Canal digital adotado pela Prefeitura: foto, localização e protocolo. Disponível nas lojas Android/iOS (Colab.re).',
    url: 'https://www.colab.re/',
  },
  {
    id: 'defesa-civil-153',
    titulo: 'Defesa Civil — 153',
    como: 'Ligação gratuita para queimadas e riscos (árvores, galhos). A Defesa Civil articula com SAADs e SEMAM.',
    telefone: '153',
  },
  {
    id: 'semam',
    titulo: 'SEMAM — protocolo e fiscalização',
    como: `Telefone ${SEMAM.telefone} · e-mail ${SEMAM.email} · atendimento no Palácio Verde (Parque da Cidade).`,
    url: SEMAM.url,
    telefone: SEMAM.telefone,
  },
  {
    id: 'bpa-190',
    titulo: 'Polícia Militar Ambiental (BPA)',
    como: 'Disque 190 ou WhatsApp do batalhão: (86) 99514-3417 / (86) 99505-5360 (números divulgados em ações oficiais de combate a queimadas).',
    telefone: '190',
  },
  {
    id: 'mppi-linha-verde',
    titulo: 'Linha Verde — MPPI',
    como: 'Formulário 24h no site do Ministério Público do Piauí; opção de sigilo.',
    url: 'https://www.mppi.mp.br/',
  },
] as const;

/** Lista plana de órgãos para busca */
export function listOrgaosFlat() {
  return Object.values(COMPETENCIAS_TERESINA).flatMap((esfera) =>
    esfera.orgaos.map((o) => ({
      ...o,
      esfera: esfera.titulo,
    }))
  );
}
