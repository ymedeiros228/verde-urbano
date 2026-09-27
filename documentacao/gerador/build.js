// Gera a documentação do Verde Urbano em .docx seguindo ABNT (NBR 14724, 6023, 6024, 6027, 6028, 10520).
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Header, AlignmentType, HeadingLevel,
  PageBreak, TableOfContents, SimpleField, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, LevelFormat, TabStopType, SequentialIdentifier, VerticalAlign, PageNumber,
  ExternalHyperlink, TableLayoutType,
} = require('docx');

// ------------------------------------------------------------------ dados editáveis da capa
const CFG = {
  instituicao: '[NOME DA INSTITUIÇÃO DE ENSINO]',
  curso: '[NOME DO CURSO]',
  disciplina: '[NOME DA DISCIPLINA / PROGRAMA DE EXTENSÃO]',
  autores: ['YURI MEDEIROS', '[NOME DO INTEGRANTE 2]', '[NOME DO INTEGRANTE 3]', '[NOME DO INTEGRANTE 4]'],
  orientador: '[Prof.(a) Nome do(a) Orientador(a)]',
  cidade: 'TERESINA',
  ano: '2026',
  site: 'https://vu-teresina.vercel.app',
  github: 'https://github.com/ymedeiros228/verde-urbano',
};

const FIG = path.join(__dirname, 'figs');
const PAGES_FILE = path.join(__dirname, 'pages.json');
const PAGES = fs.existsSync(PAGES_FILE) ? JSON.parse(fs.readFileSync(PAGES_FILE, 'utf8')) : {};
const TOC_ENTRIES = []; // {title, level}
const CAPS = { Figura: [], Quadro: [] }; // títulos completos das legendas
const pg = (t) => (PAGES[t] !== undefined ? PAGES[t] : 0);
const img = (f) => fs.readFileSync(path.join(FIG, f));
const FONT = 'Arial';
const VERDE = '1A5C3A';
const CM = 567; // 1 cm em DXA
const TEXT_W = 11906 - 3 * CM - 2 * CM; // largura útil: A4 - 3 cm - 2 cm

// ------------------------------------------------------------------ texto com marcação leve
// **negrito**, *itálico*, `código`
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0; let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith('**')) out.push(new TextRun({ text: t.slice(2, -2), bold: true, ...base }));
    else if (t.startsWith('`')) out.push(new TextRun({ text: t.slice(1, -1), font: 'Consolas', size: (base.size || 24) - 2, ...base, color: '2A4A38' }));
    else out.push(new TextRun({ text: t.slice(1, -1), italics: true, ...base }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}

const P = (text, opts = {}) => new Paragraph({ style: 'Texto', children: runs(text), ...opts });
const PN = (text, opts = {}) => new Paragraph({ style: 'Texto', indent: { firstLine: 0 }, children: runs(text), ...opts });
const blank = (n = 1) => Array.from({ length: n }, () => new Paragraph({ style: 'Texto', children: [] }));
const H1 = (t) => (TOC_ENTRIES.push({ title: t, level: 1 }), new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] }));
const H2 = (t) => (TOC_ENTRIES.push({ title: t, level: 2 }), new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] }));
const H3 = (t) => (TOC_ENTRIES.push({ title: t, level: 3 }), new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] }));
// título sem indicativo numérico, centralizado (REFERÊNCIAS, APÊNDICE…) — entra no sumário
const H1C = (t) => (TOC_ENTRIES.push({ title: t, level: 1 }), new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun(t)] }));
// título pré-textual: centralizado, fora do sumário
const TPre = (t) => new Paragraph({ style: 'TituloPre', children: [new TextRun(t)] });

const bullet = (text, lvl = 0) => new Paragraph({ style: 'Lista', numbering: { reference: 'bullets', level: lvl }, children: runs(text) });
let ALI = 0;
const novaLista = () => { ALI += 1; };
const alinea = (text) => new Paragraph({ style: 'Lista', numbering: { reference: 'alineas', level: 0, instance: ALI }, children: runs(text) });

// citação direta longa (> 3 linhas): recuo 4 cm, fonte 10, simples
const citacao = (text) => new Paragraph({ style: 'Citacao', children: runs(text) });

// ------------------------------------------------------------------ figuras e quadros
function legenda(tipo, titulo) {
  return new Paragraph({
    style: 'Legenda', keepNext: true,
    children: (() => {
      const n = CAPS[tipo].length + 1;
      CAPS[tipo].push(`${tipo} ${n} – ${titulo}`);
      return [new TextRun(`${tipo} `), new SimpleField(`SEQ ${tipo} \* ARABIC`, String(n)), new TextRun(` – ${titulo}`)];
    })(),
  });
}
const fonte = (t = 'Elaborado pelos autores (2026).') =>
  new Paragraph({ style: 'Fonte', children: runs(`Fonte: ${t}`) });

function figura(file, titulo, fonteTxt, widthCm = 15.5) {
  const buf = img(file);
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20); // cabeçalho PNG
  const wpx = Math.round(widthCm * 37.8);
  const hpx = Math.round((wpx * h) / w);
  return [
    legenda('Figura', titulo),
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 60, after: 60 },
      children: [new ImageRun({ type: 'png', data: buf, transformation: { width: wpx, height: hpx },
        altText: { title: titulo, description: titulo, name: file } })] }),
    fonte(fonteTxt),
  ];
}

// espaço reservado para print da aplicação
function printApp(titulo, instrucao, alturaCm = 9.5) {
  const dash = { style: BorderStyle.DASHED, size: 8, color: '7BA8B5' };
  const IN_W = TEXT_W - 240;
  const nb = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const moldura = new Table({
      width: { size: IN_W, type: WidthType.DXA }, columnWidths: [IN_W], alignment: AlignmentType.CENTER,
      rows: [new TableRow({ cantSplit: true, height: { value: alturaCm * CM, rule: 'exact' }, children: [new TableCell({
        width: { size: IN_W, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
        borders: { top: dash, bottom: dash, left: dash, right: dash },
        shading: { type: ShadingType.CLEAR, fill: 'F3F6F1', color: 'auto' },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 80 }, children: [new TextRun({ text: 'ESPAÇO RESERVADO PARA CAPTURA DE TELA', bold: true, size: 20, color: '2A6B7C' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [new TextRun({ text: instrucao, size: 18, color: '4A5C52' })] }),
        ] })] })],
  });
  // bloco indivisível: legenda + moldura + fonte na mesma linha de tabela sem bordas
  return [new Table({
    width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: [TEXT_W], alignment: AlignmentType.CENTER,
    borders: { top: nb, bottom: nb, left: nb, right: nb, insideHorizontal: nb, insideVertical: nb },
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({
      width: { size: TEXT_W, type: WidthType.DXA }, borders: { top: nb, bottom: nb, left: nb, right: nb },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [legenda('Figura', titulo), moldura, fonte('Verde Urbano (2026). Captura de tela da aplicação.')],
    })] })],
  })];
}

const B = { style: BorderStyle.SINGLE, size: 6, color: '6F8A7A' };
const BORDERS = { top: B, bottom: B, left: B, right: B };
function quadro(titulo, head, rows, widths, fonteTxt) {
  const tot = widths.reduce((a, b) => a + b, 0);
  const cols = widths.map((w) => Math.round((w / tot) * TEXT_W));
  cols[cols.length - 1] += TEXT_W - cols.reduce((a, b) => a + b, 0);
  const cell = (t, i, isHead, last) => new TableCell({
    width: { size: cols[i], type: WidthType.DXA }, borders: BORDERS,
    shading: isHead ? { type: ShadingType.CLEAR, fill: 'DCEBDF', color: 'auto' } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 }, verticalAlign: VerticalAlign.CENTER,
    children: String(t).split('\n').map((line) => new Paragraph({ style: 'Tabela', keepNext: Boolean(last),
      alignment: isHead ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: runs(line, isHead ? { bold: true } : {}) })),
  });
  return [
    legenda('Quadro', titulo),
    new Table({
      width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: cols, layout: TableLayoutType.FIXED,
      rows: [new TableRow({ tableHeader: true, cantSplit: true, children: head.map((h, i) => cell(h, i, true)) }),
        ...rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false, ri === rows.length - 1)) }))],
    }),
    fonte(fonteTxt),
  ];
}

// ------------------------------------------------------------------ elementos pré-textuais
const centro = (t, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 360 }, children: [new TextRun({ text: t, font: FONT, size: 24, ...o })] });

function capa() {
  const logo = img('logo.png');
  return [
    centro(CFG.instituicao, { bold: true }),
    centro(CFG.curso.toUpperCase(), { bold: true }),
    ...blank(1),
    ...CFG.autores.map((a) => centro(a)),
    new Paragraph({ spacing: { before: 1300 }, alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: logo, transformation: { width: 118, height: 118 }, altText: { title: 'Logo', description: 'Logotipo Verde Urbano', name: 'logo' } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 280, line: 360 }, children: [new TextRun({ text: 'VERDE URBANO', bold: true, size: 36, color: VERDE, font: FONT, characterSpacing: 40 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 360 }, children: [new TextRun({ text: 'plataforma colaborativa de mapeamento, arborização e revitalização comunitária em Teresina/PI', size: 24, font: FONT })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: 'E8B84A', space: 1 } }, indent: { left: 3600, right: 3600 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: 'Documentação técnica do Produto Mínimo Viável (MVP)', size: 22, color: '4A5C52', font: FONT, italics: true })] }),
    new Paragraph({ spacing: { before: 3000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: CFG.cidade, font: FONT, size: 24 })] }),
    centro(CFG.ano),
  ];
}

function folhaRosto() {
  return [
    ...CFG.autores.map((a) => centro(a)),
    new Paragraph({ spacing: { before: 2600, line: 360 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'VERDE URBANO', bold: true, size: 24, font: FONT })] }),
    centro('plataforma colaborativa de mapeamento, arborização e revitalização comunitária em Teresina/PI'),
    new Paragraph({ spacing: { before: 1200, line: 240 }, indent: { left: 8 * CM }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ font: FONT, size: 22,
      text: `Documentação técnica apresentada ao ${CFG.curso} da ${CFG.instituicao}, no âmbito da ${CFG.disciplina}, como requisito parcial para aprovação na atividade curricular de extensão.` })] }),
    new Paragraph({ spacing: { before: 360, line: 240 }, indent: { left: 8 * CM }, children: [new TextRun({ font: FONT, size: 22, text: `Orientador(a): ${CFG.orientador}` })] }),
    new Paragraph({ spacing: { before: 2600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: CFG.cidade, font: FONT, size: 24 })] }),
    centro(CFG.ano),
  ];
}

const resumo = () => [
  TPre('RESUMO'),
  new Paragraph({ style: 'Resumo', children: runs('O crescimento urbano de Teresina, capital com uma das maiores médias de temperatura do país, evidencia a carência de cobertura arbórea e a degradação de espaços coletivos, como praças, canteiros e terrenos baldios. Este trabalho, desenvolvido como atividade curricular de extensão, apresenta o Verde Urbano, uma plataforma web progressiva (PWA) que conecta cidadãos, uma organização não governamental (ONG) de arborização e o poder público municipal para identificar, priorizar e transformar áreas carentes de vegetação. O Produto Mínimo Viável (MVP) permite que o cidadão registre locais com fotografia e geolocalização, apoie demandas de vizinhos, participe de mutirões e consulte guias técnicos baseados em fontes oficiais da Secretaria Municipal de Meio Ambiente e Recursos Hídricos (SEMAM). Para os gestores, oferece um painel com indicadores, mapa de inteligência e exportação de dados em GeoJSON. Como diferencial técnico, foi construído um mapa verde real do município a partir de dados abertos de satélite (ESA WorldCover e Landsat 8/9) e do OpenStreetMap, agregados em 1.884 hexágonos H3, resultando em um índice de prioridade de arborização que combina falta de copa, temperatura de superfície e densidade construída. A análise revelou copa arbórea média de 14,6% e temperatura de superfície média de 46,0 °C na área urbana, com 491 hexágonos classificados como críticos. A solução foi implementada com Next.js 14, TypeScript, MapLibre GL e Supabase, com custo de infraestrutura zero, e encontra-se publicada para testes. Conclui-se que o MVP valida a hipótese de que dados abertos e participação comunitária podem orientar, de forma objetiva, a política de arborização urbana.') }),
  new Paragraph({ style: 'Resumo', spacing: { before: 240 }, children: runs('**Palavras-chave:** arborização urbana; participação cidadã; geoprocessamento; ilhas de calor; tecnologia cívica.') }),
];

const abstract = () => [
  TPre('ABSTRACT'),
  new Paragraph({ style: 'Resumo', children: runs('*The urban growth of Teresina, a Brazilian state capital with one of the highest average temperatures in the country, reveals a shortage of tree canopy and the degradation of public spaces such as squares, medians and vacant lots. This work, developed as a university extension activity, presents Verde Urbano, a progressive web application (PWA) that connects citizens, a tree-planting non-governmental organization (NGO) and the municipal government to identify, prioritize and transform areas lacking vegetation. The Minimum Viable Product (MVP) allows citizens to report places with photographs and geolocation, endorse neighbors\' requests, join volunteer planting events and consult technical guides based on official sources from the Municipal Environment Department (SEMAM). For public managers, it provides a dashboard with indicators, an intelligence map and GeoJSON data export. As a technical differential, a real green map of the city was built from open satellite data (ESA WorldCover and Landsat 8/9) and OpenStreetMap, aggregated into 1,884 H3 hexagons, producing a tree-planting priority index that combines canopy deficit, land surface temperature and built-up density. The analysis showed an average urban tree canopy of 14.6% and an average land surface temperature of 46.0 °C, with 491 hexagons classified as critical. The solution was implemented with Next.js 14, TypeScript, MapLibre GL and Supabase at zero infrastructure cost and is deployed for testing. The MVP validates the hypothesis that open data and community participation can objectively guide urban forestry policy.*') }),
  new Paragraph({ style: 'Resumo', spacing: { before: 240 }, children: runs('**Keywords:** *urban forestry; citizen participation; geoprocessing; urban heat islands; civic technology.*') }),
];

function listaSiglas() {
  const s = [
    ['ABNT', 'Associação Brasileira de Normas Técnicas'], ['API', 'Application Programming Interface'],
    ['CRUD', 'Create, Read, Update, Delete'], ['CSS', 'Cascading Style Sheets'], ['ESA', 'European Space Agency'],
    ['GeoJSON', 'Geographic JavaScript Object Notation'], ['GPS', 'Global Positioning System'],
    ['H3', 'Hexagonal Hierarchical Spatial Index'], ['HTTPS', 'Hypertext Transfer Protocol Secure'],
    ['IBGE', 'Instituto Brasileiro de Geografia e Estatística'], ['JWT', 'JSON Web Token'],
    ['KPI', 'Key Performance Indicator'], ['LGPD', 'Lei Geral de Proteção de Dados Pessoais'],
    ['MVP', 'Minimum Viable Product (Produto Mínimo Viável)'], ['ODS', 'Objetivos de Desenvolvimento Sustentável'],
    ['ONG', 'Organização Não Governamental'], ['OSM', 'OpenStreetMap'], ['PWA', 'Progressive Web App'],
    ['RF', 'Requisito Funcional'], ['RLS', 'Row Level Security'], ['RNF', 'Requisito Não Funcional'],
    ['SEMAM', 'Secretaria Municipal de Meio Ambiente e Recursos Hídricos de Teresina'],
    ['SQL', 'Structured Query Language'], ['SSR', 'Server-Side Rendering'], ['UI', 'User Interface'],
    ['USGS', 'United States Geological Survey'], ['UX', 'User Experience'],
  ];
  return [TPre('LISTA DE ABREVIATURAS E SIGLAS'), ...s.map(([a, b]) => new Paragraph({
    style: 'Texto', indent: { left: 2000, hanging: 2000 }, tabStops: [{ type: TabStopType.LEFT, position: 2000 }],
    children: [new TextRun(a), new TextRun('\t' + b)] }))];
}

// ------------------------------------------------------------------ corpo (elementos textuais)
function corpo() {
  const c = [];
  const add = (...x) => x.forEach((i) => (Array.isArray(i) ? c.push(...i) : c.push(i)));

  // 1 INTRODUÇÃO -------------------------------------------------------
  add(H1('1 INTRODUÇÃO'));
  add(P('Teresina, capital do Piauí, é conhecida nacionalmente como a “cidade verde”, título atribuído pela abundância histórica de mangueiras e oitizeiros em suas ruas. Paradoxalmente, a cidade figura entre as capitais mais quentes do Brasil, e sua expansão urbana recente, sobretudo nas zonas sul, sudeste e norte, produziu bairros extensos com pouca ou nenhuma cobertura arbórea. Nesses locais, terrenos baldios se transformam em depósitos irregulares de entulho, praças perdem equipamentos e iluminação, e crianças improvisam brincadeiras em áreas sem sombra.'));
  add(P('A ausência de canais estruturados de registro impede que a administração municipal priorize essas áreas com precisão técnica. Ao mesmo tempo, moradores dispostos a transformar a vizinhança carecem de orientação — por exemplo, sobre quais espécies plantar sem comprometer a fiação elétrica ou as calçadas — e de capacidade de mobilização. O **Verde Urbano** nasce para estabelecer o elo entre a demanda cidadã, a consultoria ambiental de uma ONG parceira e o poder executivo municipal.'));
  add(P('Este documento apresenta o Produto Mínimo Viável (MVP) da plataforma, desenvolvido como atividade curricular de extensão, nos termos da Resolução CNE/CES nº 7/2018, que estabelece a extensão como processo “interdisciplinar, político educacional, cultural, científico, tecnológico” que promove a interação transformadora entre as instituições de ensino superior e os outros setores da sociedade (Brasil, 2018). O produto está publicado e acessível em ' + CFG.site + ', e seu código-fonte encontra-se disponível em ' + CFG.github + '.'));

  add(H2('1.1 PROBLEMA'));
  add(P('Como transformar a percepção difusa dos moradores sobre a falta de áreas verdes em informação georreferenciada, priorizada e acionável, capaz de orientar o poder público e mobilizar a própria comunidade para ações concretas de arborização e revitalização?'));

  add(H2('1.2 OBJETIVOS'));
  add(H3('1.2.1 Objetivo geral'));
  add(P('Desenvolver e validar uma plataforma web colaborativa que permita mapear, priorizar e acompanhar demandas de arborização e revitalização de espaços públicos em Teresina/PI, integrando cidadãos, ONG ambiental e órgãos públicos.'));
  add(H3('1.2.2 Objetivos específicos'));
  add(PN('São objetivos específicos deste trabalho:')); novaLista();
  add(alinea('permitir o registro de locais degradados com fotografia, categoria e coordenadas de GPS;'));
  add(alinea('construir um mapa de prioridade de arborização baseado exclusivamente em dados abertos de satélite e cartografia colaborativa;'));
  add(alinea('viabilizar o apoio coletivo às demandas e a organização de mutirões voluntários;'));
  add(alinea('disponibilizar guias técnicos de espécies nativas e de competências dos órgãos, com base em fontes oficiais da SEMAM;'));
  add(alinea('oferecer aos gestores públicos um painel de inteligência com indicadores e exportação de dados abertos;'));
  add(alinea('manter custo de infraestrutura zero, garantindo a sustentabilidade do projeto após o período acadêmico.'));

  add(H2('1.3 JUSTIFICATIVA'));
  add(P('A arborização urbana é reconhecida como infraestrutura essencial à saúde pública. A Organização Mundial da Saúde associa a presença de áreas verdes à redução de doenças cardiovasculares, à melhoria da saúde mental e à mitigação do calor extremo (World Health Organization, 2016). O fenômeno das ilhas de calor urbanas, descrito por Oke (1982), é agravado pela substituição da vegetação por superfícies impermeáveis — cenário que os dados levantados neste trabalho confirmam para Teresina, cuja área urbana apresentou temperatura de superfície média de 46,0 °C no período seco.'));
  add(P('Do ponto de vista social, a ocupação produtiva de vazios urbanos aumenta a circulação de pessoas e a sensação de segurança, efeito que Jacobs (2011) denominou “olhos da rua”. Do ponto de vista institucional, o Estatuto da Cidade (Brasil, 2001) estabelece a gestão democrática da cidade, com participação da população na formulação e no acompanhamento de planos e projetos urbanos. Por fim, o projeto contribui diretamente para os Objetivos de Desenvolvimento Sustentável 11 (Cidades e Comunidades Sustentáveis) e 13 (Ação Contra a Mudança Global do Clima) da Agenda 2030 (Nações Unidas, 2015).'));

  add(H2('1.4 ESTRUTURA DO DOCUMENTO'));
  add(P('Além desta introdução, a seção 2 apresenta o referencial teórico; a seção 3, a metodologia; a seção 4 define o MVP, seus requisitos e escopo; a seção 5 descreve a arquitetura e as tecnologias; a seção 6 detalha a implementação com trechos do código-fonte; a seção 7 apresenta o mapa verde de Teresina; a seção 8 exibe as telas da aplicação; a seção 9 trata da integração institucional; a seção 10 discute resultados, limitações e o roteiro de evolução; e a seção 11 traz as considerações finais.'));

  // 2 REFERENCIAL ------------------------------------------------------
  add(H1('2 REFERENCIAL TEÓRICO'));
  add(H2('2.1 ARBORIZAÇÃO URBANA E ILHAS DE CALOR'));
  add(P('A arborização urbana compreende o conjunto da vegetação arbórea presente em vias, praças, parques e lotes de uma cidade. Gonçalves e Paiva (2004) destacam que a escolha da espécie deve considerar o porte da árvore adulta, o tipo de sistema radicular e a compatibilidade com equipamentos urbanos, como redes elétricas, calçadas e galerias pluviais. Espécies inadequadas geram conflitos que resultam em podas drásticas, danos a calçadas e, frequentemente, na supressão do indivíduo.'));
  add(P('As ilhas de calor urbanas decorrem do balanço energético alterado das cidades: materiais como asfalto e concreto absorvem radiação solar durante o dia e a liberam lentamente, enquanto a redução da evapotranspiração diminui o resfriamento natural (Oke, 1982). A copa das árvores atua sobre as duas causas, sombreando superfícies e devolvendo umidade ao ar. Por isso, a temperatura de superfície medida por satélite é um indicador consistente para identificar áreas prioritárias de plantio.'));
  add(H2('2.2 PARTICIPAÇÃO CIDADÃ E TECNOLOGIA CÍVICA'));
  add(P('Arnstein (1969) propôs a “escada da participação cidadã”, na qual os degraus superiores correspondem à parceria e ao poder delegado, em oposição à mera consulta. Plataformas de tecnologia cívica buscam subir essa escada ao transformar o cidadão em produtor de informação pública e em agente de execução, como ocorre nos mutirões. No Verde Urbano, a participação se dá em três níveis: registro (informar), apoio (priorizar coletivamente) e mutirão (executar em parceria com a ONG e a SEMAM).'));
  add(H2('2.3 GEOPROCESSAMENTO COM DADOS ABERTOS'));
  add(P('A disponibilidade de dados orbitais gratuitos tornou possível produzir análises urbanas de alta resolução sem custo de aquisição. O produto ESA WorldCover fornece a cobertura do solo global com resolução de 10 metros e onze classes, entre elas “cobertura arbórea” e “área construída” (Zanaga *et al*., 2022). Os satélites Landsat 8 e 9 disponibilizam, em seus produtos de nível 2, a temperatura de superfície terrestre derivada da banda termal (U.S. Geological Survey, 2024). O OpenStreetMap complementa essas fontes com limites administrativos, bairros e áreas verdes mapeadas colaborativamente (OpenStreetMap Contributors, 2026).'));
  add(P('Para agregar dados de naturezas distintas em uma mesma unidade espacial, adotou-se o sistema de indexação hexagonal H3, que divide a superfície terrestre em células hexagonais hierárquicas. Hexágonos têm a propriedade de possuir vizinhos equidistantes, o que reduz distorções em análises de vizinhança e produz visualizações mais legíveis do que grades quadradas (Uber Technologies, 2024).'));
  add(H2('2.4 PRODUTO MÍNIMO VIÁVEL'));
  add(P('Ries (2012) define o Produto Mínimo Viável como a versão de um produto que permite completar um ciclo de construir-medir-aprender com o menor esforço possível. O MVP não é um protótipo descartável, e sim um produto funcional que testa as hipóteses centrais do negócio junto a usuários reais. Neste trabalho, o MVP foi desenhado para validar três hipóteses: (i) cidadãos registram e apoiam demandas quando o processo é simples; (ii) dados abertos permitem priorizar áreas de plantio com objetividade; e (iii) o painel é útil para a tomada de decisão dos órgãos públicos.'));

  // 3 METODOLOGIA ------------------------------------------------------
  add(H1('3 METODOLOGIA'));
  add(P('O trabalho caracteriza-se como pesquisa aplicada, de abordagem quali-quantitativa, com desenvolvimento de artefato tecnológico. O processo foi organizado em ciclos iterativos curtos, inspirados em práticas ágeis, compreendendo as etapas descritas no Quadro 1.'));
  add(quadro('Etapas metodológicas do projeto', ['Etapa', 'Atividades', 'Entregáveis'], [
    ['1. Imersão', 'Levantamento do problema com a comunidade e a ONG parceira; pesquisa em fontes oficiais da SEMAM e da Prefeitura de Teresina.', 'Relatório de contexto; mapa de atores'],
    ['2. Definição', 'Definição de personas, jornadas, hipóteses e escopo do MVP; priorização MoSCoW.', 'Requisitos (RF/RNF); backlog'],
    ['3. Dados', 'Construção do pipeline geoespacial com WorldCover, Landsat e OSM; geocodificação dos pontos do piloto.', 'Mapa verde; ranking de bairros'],
    ['4. Desenvolvimento', 'Implementação incremental do app cidadão, painel de gestão e banco de dados.', 'Aplicação publicada (Vercel)'],
    ['5. Validação', 'Testes com usuários, revisão técnica pela ONG e apresentação à banca e aos órgãos.', 'Métricas; ajustes; roadmap'],
  ], [2.2, 6, 3.2]));
  add(P('As decisões técnicas seguiram dois princípios: **dados reais em vez de dados inventados** — toda informação espacial exibida no mapa verde provém de fontes abertas e rastreáveis — e **custo zero de operação**, condição para que o projeto sobreviva ao término do semestre letivo e possa ser mantido pela ONG ou pela comunidade.'));

  // 4 MVP --------------------------------------------------------------
  add(H1('4 O PRODUTO: VERDE URBANO'));
  add(H2('4.1 VISÃO DO PRODUTO'));
  add(P('*Para moradores de Teresina que desejam uma cidade mais sombreada e cuidada, o Verde Urbano é uma plataforma colaborativa de mapeamento que transforma denúncias isoladas em demandas priorizadas por dados e por apoio coletivo. Diferentemente de canais genéricos de ouvidoria, a plataforma combina um mapa real de calor e copa arbórea, curadoria técnica de espécies nativas e a organização de mutirões, conectando cidadão, ONG e poder público em um único fluxo.*'));
  add(H2('4.2 PÚBLICO-ALVO E PERSONAS'));
  add(quadro('Personas do Verde Urbano', ['Persona', 'Perfil', 'Necessidade principal'], [
    ['**Dona Francisca**\nCidadã', '58 anos, moradora do Promorar há 30 anos; usa o celular para redes sociais.', 'Registrar o terreno baldio da rua sem burocracia e saber se alguém fará algo.'],
    ['**Lucas**\nVoluntário', '22 anos, universitário, participa de coletivos ambientais.', 'Encontrar mutirões próximos e ver o impacto do que ajudou a plantar.'],
    ['**Marina**\nTécnica da ONG', 'Engenheira florestal, coordena plantios e distribuição de mudas.', 'Validar espécies adequadas e organizar ações com voluntários suficientes.'],
    ['**Ricardo**\nGestor público', 'Servidor da SEMAM, responsável por planejamento de arborização.', 'Dados confiáveis para priorizar bairros e justificar investimentos.'],
  ], [2.4, 4.6, 4.8]));
  add(H2('4.3 PROPOSTA DE VALOR DO MVP'));
  add(P('O MVP concentra-se no ciclo completo de uma demanda: **mapear → apoiar → planejar → executar → acompanhar**. Cada etapa é visível ao cidadão por meio de um indicador de progresso na própria demanda, o que dá transparência ao processo e reforça o engajamento. O Quadro 3 sintetiza o escopo definido para esta versão.'));
  add(quadro('Escopo do MVP (priorização MoSCoW)', ['Prioridade', 'Funcionalidades'], [
    ['**Must have**\n(entregue)', 'Mapa interativo com lentes de prioridade, copa e calor; registro de ponto com GPS e foto; feed de demandas; apoio a demandas; mutirões com inscrição; guias SEMAM e espécies; painel de gestão com KPIs; exportação GeoJSON.'],
    ['**Should have**\n(entregue parcialmente)', 'Autenticação (Supabase Auth) com perfil e bairro; persistência em banco com RLS; fotos no Supabase Storage; modo 3D dos hexágonos; relatórios imprimíveis; instalação como aplicativo (PWA).'],
    ['**Could have**\n(backlog)', 'Notificações push; fila de moderação de pontos com foto; comparação anual da cobertura de copa; gamificação por bairro.'],
    ['**Won\'t have**\n(fora desta versão)', 'Integração oficial com sistemas de protocolo da Prefeitura; aplicativo nativo nas lojas; pagamentos/doações.'],
  ], [3, 9]));
  add(H2('4.4 REQUISITOS FUNCIONAIS'));
  add(quadro('Requisitos funcionais', ['ID', 'Descrição', 'Módulo', 'Status'], [
    ['RF01', 'Exibir mapa de Teresina com hexágonos de prioridade, copa arbórea e temperatura de superfície.', 'Cidadão / Gestão', 'Concluído'],
    ['RF02', 'Permitir alternar entre mapa de ruas e imagem de satélite, e ativar visualização 3D.', 'Cidadão / Gestão', 'Concluído'],
    ['RF03', 'Registrar novo ponto com tipo, localização (GPS ou pino no mapa), foto e revisão.', 'Cidadão', 'Concluído'],
    ['RF04', 'Listar demandas em feed com foto, bairro, apoios, urgência e etapa.', 'Cidadão', 'Concluído'],
    ['RF05', 'Permitir que o cidadão apoie uma demanda, aumentando sua prioridade.', 'Cidadão', 'Concluído'],
    ['RF06', 'Listar mutirões e permitir inscrição de voluntários.', 'Cidadão', 'Concluído'],
    ['RF07', 'Exibir guias de espécies nativas, viveiros e competências de órgãos com fontes oficiais.', 'Cidadão', 'Concluído'],
    ['RF08', 'Exibir painel com KPIs, gráficos por tipo e status e ranking de bairros.', 'Gestão', 'Concluído'],
    ['RF09', 'Listar e triar demandas por urgência e número de apoios.', 'Gestão', 'Concluído'],
    ['RF10', 'Exportar as demandas em formato GeoJSON.', 'Gestão', 'Concluído'],
    ['RF11', 'Cadastrar e autenticar usuários com papéis cidadão, ONG e prefeitura.', 'Transversal', 'Em integração'],
  ], [1.2, 6.8, 2.2, 2]));
  add(H2('4.5 REQUISITOS NÃO FUNCIONAIS'));
  add(quadro('Requisitos não funcionais', ['ID', 'Categoria', 'Descrição'], [
    ['RNF01', 'Custo', 'Operar integralmente em planos gratuitos (Vercel Hobby, Supabase Free, OpenFreeMap).'],
    ['RNF02', 'Usabilidade', 'Interface *mobile-first*, com navegação inferior e ações principais a no máximo dois toques.'],
    ['RNF03', 'Disponibilidade', 'Funcionar mesmo sem banco configurado, com dados de demonstração e armazenamento local.'],
    ['RNF04', 'Segurança', 'Aplicar Row Level Security no banco; usuários só alteram os próprios registros.'],
    ['RNF05', 'Privacidade', 'Tratar dados pessoais conforme a LGPD (Brasil, 2018), coletando apenas o necessário.'],
    ['RNF06', 'Desempenho', 'Renderização vetorial via WebGL; camadas GeoJSON estáticas servidas por CDN.'],
    ['RNF07', 'Portabilidade', 'Instalável como PWA em Android, iOS e desktop.'],
    ['RNF08', 'Rastreabilidade', 'Toda camada de dados exibe a fonte e a data de geração.'],
  ], [1.4, 2.4, 8.2]));
  add(H2('4.6 JORNADA PRINCIPAL DO USUÁRIO'));
  add(P('A jornada central do MVP acompanha a persona Dona Francisca desde a identificação do problema até a conclusão da ação:')); novaLista();
  add(alinea('**Descoberta** — ao abrir o aplicativo, a moradora vê o mapa de calor do seu bairro e as demandas já registradas por vizinhos;'));
  add(alinea('**Registro** — toca em “Mapear”, escolhe o tipo “terreno baldio”, captura a localização por GPS e fotografa o local;'));
  add(alinea('**Mobilização** — a demanda aparece no feed, onde outros moradores a apoiam; a urgência cresce com os apoios;'));
  add(alinea('**Análise** — a ONG avalia tecnicamente o local e recomenda espécies; a SEMAM visualiza a demanda no painel;'));
  add(alinea('**Execução** — um mutirão é agendado, e voluntários se inscrevem pela plataforma;'));
  add(alinea('**Acompanhamento** — o indicador de progresso da demanda avança até “Concluído”.'));

  // 5 ARQUITETURA ------------------------------------------------------
  add(H1('5 ARQUITETURA E TECNOLOGIAS'));
  add(H2('5.1 VISÃO GERAL DA ARQUITETURA'));
  add(P('A aplicação adota uma arquitetura em três camadas, apresentada na Figura 1. A camada de apresentação reúne o app do cidadão, o painel de gestão e o motor de mapas; a camada de aplicação é executada na plataforma Vercel com Next.js 14 (App Router); e a camada de dados combina o Supabase (PostgreSQL gerenciado), arquivos geoespaciais estáticos gerados pelo pipeline de dados e provedores de mapas-base gratuitos.'));
  add(figura('diag_arquitetura.png', 'Arquitetura em camadas do Verde Urbano'));
  add(P('Uma decisão arquitetural relevante é a **degradação graciosa**: se as variáveis de ambiente do Supabase não estiverem configuradas, ou se o banco estiver indisponível, a camada de dados recorre automaticamente a um conjunto de dados de demonstração tipado e ao armazenamento local do navegador. Isso garante que a aplicação nunca fique fora do ar durante apresentações e testes de campo.'));
  add(H2('5.2 PILHA TECNOLÓGICA'));
  add(quadro('Pilha tecnológica e justificativas', ['Camada', 'Tecnologia', 'Justificativa'], [
    ['Framework', 'Next.js 14 (App Router) + React 18', 'Renderização híbrida servidor/cliente, rotas por pastas, otimização de imagens e fontes.'],
    ['Linguagem', 'TypeScript 5', 'Tipagem estática que reduz erros e documenta os modelos de dados.'],
    ['Estilo', 'Tailwind CSS 3', 'Sistema de design por *tokens* (folha, ipê, laterita, rio) com produtividade alta.'],
    ['Mapas', 'MapLibre GL JS 4', 'Renderização vetorial em WebGL, código aberto e sem cobrança por visualização.'],
    ['Dados no cliente', 'TanStack Query 5', 'Cache, sincronização e dados iniciais instantâneos com revalidação.'],
    ['Gráficos', 'Recharts 3', 'Gráficos declarativos em React para o painel de gestão.'],
    ['Backend', 'Supabase (PostgreSQL, Auth)', 'Banco relacional com RLS, autenticação JWT e SDK para SSR.'],
    ['Validação', 'Zod 4', 'Validação de esquemas de entrada.'],
    ['Geodados', 'Python, rasterio, h3, shapely', 'Pipeline reprodutível de processamento de satélite e OSM.'],
    ['Hospedagem', 'Vercel (Hobby)', 'Deploy contínuo a partir do GitHub, CDN global e HTTPS.'],
  ], [2.2, 3.8, 6]));
  add(H2('5.3 ESTRUTURA DO PROJETO'));
  add(P('O código segue a convenção do App Router, com **grupos de rotas** que separam os contextos de uso sem afetar as URLs: `(cidadao)` para o aplicativo público, `(gestao)` para o painel e `(auth)` para autenticação. O Quadro 7 resume a organização das pastas.'));
  add(quadro('Organização das pastas do repositório', ['Pasta', 'Conteúdo'], [
    ['`src/app/(cidadao)`', 'Feed, mapa, mutirões, guias, perfil e cadastro/detalhe de pontos.'],
    ['`src/app/(gestao)/gestao`', 'Painel, demandas, mapa de inteligência, mutirões, espécies, relatórios e configurações.'],
    ['`src/app/(auth)`', 'Telas de login e cadastro.'],
    ['`src/components`', '31 componentes reutilizáveis: interface (`ui`), mapa, demanda, feed e navegação.'],
    ['`src/hooks`', 'Hooks de dados: `useDemandas`, `useMutiroes`, `useEngagement`.'],
    ['`src/lib`', 'Clientes Supabase, camadas do mapa, dados institucionais (SEMAM) e utilitários.'],
    ['`supabase/migrations`', 'Esquema SQL versionado com tabelas, tipos, políticas RLS e gatilhos.'],
    ['`scripts`', 'Pipeline Python do mapa verde, geocodificação e curadoria de imagens.'],
    ['`public/map`', 'Camadas geoespaciais geradas: hexágonos, áreas verdes, ranking e metadados.'],
  ], [4, 8]));
  add(P('Ao todo, o projeto soma 69 arquivos TypeScript/TSX, com aproximadamente 8.900 linhas de código de aplicação, e 1.033 linhas de scripts Python de processamento de dados.'));
  add(H2('5.4 MODELO DE DADOS'));
  add(P('O banco de dados relacional foi modelado no PostgreSQL do Supabase. A entidade central é `pontos`, que representa uma demanda georreferenciada; `votos` registra os apoios, com restrição de unicidade que impede que um mesmo usuário apoie duas vezes o mesmo ponto; `mutiroes` agenda ações coletivas vinculadas a uma demanda; `perfis` estende os usuários de autenticação com papel e bairro; e `especies` armazena o catálogo técnico. A Figura 2 apresenta o diagrama entidade-relacionamento.'));
  add(figura('diag_er.png', 'Diagrama entidade-relacionamento do banco de dados'));
  add(H2('5.5 SEGURANÇA E PRIVACIDADE'));
  add(P('A segurança dos dados é garantida no próprio banco por meio de **Row Level Security (RLS)**: todas as tabelas têm RLS habilitado, e as políticas definem que qualquer pessoa pode ler as demandas públicas, mas somente o autor ou usuários com papel de ONG ou prefeitura podem alterá-las. A sessão do usuário é mantida por cookies e renovada no *middleware* a cada requisição, utilizando o pacote `@supabase/ssr`. Chaves privadas (*service role*) nunca são expostas ao navegador, e apenas a chave pública anônima, protegida pelas políticas RLS, é utilizada no cliente. As fotografias ficam no Supabase Storage, em um *bucket* de leitura pública no qual cada usuário só consegue gravar dentro da própria pasta.'));
  add(P('Em conformidade com a LGPD (Brasil, 2018), a plataforma coleta apenas nome, e-mail e bairro, e as coordenadas registradas referem-se ao local da demanda, e não à residência do usuário.'));
  add(H2('5.6 CUSTO DE OPERAÇÃO'));
  add(quadro('Infraestrutura e custo mensal', ['Serviço', 'Plano', 'Limite relevante', 'Custo'], [
    ['Vercel', 'Hobby', '100 GB de banda/mês', 'R$ 0,00'],
    ['Supabase', 'Free', '500 MB de banco; 50 mil usuários ativos/mês', 'R$ 0,00'],
    ['OpenFreeMap', 'Público', 'Sem chave de API e sem cota por visualização', 'R$ 0,00'],
    ['Esri World Imagery', 'Público', 'Uso não comercial com atribuição', 'R$ 0,00'],
    ['GitHub', 'Free', 'Repositório público ilimitado', 'R$ 0,00'],
    ['**Total**', '', '', '**R$ 0,00**'],
  ], [3, 2, 5, 2]));

  // 6 IMPLEMENTAÇÃO ----------------------------------------------------
  add(H1('6 IMPLEMENTAÇÃO'));
  add(P('Esta seção apresenta os trechos de código mais representativos do MVP, reproduzidos a partir do repositório. Os números de linha correspondem aos arquivos originais, permitindo a conferência direta no GitHub.'));
  add(H2('6.1 ESQUEMA DO BANCO DE DADOS'));
  add(P('A Figura 3 apresenta a definição da tabela `pontos`. Os campos `tipo` e `status` utilizam tipos enumerados do PostgreSQL, o que garante que somente valores válidos sejam gravados; `urgencia` inicia em 50 e é recalculada conforme os apoios; e `necessidades` é um vetor de texto que lista o que a demanda requer (mudas, voluntários, análise técnica).'));
  add(figura('code_schema.png', 'Definição da tabela de demandas georreferenciadas (SQL)', 'Repositório Verde Urbano (2026).'));
  add(P('A Figura 4 mostra as políticas de segurança em nível de linha e o gatilho que cria automaticamente o perfil de cada novo usuário, atribuindo o papel informado no cadastro ou, por padrão, o papel “cidadão”.'));
  add(figura('code_rls.png', 'Políticas RLS e gatilho de criação de perfil', 'Repositório Verde Urbano (2026).'));
  add(P('A segunda migração (Figura 5) acrescenta a assinatura do autor nas demandas e cria o *bucket* `fotos` no Supabase Storage, com limite de 3 MB por arquivo e apenas formatos de imagem. A política de escrita compara a primeira pasta do caminho do arquivo com o identificador do usuário autenticado, impedindo que alguém sobrescreva fotos de terceiros.'));
  add(figura('code_storage.png', 'Bucket de fotos e políticas de acesso no Storage', 'Repositório Verde Urbano (2026).'));
  add(H2('6.2 SESSÃO E MIDDLEWARE'));
  add(P('O *middleware* do Next.js (Figura 6) é executado na borda (*edge*) antes das rotas protegidas. Ele cria um cliente Supabase com acesso aos cookies da requisição, renova o token de sessão quando necessário e trata redirecionamentos legados. Caso o Supabase não esteja configurado, a requisição segue normalmente, preservando o modo de demonstração.'));
  add(figura('code_middleware.png', 'Middleware de sessão com Supabase SSR', 'Repositório Verde Urbano (2026).'));
  add(H2('6.3 CAMADA DE DADOS COM FALLBACK'));
  add(P('A função `fetchDemandasFeed` (Figura 7) materializa a estratégia de degradação graciosa: consulta o Supabase ordenando por urgência e, em caso de erro, ausência de configuração ou tabela vazia, recorre aos dados de demonstração. Em todos os casos, os pontos registrados localmente pelo usuário são mesclados ao resultado.'));
  add(figura('code_usedemandas.png', 'Busca de demandas com fallback automático', 'Repositório Verde Urbano (2026).'));
  add(H2('6.4 REGISTRO DE PONTO COM GPS'));
  add(P('O cadastro de um novo ponto utiliza a API de Geolocalização do navegador com alta precisão e tempo limite de 12 segundos (Figura 8). A fotografia é pré-visualizada localmente, sem envio antecipado ao servidor. Na versão mais recente, o cidadão também pode posicionar um pino diretamente no mapa, e o ponto é assinado com o nome e o bairro do perfil. Ao concluir, terrenos baldios recebem urgência inicial maior (82) do que os demais tipos (68), refletindo o risco sanitário associado.'));
  add(figura('code_gps.png', 'Captura de GPS e envio do novo ponto', 'Repositório Verde Urbano (2026).'));
  add(P('No modo de demonstração, os pontos são persistidos no `localStorage` (Figura 9). Como as fotos são armazenadas comprimidas junto ao registro, a fila é limitada aos 20 pontos mais recentes e, se a cota do navegador for excedida, os mais antigos são descartados até que o registro caiba. Em seguida, um evento personalizado notifica os demais componentes para que o mapa e o feed sejam atualizados instantaneamente.'));
  add(figura('code_localpontos.png', 'Persistência local e mesclagem de pontos', 'Repositório Verde Urbano (2026).'));
  add(H2('6.5 ÍNDICE DE PRIORIDADE DE ARBORIZAÇÃO'));
  add(P('O núcleo analítico do projeto é o índice de prioridade, calculado para cada hexágono no pipeline Python (Figura 10). O índice é definido pela Equação 1:'));
  add(new Paragraph({ style: 'Texto', alignment: AlignmentType.LEFT, indent: { firstLine: 0 }, spacing: { before: 120, after: 120 },
    tabStops: [{ type: TabStopType.CENTER, position: Math.round(TEXT_W / 2) }, { type: TabStopType.RIGHT, position: TEXT_W }],
    children: [new TextRun('\t'), new TextRun({ text: 'P = 100 × (0,6 × F + 0,4 × C) × D', italics: true }), new TextRun('\t(1)')] }));
  add(PN('em que *F* representa a falta de copa, calculada como 1 − min(copa/0,30; 1), ou seja, uma quadra com 30% ou mais de copa arbórea tem falta nula; *C* representa o calor relativo, obtido pela normalização da temperatura de superfície entre os percentis 5 e 95 da área urbana; e *D* é o fator de densidade urbana, igual a min(construído/0,50; 1), que zera a prioridade em áreas rurais, onde o plantio urbano não se aplica. Os pesos privilegiam a falta de sombra (60%), por ser o fator sobre o qual o plantio atua diretamente.'));
  add(figura('code_prioridade.png', 'Cálculo do índice de prioridade por hexágono (Python)', 'Repositório Verde Urbano (2026).'));
  add(H2('6.6 RENDERIZAÇÃO DO MAPA'));
  add(P('No cliente, cada “lente” do mapa (prioridade, copa ou calor) é traduzida em uma expressão de estilo do MapLibre que interpola as cores a partir de paradas definidas (Figura 11). Na lente de prioridade, hexágonos fora da mancha urbana recebem um verde suave, indicando que não são alvo de plantio.'));
  add(figura('code_corexpr.png', 'Expressão de cor interpolada por lente', 'Repositório Verde Urbano (2026).'));
  add(P('A troca entre lentes é animada com um efeito de esmaecimento: a opacidade é zerada, a expressão de cor é substituída e a opacidade é restaurada após 260 ms, como mostra a Figura 12. O mesmo efeito controla a alternância entre a visualização plana e a extrusão 3D, em que a altura de cada hexágono é proporcional ao valor da lente.'));
  add(figura('code_mapa.png', 'Troca animada de lente e visibilidade das camadas', 'Repositório Verde Urbano (2026).'));
  add(H2('6.7 EXPORTAÇÃO DE DADOS ABERTOS'));
  add(P('Para que os dados produzidos pela comunidade possam ser utilizados em sistemas de informação geográfica da Prefeitura, como o QGIS, o painel exporta as demandas no padrão GeoJSON (Figura 13), gerando o arquivo inteiramente no navegador, sem necessidade de servidor.'));
  add(figura('code_geojson.png', 'Exportação das demandas em GeoJSON', 'Repositório Verde Urbano (2026).'));

  // 7 MAPA VERDE -------------------------------------------------------
  add(H1('7 MAPA VERDE DE TERESINA'));
  add(H2('7.1 PIPELINE DE DADOS'));
  add(P('O mapa verde é gerado pelo script `scripts/build_mapa_verde.py`, executado de forma *offline*, cujo fluxo está representado na Figura 14. O script lê uma janela de 10 metros do ESA WorldCover sobre Teresina, obtém a mediana da temperatura de superfície de cinco cenas Landsat 8/9 com menos de 10% de nuvens no período seco (agosto a outubro), consulta o OpenStreetMap pela API Overpass e agrega todos os dados em hexágonos H3 de resolução 9, cada um com aproximadamente 0,1 km².'));
  add(figura('diag_pipeline.png', 'Pipeline de geração do mapa verde'));
  add(H2('7.2 RESULTADOS'));
  add(P('O processamento resultou nos indicadores do Quadro 9, que caracterizam a situação da arborização na área urbana de Teresina.'));
  add(quadro('Indicadores do mapa verde de Teresina', ['Indicador', 'Valor'], [
    ['Hexágonos analisados no município', '1.884'],
    ['Hexágonos urbanos (≥ 25% de área construída)', '1.247'],
    ['Copa arbórea média na área urbana', '14,6%'],
    ['Temperatura de superfície média na área urbana (seca)', '46,0 °C'],
    ['Hexágonos críticos (copa < 5%)', '491'],
    ['Hexágonos bem arborizados (copa ≥ 25%)', '278'],
    ['Áreas verdes mapeadas no OSM', '680 (5.349 ha)'],
    ['Bairros/localidades ranqueados', '122'],
  ], [8, 4], 'Elaborado pelos autores (2026) a partir de ESA WorldCover (2021), Landsat 8/9 (2025) e OpenStreetMap (2026).'));
  add(P('A Figura 15 apresenta o mapa de prioridade resultante. Observa-se a concentração de hexágonos de prioridade urgente nas zonas sul e sudeste, em conjuntos habitacionais de ocupação densa e pouca vegetação, enquanto as áreas próximas aos rios Poti e Parnaíba e aos grandes parques apresentam menor prioridade.'));
  add(figura('mapa_prioridade.png', 'Mapa de prioridade de arborização de Teresina', 'Elaborado pelos autores (2026) com dados de ESA WorldCover (2021), USGS Landsat 8/9 (2025) e © OpenStreetMap Contributors.', 13.5));
  add(P('O ranking por bairro (Figura 16) confirma esse padrão: os doze bairros mais prioritários possuem copa média inferior a 5% e temperatura de superfície acima de 47 °C. Promorar, Dirceu Arcoverde II, Conjunto Bela Vista I, Torquato Neto e Portal da Alegria lideram a lista, sendo candidatos naturais para o projeto-piloto.'));
  add(figura('ranking_bairros.png', 'Bairros com maior índice de prioridade de arborização', 'Elaborado pelos autores (2026) a partir do pipeline do mapa verde.'));

  // 8 TELAS ------------------------------------------------------------
  add(H1('8 INTERFACE DA APLICAÇÃO'));
  add(P('A interface foi projetada com abordagem *mobile-first* e identidade visual inspirada na paisagem teresinense: o verde-folha das mangueiras, o amarelo do ipê, o vermelho da laterita e o azul dos rios Poti e Parnaíba. A tipografia combina a serifada Fraunces, nos títulos, e a sem serifa Manrope, no corpo do texto. As figuras a seguir apresentam as principais telas do MVP.'));
  add(H2('8.1 APLICATIVO DO CIDADÃO'));
  add(printApp('Página inicial (landing page) do Verde Urbano', 'Capturar a rota “/” em desktop (1440 × 900).'));
  add(printApp('Feed de demandas da comunidade', 'Capturar a rota “/feed” em modo celular (390 × 844).', 18));
  add(printApp('Mapa com lente de prioridade de arborização', 'Capturar a rota “/mapear” com a lente “Onde plantar primeiro” ativa.', 18));
  add(printApp('Detalhe de uma demanda com etapas de progresso', 'Abrir uma demanda no feed ou no mapa e capturar a folha de detalhes.', 18));
  add(printApp('Cadastro de novo ponto em quatro etapas', 'Capturar a rota “/pontos/novo” na etapa de GPS ou de foto.', 18));
  add(printApp('Agenda de mutirões e inscrição de voluntários', 'Capturar a rota “/mutiroes”.', 18));
  add(printApp('Guias de espécies nativas e órgãos competentes', 'Capturar a rota “/guias”.', 18));
  add(H2('8.2 PAINEL DE GESTÃO'));
  add(printApp('Painel de gestão com indicadores e gráficos', 'Capturar a rota “/gestao” em desktop (1440 × 900).'));
  add(printApp('Triagem de demandas cidadãs', 'Capturar a rota “/gestao/demandas”.'));
  add(printApp('Mapa de inteligência em visualização 3D', 'Capturar a rota “/gestao/mapa” com a extrusão 3D ativada.'));
  add(printApp('Relatórios e exportação de dados', 'Capturar a rota “/gestao/relatorios”.'));

  // 9 INTEGRAÇÃO -------------------------------------------------------
  add(H1('9 INTEGRAÇÃO INSTITUCIONAL'));
  add(H2('9.1 PAPEL DA ONG PARCEIRA'));
  add(P('A ONG de arborização garante o rigor técnico das intervenções em três frentes: **curadoria de espécies**, avaliando porte e sistema radicular para evitar conflitos com fiação, calçadas e galerias pluviais; **educação ambiental**, com guias de plantio, irrigação e poda disponibilizados no aplicativo; e **articulação de recursos**, mediando a obtenção de mudas junto aos viveiros municipais e a parceiros privados. O Quadro 10 apresenta o catálogo inicial de espécies, a ser validado pela ONG.'));
  add(quadro('Catálogo inicial de espécies para arborização urbana', ['Nome popular', 'Nome científico', 'Porte', 'Raiz', 'Observação'], [
    ['Ipê-amarelo', '*Handroanthus chrysotrichus*', 'Médio', 'Pivotante', 'Floração marcante; evitar sob fiação baixa.'],
    ['Ipê-roxo', '*Handroanthus impetiginosus*', 'Médio', 'Pivotante', 'Indicado para canteiros largos.'],
    ['Oiti', '*Licania tomentosa*', 'Grande', 'Superficial', 'Boa sombra; atenção a calçadas estreitas.'],
    ['Pau-ferro', '*Libidibia ferrea*', 'Médio', 'Pivotante', 'Madeira resistente; boa adaptação ao calor.'],
    ['Sibipiruna', '*Cenostigma pluviosum*', 'Grande', 'Pivotante', 'Sombra ampla em praças e avenidas.'],
    ['Mulungu', '*Erythrina mulungu*', 'Médio', 'Mista', 'Atrai polinizadores; podas periódicas.'],
    ['Caneleiro', '*Cenostigma pyramidale*', 'Médio', 'Pivotante', 'Nativa distribuída nos viveiros da SEMAM.'],
    ['Sambaíba', '*Curatella americana*', 'Médio', 'Mista', 'Nativa do cerrado piauiense.'],
  ], [2.2, 3.4, 1.4, 1.8, 4]));
  add(H2('9.2 ARTICULAÇÃO COM O PODER PÚBLICO'));
  add(P('Os conteúdos institucionais da plataforma foram construídos com base em fontes oficiais da Prefeitura de Teresina e da SEMAM (Teresina, 2026). O Quadro 11 relaciona os órgãos envolvidos e o impacto esperado da integração.'));
  add(quadro('Órgãos públicos e impacto da integração', ['Esfera', 'Órgão', 'Impacto direto'], [
    ['Municipal', 'SEMAM — Secretaria Municipal de Meio Ambiente e Recursos Hídricos', 'Direcionamento de cronogramas de plantio, distribuição de mudas e manutenção fitossanitária.'],
    ['Municipal', 'SAADs — Superintendências das Ações Administrativas Descentralizadas', 'Limpeza de terrenos, remoção de entulho e manutenção de praças por região.'],
    ['Municipal', 'Defesa Civil de Teresina', 'Avaliação de risco de queda de árvores e atendimento emergencial.'],
    ['Estadual', 'SEMARH-PI e Batalhão de Polícia Ambiental', 'Fiscalização de supressão irregular e crimes ambientais.'],
    ['Estadual', 'Ministério Público do Estado do Piauí', 'Controle externo e defesa do meio ambiente como direito difuso.'],
  ], [1.8, 4.6, 5.6]));

  // 10 RESULTADOS ------------------------------------------------------
  add(H1('10 RESULTADOS, VALIDAÇÃO E EVOLUÇÃO'));
  add(H2('10.1 RESULTADOS ALCANÇADOS'));
  add(P('O MVP foi publicado em ambiente de produção e cumpre os dez requisitos funcionais prioritários definidos na seção 4. Destacam-se como resultados: (i) a construção de um mapa de prioridade de arborização inédito para Teresina, baseado exclusivamente em dados abertos e reprodutível por qualquer pessoa; (ii) uma aplicação funcional e instalável, que opera com custo zero; e (iii) a sistematização de informações oficiais sobre competências e canais de atendimento, até então dispersas em diferentes portais.'));
  add(H2('10.2 MÉTRICAS DE VALIDAÇÃO'));
  add(P('Para o projeto-piloto, foram definidas as métricas do Quadro 12, alinhadas às hipóteses do MVP.'));
  add(quadro('Métricas de validação do piloto', ['Hipótese', 'Métrica', 'Meta do piloto'], [
    ['Cidadãos registram demandas quando o processo é simples', 'Pontos registrados; tempo médio de cadastro', '≥ 50 pontos; < 2 minutos'],
    ['A comunidade prioriza coletivamente', 'Apoios por demanda', 'Média ≥ 5 apoios'],
    ['A plataforma mobiliza ações concretas', 'Mutirões realizados; voluntários inscritos', '≥ 2 mutirões; ≥ 40 voluntários'],
    ['Os dados apoiam a decisão pública', 'Avaliação qualitativa da SEMAM e da ONG', 'Parecer favorável à continuidade'],
  ], [4.4, 4.2, 3.4]));
  add(H2('10.3 LIMITAÇÕES'));
  add(bullet('O WorldCover tem referência em 2021 e resolução de 10 m, não capturando árvores isoladas de pequeno porte nem supressões recentes.'));
  add(bullet('A temperatura de superfície difere da temperatura do ar percebida pelas pessoas, embora seja fortemente correlacionada a ela.'));
  add(bullet('A atribuição de bairro a cada hexágono utiliza a localidade do OSM mais próxima, e não os limites oficiais de bairros.'));
  add(bullet('No modo de demonstração, os registros ficam restritos ao aparelho do usuário até a ativação completa do banco de dados.'));
  add(H2('10.4 ROTEIRO DE EVOLUÇÃO'));
  add(quadro('Roteiro de implementação', ['Fase', 'Descrição', 'Entregas'], [
    ['1 — Alpha (concluída)', 'Desenvolvimento do MVP e validação técnica com a ONG.', 'Aplicação publicada; mapa verde; documentação.'],
    ['2 — Piloto', 'Implantação em um bairro prioritário do ranking, com caminhada fotográfica e mutirão.', 'Banco ativo; fotos próprias; métricas do piloto.'],
    ['3 — Cooperação', 'Apresentação dos dados consolidados à Prefeitura e proposta de termo de cooperação.', 'Relatório técnico; integração com a ouvidoria.'],
    ['4 — Expansão', 'Abertura para todo o perímetro urbano, com calendário fixo de mutirões e apoio privado.', 'Notificações; moderação; gamificação por bairro.'],
  ], [2.8, 5.4, 3.8]));

  // 11 CONSIDERAÇÕES ----------------------------------------------------
  add(H1('11 CONSIDERAÇÕES FINAIS'));
  add(P('Este trabalho apresentou o Verde Urbano, uma plataforma colaborativa que conecta cidadãos, ONG e poder público para enfrentar o déficit de arborização em Teresina. O objetivo geral foi atingido: o MVP permite mapear, priorizar e acompanhar demandas, e está disponível para uso real.'));
  add(P('A principal contribuição técnica é demonstrar que dados abertos de satélite, quando agregados em uma grade hexagonal e combinados em um índice simples e transparente, são suficientes para produzir um diagnóstico objetivo da necessidade de arborização em escala de quadra. Esse diagnóstico, somado à percepção dos moradores, oferece à gestão pública uma base sólida para priorizar investimentos.'));
  add(P('Do ponto de vista extensionista, o projeto evidencia o papel da universidade na produção de soluções tecnológicas para problemas concretos da cidade, em diálogo com a comunidade e com as instituições. Como trabalhos futuros, propõem-se a execução do piloto no bairro de maior prioridade, a medição do impacto térmico dos plantios ao longo do tempo e a formalização da cooperação com a Prefeitura de Teresina.'));
  return c;
}

// ------------------------------------------------------------------ pós-textuais
const REFS = [
  'ARNSTEIN, Sherry R. A ladder of citizen participation. **Journal of the American Institute of Planners**, [*s. l.*], v. 35, n. 4, p. 216-224, 1969.',
  'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6023**: informação e documentação: referências: elaboração. Rio de Janeiro: ABNT, 2018.',
  'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6024**: informação e documentação: numeração progressiva das seções de um documento: apresentação. Rio de Janeiro: ABNT, 2012.',
  'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6027**: informação e documentação: sumário: apresentação. Rio de Janeiro: ABNT, 2012.',
  'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6028**: informação e documentação: resumo, resenha e recensão: apresentação. Rio de Janeiro: ABNT, 2021.',
  'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 10520**: informação e documentação: citações em documentos: apresentação. Rio de Janeiro: ABNT, 2023.',
  'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 14724**: informação e documentação: trabalhos acadêmicos: apresentação. Rio de Janeiro: ABNT, 2011.',
  'BRASIL. Lei nº 10.257, de 10 de julho de 2001. Regulamenta os arts. 182 e 183 da Constituição Federal, estabelece diretrizes gerais da política urbana e dá outras providências. **Diário Oficial da União**: seção 1, Brasília, DF, 11 jul. 2001.',
  'BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). **Diário Oficial da União**: seção 1, Brasília, DF, 15 ago. 2018.',
  'BRASIL. Ministério da Educação. Conselho Nacional de Educação. Câmara de Educação Superior. Resolução nº 7, de 18 de dezembro de 2018. Estabelece as Diretrizes para a Extensão na Educação Superior Brasileira. **Diário Oficial da União**: seção 1, Brasília, DF, p. 49-50, 19 dez. 2018.',
  'GONÇALVES, Wantuelfer; PAIVA, Haroldo Nogueira de. **Árvores para o ambiente urbano**. Viçosa, MG: Aprenda Fácil, 2004.',
  'JACOBS, Jane. **Morte e vida de grandes cidades**. 3. ed. São Paulo: WMF Martins Fontes, 2011.',
  'MAPLIBRE. **MapLibre GL JS documentation**. [*S. l.*]: MapLibre, 2026. Disponível em: https://maplibre.org/maplibre-gl-js/docs/. Acesso em: 27 set. 2026.',
  'NAÇÕES UNIDAS. **Transformando nosso mundo**: a Agenda 2030 para o Desenvolvimento Sustentável. Nova York: ONU, 2015. Disponível em: https://brasil.un.org/pt-br/91863-agenda-2030-para-o-desenvolvimento-sustentavel. Acesso em: 27 set. 2026.',
  'OKE, Timothy R. The energetic basis of the urban heat island. **Quarterly Journal of the Royal Meteorological Society**, [*s. l.*], v. 108, n. 455, p. 1-24, 1982.',
  'OPENSTREETMAP CONTRIBUTORS. **OpenStreetMap**. [*S. l.*]: OpenStreetMap Foundation, 2026. Disponível em: https://www.openstreetmap.org. Acesso em: 27 set. 2026.',
  'RIES, Eric. **A startup enxuta**: como os empreendedores atuais utilizam a inovação contínua para criar empresas extremamente bem-sucedidas. São Paulo: Lua de Papel, 2012.',
  'SUPABASE. **Supabase documentation**. [*S. l.*]: Supabase, 2026. Disponível em: https://supabase.com/docs. Acesso em: 27 set. 2026.',
  'TERESINA. Secretaria Municipal de Meio Ambiente e Recursos Hídricos. **SEMAM**. Teresina: Prefeitura Municipal de Teresina, 2026. Disponível em: https://www.teresina.pi.gov.br/semam/. Acesso em: 27 set. 2026.',
  'U.S. GEOLOGICAL SURVEY. **Landsat 8-9 Collection 2 Level-2 Science Products**. Sioux Falls: USGS EROS, 2024. Disponível em: https://www.usgs.gov/landsat-missions/landsat-collection-2-level-2-science-products. Acesso em: 27 set. 2026.',
  'UBER TECHNOLOGIES. **H3**: a hexagonal hierarchical geospatial indexing system. [*S. l.*]: Uber, 2024. Disponível em: https://h3geo.org. Acesso em: 27 set. 2026.',
  'VERCEL. **Next.js documentation**. [*S. l.*]: Vercel, 2026. Disponível em: https://nextjs.org/docs. Acesso em: 27 set. 2026.',
  'WORLD HEALTH ORGANIZATION. **Urban green spaces and health**: a review of evidence. Copenhagen: WHO Regional Office for Europe, 2016.',
  'ZANAGA, Daniele *et al*. **ESA WorldCover 10 m 2021 v200**. [*S. l.*]: Zenodo, 2022. DOI: https://doi.org/10.5281/zenodo.7254221.',
];

function posTextuais() {
  const c = [H1C('REFERÊNCIAS')];
  REFS.forEach((r) => c.push(new Paragraph({ style: 'Referencia', children: runs(r) })));

  c.push(H1C('APÊNDICE A – GUIA DE INSTALAÇÃO E EXECUÇÃO'));
  c.push(P('Para executar o projeto localmente, são necessários Node.js 18 ou superior e Git. Os passos são:')); novaLista();
  c.push(alinea('clonar o repositório: `git clone ' + CFG.github + '.git`;'));
  c.push(alinea('instalar as dependências: `npm install`;'));
  c.push(alinea('opcionalmente, copiar `.env.example` para `.env.local` e preencher `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` — sem essas variáveis, a aplicação funciona com dados de demonstração;'));
  c.push(alinea('opcionalmente, executar `supabase/migrations/001_initial_schema.sql` e `002_autor_e_fotos.sql`, nessa ordem, no editor SQL do Supabase;'));
  c.push(alinea('iniciar o servidor de desenvolvimento: `npm run dev` e acessar http://localhost:3000;'));
  c.push(alinea('para regenerar o mapa verde, executar `uv run scripts/build_mapa_verde.py`.'));
  c.push(P('A publicação em produção é automática: cada *push* na ramificação `main` do GitHub dispara um novo *deploy* na Vercel.'));

  c.push(H1C('APÊNDICE B – MAPA DE ROTAS DA APLICAÇÃO'));
  c.push(...quadro('Rotas da aplicação', ['Rota', 'Tela', 'Público'], [
    ['`/`', 'Página inicial (landing page)', 'Todos'],
    ['`/feed`', 'Feed de demandas', 'Cidadão'],
    ['`/mapear`', 'Mapa com lentes de prioridade, copa e calor', 'Cidadão'],
    ['`/pontos/novo`', 'Cadastro de novo ponto', 'Cidadão'],
    ['`/pontos/[id]`', 'Detalhe de demanda', 'Cidadão'],
    ['`/mutiroes`', 'Agenda de mutirões', 'Cidadão'],
    ['`/guias`', 'Guias SEMAM, espécies e órgãos', 'Cidadão'],
    ['`/eu`', 'Perfil e apoios do usuário', 'Cidadão'],
    ['`/login` e `/cadastro`', 'Autenticação', 'Todos'],
    ['`/gestao`', 'Painel com KPIs e gráficos', 'Gestão'],
    ['`/gestao/demandas`', 'Triagem de demandas', 'Gestão'],
    ['`/gestao/mapa`', 'Mapa de inteligência', 'Gestão'],
    ['`/gestao/mutiroes`', 'Gestão de mutirões', 'Gestão'],
    ['`/gestao/projetos`', 'Curadoria de espécies', 'Gestão'],
    ['`/gestao/relatorios`', 'Relatórios e exportação GeoJSON', 'Gestão'],
    ['`/gestao/configuracoes`', 'Status do ambiente', 'Gestão'],
  ], [4.2, 5.8, 2]));
  return c;
}

// ------------------------------------------------------------------ contracapa
function contracapa() {
  const q = (f, t, u) => new TableCell({
    width: { size: TEXT_W / 2, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: img(f), transformation: { width: 170, height: 170 }, altText: { title: t, description: u, name: f } })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [new TextRun({ text: t, bold: true, size: 22, font: FONT, color: VERDE })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new ExternalHyperlink({ link: u, children: [new TextRun({ text: u.replace('https://', ''), size: 18, font: FONT, color: '2A6B7C' })] })] }),
    ] });
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  return [
    new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: img('logo.png'), transformation: { width: 90, height: 90 }, altText: { title: 'Logo', description: 'Logotipo Verde Urbano', name: 'logo2' } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: 'VERDE URBANO', bold: true, size: 32, color: VERDE, font: FONT, characterSpacing: 40 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 }, children: [new TextRun({ text: 'Mapear. Apoiar. Plantar. Juntos por uma Teresina mais verde.', italics: true, size: 22, color: '4A5C52', font: FONT })] }),
    new Table({ width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: [TEXT_W / 2, TEXT_W / 2],
      borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
      rows: [new TableRow({ children: [q('qr_site.png', 'Acesse a aplicação', CFG.site), q('qr_github.png', 'Código-fonte no GitHub', CFG.github)] })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1000 }, border: { top: { style: BorderStyle.SINGLE, size: 12, color: 'E8B84A', space: 8 } }, indent: { left: 2800, right: 2800 }, children: [] }),
    ...CFG.autores.map((a) => new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: a, size: 18, font: FONT, color: '4A5C52' })] })),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: [new TextRun({ text: `${CFG.instituicao} · ${CFG.cidade.charAt(0) + CFG.cidade.slice(1).toLowerCase()}/PI · ${CFG.ano}`, size: 18, font: FONT, color: '4A5C52' })] }),
  ];
}

// ------------------------------------------------------------------ documento
const page = { size: { width: 11906, height: 16838 }, margin: { top: 3 * CM, left: 3 * CM, bottom: 2 * CM, right: 2 * CM, header: 2 * CM, footer: CM } };
const emptyHeader = new Header({ children: [new Paragraph({ children: [] })] });
const numHeader = new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], size: 20, font: FONT })] })] });

const brk = () => new Paragraph({ children: [new PageBreak()] });

const CORPO = [...corpo(), ...posTextuais()];
const doc = new Document({
  creator: 'Equipe Verde Urbano', title: 'Verde Urbano — Documentação técnica do MVP',
  description: 'Documentação técnica do Produto Mínimo Viável do Verde Urbano', language: 'pt-BR',
  styles: {
    default: { document: { run: { font: FONT, size: 24, language: { value: 'pt-BR' } } } },
    paragraphStyles: [
      { id: 'Texto', name: 'Texto ABNT', basedOn: 'Normal', quickFormat: true,
        paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { line: 360, before: 0, after: 0 }, indent: { firstLine: 709 } } },
      { id: 'Lista', name: 'Lista ABNT', basedOn: 'Normal', paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { line: 360 } } },
      { id: 'Resumo', name: 'Resumo ABNT', basedOn: 'Normal', paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { line: 360 } } },
      { id: 'Citacao', name: 'Citação longa', basedOn: 'Normal', run: { size: 20 },
        paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { line: 240, before: 360, after: 120 }, indent: { left: 4 * CM } } },
      { id: 'Legenda', name: 'Legenda ABNT', basedOn: 'Normal', run: { size: 20 },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { line: 240, before: 240, after: 60 } } },
      { id: 'Fonte', name: 'Fonte ABNT', basedOn: 'Normal', run: { size: 20 },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { line: 240, before: 60, after: 360 } } },
      { id: 'Tabela', name: 'Texto de quadro', basedOn: 'Normal', run: { size: 20 }, paragraph: { spacing: { line: 240 } } },
      { id: 'Referencia', name: 'Referência ABNT', basedOn: 'Normal', paragraph: { alignment: AlignmentType.LEFT, spacing: { line: 240, after: 240 } } },
      { id: 'TituloPre', name: 'Título pré-textual', basedOn: 'Normal', run: { bold: true, size: 24 },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 480 } } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Texto', quickFormat: true,
        run: { bold: true, size: 24, allCaps: true, color: '000000' },
        paragraph: { pageBreakBefore: true, spacing: { before: 0, after: 480, line: 360 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Texto', quickFormat: true,
        run: { size: 24, allCaps: true, color: '000000' },
        paragraph: { spacing: { before: 480, after: 360, line: 360 }, keepNext: true, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Texto', quickFormat: true,
        run: { bold: true, size: 24, color: '000000' },
        paragraph: { spacing: { before: 360, after: 240, line: 360 }, keepNext: true, outlineLevel: 2 } },
      { id: 'TOC1', name: 'toc 1', basedOn: 'Normal', run: { bold: true, allCaps: true }, paragraph: { spacing: { line: 360 } } },
      { id: 'TOC2', name: 'toc 2', basedOn: 'Normal', run: { allCaps: true }, paragraph: { spacing: { line: 360 } } },
      { id: 'TOC3', name: 'toc 3', basedOn: 'Normal', run: { bold: true }, paragraph: { spacing: { line: 360 } } },
      { id: 'TOC4', name: 'toc 4', basedOn: 'Normal', paragraph: { spacing: { line: 360 }, indent: { left: 0 } } },
    ],
  },
  numbering: { config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1134, hanging: 425 } } } }] },
    { reference: 'alineas', levels: [{ level: 0, format: LevelFormat.LOWER_LETTER, text: '%1)', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1134, hanging: 425 } } } }] },
  ] },
  sections: [
    // capa: não contada; folha de rosto = página 1
    { properties: { page: { ...page, pageNumbers: { start: 0 } } }, headers: { default: emptyHeader }, children: capa() },
    { properties: { page }, headers: { default: emptyHeader }, children: [
      ...folhaRosto(), brk(),
      ...resumo(), brk(),
      ...abstract(), brk(),
      TPre('LISTA DE FIGURAS'),
      new TableOfContents('Lista de figuras', { captionLabelIncludingNumbers: 'Figura', beginDirty: false, cachedEntries: CAPS.Figura.map((t) => ({ title: t, level: 4, page: pg(t) })) }), brk(),
      TPre('LISTA DE QUADROS'),
      new TableOfContents('Lista de quadros', { captionLabelIncludingNumbers: 'Quadro', beginDirty: false, cachedEntries: CAPS.Quadro.map((t) => ({ title: t, level: 4, page: pg(t) })) }), brk(),
      ...listaSiglas(), brk(),
      TPre('SUMÁRIO'),
      new TableOfContents('Sumário', { headingStyleRange: '1-3', beginDirty: false, cachedEntries: TOC_ENTRIES.map((e) => ({ ...e, page: pg(e.title) })) }),
    ] },
    { properties: { page }, headers: { default: numHeader }, children: CORPO },
    { properties: { page }, headers: { default: emptyHeader }, children: contracapa() },
  ],
});

const out = path.join(__dirname, 'Documentacao_Verde_Urbano.docx');
fs.writeFileSync(path.join(__dirname, 'entries.json'), JSON.stringify({ toc: TOC_ENTRIES, caps: CAPS }, null, 1));
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(out, b); console.log('ok', out); });
