const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const SHOTS = path.join(__dirname, 'shots');
const OUT = path.join(__dirname, 'Verde_Urbano_Apresentacao.pptx');

const C = {
  forest: '0F3D28',
  green: '1A5C3A',
  leaf: '2D8A58',
  moss: '97BC62',
  gold: 'E8B84A',
  heat: 'C44B2F',
  ink: '1A1F1C',
  muted: '5C6B62',
  white: 'FFFFFF',
  soft: 'F4F7F5',
  card: 'E8F0EA',
};

function shot(name) {
  const p = path.join(SHOTS, name);
  return fs.existsSync(p) ? p : null;
}

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.3 x 7.5
pres.author = 'Yuri Medeiros';
pres.title = 'Verde Urbano — Trabalho de Extensão';
pres.subject = 'Plataforma colaborativa de arborização urbana · Teresina/PI';

// —— 1 CAPA ——
{
  const s = pres.addSlide();
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 7.5,
    fill: { color: C.forest },
  });
  // soft leaf wash
  s.addShape(pres.shapes.OVAL, {
    x: 9.2, y: -1.5, w: 6, h: 6,
    fill: { color: C.green },
    transparency: 55,
  });
  s.addShape(pres.shapes.OVAL, {
    x: -2, y: 4.5, w: 5, h: 5,
    fill: { color: C.leaf },
    transparency: 70,
  });
  s.addText('TRABALHO DE EXTENSÃO · 2026', {
    x: 0.7, y: 1.6, w: 10, h: 0.35,
    fontSize: 13, fontFace: 'Calibri', color: C.moss,
    bold: true, charSpacing: 3, margin: 0, isTextBox: true,
  });
  s.addText('Verde Urbano', {
    x: 0.7, y: 2.15, w: 11, h: 1.1,
    fontSize: 60, fontFace: 'Cambria', color: C.white,
    bold: true, margin: 0, isTextBox: true,
  });
  s.addText('Mapear. Apoiar. Plantar.\nJuntos por uma Teresina mais verde.', {
    x: 0.7, y: 3.4, w: 9, h: 1.1,
    fontSize: 22, fontFace: 'Calibri', color: C.moss,
    margin: 0, isTextBox: true,
  });
  s.addText('Yuri Medeiros  ·  Teresina/PI  ·  vu-teresina.vercel.app', {
    x: 0.7, y: 6.6, w: 11, h: 0.35,
    fontSize: 14, fontFace: 'Calibri', color: C.moss,
    margin: 0, isTextBox: true,
  });
}

// —— 2 PROBLEMA ——
{
  const s = pres.addSlide();
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.white },
  });
  s.addText('O PROBLEMA', {
    x: 0.7, y: 0.45, w: 6, h: 0.3,
    fontSize: 12, fontFace: 'Calibri', color: C.leaf, bold: true,
    charSpacing: 2, margin: 0, isTextBox: true,
  });
  s.addText('Teresina precisa de sombra.', {
    x: 0.7, y: 0.85, w: 11.5, h: 0.7,
    fontSize: 36, fontFace: 'Cambria', color: C.forest, bold: true,
    margin: 0, isTextBox: true,
  });
  s.addText(
    'Uma das capitais mais quentes do Brasil — com pouca cobertura arbórea, praças degradadas e terrenos baldios sem canal estruturado de registro.',
    {
      x: 0.7, y: 1.65, w: 11.5, h: 0.7,
      fontSize: 16, fontFace: 'Calibri', color: C.muted,
      margin: 0, isTextBox: true,
    }
  );

  const cards = [
    { n: '14,6%', l: 'copa média\nna área urbana', c: C.green },
    { n: '46 °C', l: 'temperatura\ndo chão na seca', c: C.heat },
    { n: '491', l: 'quadras críticas\nsem sombra', c: C.forest },
  ];
  cards.forEach((card, i) => {
    const x = 0.7 + i * 4.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 2.7, w: 3.8, h: 3.5,
      fill: { color: C.soft },
      rectRadius: 0.15,
    });
    s.addText(card.n, {
      x: x + 0.3, y: 3.2, w: 3.2, h: 1.2,
      fontSize: 48, fontFace: 'Cambria', color: card.c, bold: true,
      margin: 0, isTextBox: true,
    });
    s.addText(card.l, {
      x: x + 0.3, y: 4.6, w: 3.2, h: 1,
      fontSize: 16, fontFace: 'Calibri', color: C.muted,
      margin: 0, isTextBox: true,
    });
  });
  s.addText('Fonte: ESA WorldCover + Landsat 8/9 · 1.884 hexágonos H3', {
    x: 0.7, y: 6.9, w: 11, h: 0.3,
    fontSize: 11, fontFace: 'Calibri', color: C.muted, margin: 0, isTextBox: true,
  });
}

// —— 3 OBJETIVOS ——
{
  const s = pres.addSlide();
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.soft },
  });
  s.addText('OBJETIVOS', {
    x: 0.7, y: 0.45, w: 6, h: 0.3,
    fontSize: 12, fontFace: 'Calibri', color: C.leaf, bold: true,
    charSpacing: 2, margin: 0, isTextBox: true,
  });
  s.addText('O que o MVP precisa validar', {
    x: 0.7, y: 0.85, w: 11, h: 0.6,
    fontSize: 34, fontFace: 'Cambria', color: C.forest, bold: true,
    margin: 0, isTextBox: true,
  });

  const goals = [
    { t: 'Mapear', d: 'Registrar locais degradados com foto, categoria e GPS.' },
    { t: 'Priorizar', d: 'Mapa de prioridade com dados abertos de satélite.' },
    { t: 'Mobilizar', d: 'Apoio coletivo e mutirões voluntários.' },
    { t: 'Orientar', d: 'Guias SEMAM de espécies e competências dos órgãos.' },
    { t: 'Decidir', d: 'Painel de gestão com indicadores e GeoJSON.' },
    { t: 'Sustentar', d: 'Infraestrutura a custo zero após o semestre.' },
  ];
  goals.forEach((g, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.7 + col * 4.1;
    const y = 1.8 + row * 2.4;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 3.85, h: 2.15,
      fill: { color: C.white },
      rectRadius: 0.12,
      shadow: { type: 'outer', color: '000000', blur: 10, opacity: 0.08, offset: 3, angle: 90 },
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.3, y: y + 0.35, w: 0.45, h: 0.45,
      fill: { color: C.green },
    });
    s.addText(String(i + 1), {
      x: x + 0.3, y: y + 0.4, w: 0.45, h: 0.35,
      fontSize: 14, fontFace: 'Calibri', color: C.white, bold: true,
      align: 'center', margin: 0, isTextBox: true,
    });
    s.addText(g.t, {
      x: x + 0.9, y: y + 0.35, w: 2.7, h: 0.4,
      fontSize: 20, fontFace: 'Cambria', color: C.forest, bold: true,
      margin: 0, isTextBox: true,
    });
    s.addText(g.d, {
      x: x + 0.3, y: y + 1.05, w: 3.25, h: 0.8,
      fontSize: 14, fontFace: 'Calibri', color: C.muted,
      margin: 0, isTextBox: true,
    });
  });
}

// —— 4 SOLUÇÃO ——
{
  const s = pres.addSlide();
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.white },
  });
  s.addText('A SOLUÇÃO', {
    x: 0.7, y: 0.45, w: 6, h: 0.3,
    fontSize: 12, fontFace: 'Calibri', color: C.leaf, bold: true,
    charSpacing: 2, margin: 0, isTextBox: true,
  });
  s.addText('Uma plataforma, três atores', {
    x: 0.7, y: 0.85, w: 11, h: 0.6,
    fontSize: 34, fontFace: 'Cambria', color: C.forest, bold: true,
    margin: 0, isTextBox: true,
  });
  s.addText(
    'PWA que conecta cidadão, ONG de arborização e poder público para identificar, priorizar e transformar áreas sem vegetação.',
    {
      x: 0.7, y: 1.55, w: 11.5, h: 0.55,
      fontSize: 16, fontFace: 'Calibri', color: C.muted, margin: 0, isTextBox: true,
    }
  );

  const actors = [
    { t: 'Cidadão', d: 'Registra pontos, apoia demandas, entra em mutirões e consulta guias.' },
    { t: 'ONG', d: 'Orienta espécies, organiza plantios e acompanha a revitalização.' },
    { t: 'Gestão', d: 'Painel com mapa de inteligência, triagem e exportação GeoJSON.' },
  ];
  actors.forEach((a, i) => {
    const x = 0.7 + i * 4.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 2.5, w: 3.85, h: 3.6,
      fill: { color: i === 1 ? C.green : C.soft },
      rectRadius: 0.14,
    });
    const tc = i === 1 ? C.white : C.forest;
    const dc = i === 1 ? 'C8E0D0' : C.muted;
    s.addText(a.t, {
      x: x + 0.35, y: 3.1, w: 3.15, h: 0.55,
      fontSize: 26, fontFace: 'Cambria', color: tc, bold: true,
      margin: 0, isTextBox: true,
    });
    s.addText(a.d, {
      x: x + 0.35, y: 3.9, w: 3.15, h: 1.6,
      fontSize: 16, fontFace: 'Calibri', color: dc,
      margin: 0, isTextBox: true,
    });
  });
}

// —— 5 MAPA (print) ——
{
  const s = pres.addSlide();
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.forest },
  });
  s.addText('DIFERENCIAL', {
    x: 0.55, y: 0.35, w: 5, h: 0.28,
    fontSize: 12, fontFace: 'Calibri', color: C.moss, bold: true,
    charSpacing: 2, margin: 0, isTextBox: true,
  });
  s.addText('Onde plantar primeiro', {
    x: 0.55, y: 0.7, w: 7, h: 0.5,
    fontSize: 28, fontFace: 'Cambria', color: C.white, bold: true,
    margin: 0, isTextBox: true,
  });
  const map = shot('mapear.png') || shot('01-mapear.png');
  if (map) {
    s.addImage({
      path: map,
      x: 0.5, y: 1.4, w: 8.4, h: 5.5,
      rounding: { tl: 0.1, tr: 0.1, br: 0.1, bl: 0.1 },
    });
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 9.15, y: 1.4, w: 3.7, h: 5.5,
    fill: { color: C.green },
    rectRadius: 0.12,
  });
  const facts = [
    { n: '1.884', l: 'hexágonos H3' },
    { n: '10 m', l: 'resolução satélite' },
    { n: '3 lentes', l: 'Prioridade · Copa · Calor' },
    { n: 'ESA + USGS', l: 'dados abertos reais' },
  ];
  facts.forEach((f, i) => {
    const y = 1.7 + i * 1.25;
    s.addText(f.n, {
      x: 9.45, y, w: 3.2, h: 0.45,
      fontSize: 24, fontFace: 'Cambria', color: C.gold, bold: true,
      margin: 0, isTextBox: true,
    });
    s.addText(f.l, {
      x: 9.45, y: y + 0.45, w: 3.2, h: 0.4,
      fontSize: 13, fontFace: 'Calibri', color: C.moss,
      margin: 0, isTextBox: true,
    });
  });
}

// —— 6 LANDING (print) ——
{
  const s = pres.addSlide();
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.soft },
  });
  s.addText('PRODUTO', {
    x: 0.55, y: 0.35, w: 5, h: 0.28,
    fontSize: 12, fontFace: 'Calibri', color: C.leaf, bold: true,
    charSpacing: 2, margin: 0, isTextBox: true,
  });
  s.addText('A cara do app', {
    x: 0.55, y: 0.7, w: 6, h: 0.5,
    fontSize: 28, fontFace: 'Cambria', color: C.forest, bold: true,
    margin: 0, isTextBox: true,
  });
  const land = shot('landing.png') || shot('02-landing.png');
  if (land) {
    s.addImage({
      path: land,
      x: 0.5, y: 1.35, w: 12.3, h: 5.7,
    });
  }
}

// —— 7 FEED + MUTIRÕES ——
{
  const s = pres.addSlide();
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.white },
  });
  s.addText('CIDADÃO', {
    x: 0.5, y: 0.3, w: 5, h: 0.28,
    fontSize: 12, fontFace: 'Calibri', color: C.leaf, bold: true,
    charSpacing: 2, margin: 0, isTextBox: true,
  });
  s.addText('Do pedido ao plantio', {
    x: 0.5, y: 0.6, w: 12, h: 0.45,
    fontSize: 28, fontFace: 'Cambria', color: C.forest, bold: true,
    margin: 0, isTextBox: true,
  });
  const feed = shot('feed.png');
  const mut = shot('mutiroes.png');
  if (feed) {
    s.addImage({ path: feed, x: 0.4, y: 1.25, w: 6.2, h: 5.6 });
  }
  if (mut) {
    s.addImage({ path: mut, x: 6.8, y: 1.25, w: 6.1, h: 5.6 });
  }
}

// —— 8 GUIAS ——
{
  const s = pres.addSlide();
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.soft },
  });
  s.addText('ORIENTAÇÃO', {
    x: 0.55, y: 0.35, w: 5, h: 0.28,
    fontSize: 12, fontFace: 'Calibri', color: C.leaf, bold: true,
    charSpacing: 2, margin: 0, isTextBox: true,
  });
  s.addText('Guias SEMAM e espécies nativas', {
    x: 0.55, y: 0.7, w: 10, h: 0.5,
    fontSize: 28, fontFace: 'Cambria', color: C.forest, bold: true,
    margin: 0, isTextBox: true,
  });
  const guias = shot('guias.png');
  if (guias) {
    s.addImage({ path: guias, x: 0.5, y: 1.4, w: 8.3, h: 5.5 });
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 9.05, y: 1.4, w: 3.75, h: 5.5,
    fill: { color: C.white },
    rectRadius: 0.12,
  });
  s.addText('O que o cidadão encontra', {
    x: 9.35, y: 1.75, w: 3.2, h: 0.7,
    fontSize: 16, fontFace: 'Cambria', color: C.forest, bold: true,
    margin: 0, isTextBox: true,
  });
  const tips = [
    'Espécies nativas / adaptadas',
    'Porte e tipo de raiz',
    'Viveiros municipais',
    'Órgãos competentes',
    'Fontes oficiais SEMAM',
  ];
  tips.forEach((t, i) => {
    s.addText('→  ' + t, {
      x: 9.35, y: 2.7 + i * 0.65, w: 3.2, h: 0.5,
      fontSize: 14, fontFace: 'Calibri', color: C.muted,
      margin: 0, isTextBox: true,
    });
  });
}

// —— 9 RESULTADOS ——
{
  const s = pres.addSlide();
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.white },
  });
  s.addText('RESULTADOS', {
    x: 0.7, y: 0.45, w: 6, h: 0.3,
    fontSize: 12, fontFace: 'Calibri', color: C.leaf, bold: true,
    charSpacing: 2, margin: 0, isTextBox: true,
  });
  s.addText('O que entregamos', {
    x: 0.7, y: 0.85, w: 11, h: 0.55,
    fontSize: 34, fontFace: 'Cambria', color: C.forest, bold: true,
    margin: 0, isTextBox: true,
  });

  const results = [
    { t: 'Mapa verde inédito', d: 'Prioridade de arborização de Teresina com dados abertos e reprodutíveis.' },
    { t: 'App publicado', d: 'PWA em produção — vu-teresina.vercel.app — instalável no celular.' },
    { t: 'Custo zero', d: 'Next.js, MapLibre, Vercel e dados abertos — sustentável após o semestre.' },
    { t: 'Hipótese validada', d: 'Dados + participação cidadã orientam política de arborização urbana.' },
  ];
  results.forEach((r, i) => {
    const y = 1.7 + i * 1.25;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.7, y, w: 11.9, h: 1.1,
      fill: { color: C.soft },
      rectRadius: 0.1,
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.9, y: y + 0.28, w: 0.55, h: 0.55,
      fill: { color: C.green },
      rectRadius: 0.08,
    });
    s.addText(String(i + 1), {
      x: 0.9, y: y + 0.35, w: 0.55, h: 0.4,
      fontSize: 16, fontFace: 'Calibri', color: C.white, bold: true,
      align: 'center', margin: 0, isTextBox: true,
    });
    s.addText(r.t, {
      x: 1.7, y: y + 0.18, w: 10.5, h: 0.35,
      fontSize: 18, fontFace: 'Cambria', color: C.forest, bold: true,
      margin: 0, isTextBox: true,
    });
    s.addText(r.d, {
      x: 1.7, y: y + 0.55, w: 10.5, h: 0.4,
      fontSize: 14, fontFace: 'Calibri', color: C.muted,
      margin: 0, isTextBox: true,
    });
  });
}

// —— 10 FECHO ——
{
  const s = pres.addSlide();
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.forest },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 8.5, y: -2, w: 7, h: 7,
    fill: { color: C.green },
    transparency: 50,
  });
  s.addText('OBRIGADO', {
    x: 0.8, y: 1.8, w: 11, h: 0.5,
    fontSize: 14, fontFace: 'Calibri', color: C.moss, bold: true,
    charSpacing: 4, margin: 0, isTextBox: true,
  });
  s.addText('Mapear. Apoiar. Plantar.', {
    x: 0.8, y: 2.4, w: 11.5, h: 0.9,
    fontSize: 42, fontFace: 'Cambria', color: C.white, bold: true,
    margin: 0, isTextBox: true,
  });
  s.addText('Juntos por uma Teresina mais verde.', {
    x: 0.8, y: 3.35, w: 11, h: 0.5,
    fontSize: 22, fontFace: 'Calibri', color: C.moss,
    margin: 0, isTextBox: true,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 4.4, w: 5.5, h: 1.5,
    fill: { color: C.green },
    rectRadius: 0.12,
  });
  s.addText('Acesse o app', {
    x: 1.1, y: 4.6, w: 5, h: 0.35,
    fontSize: 13, fontFace: 'Calibri', color: C.moss, margin: 0, isTextBox: true,
  });
  s.addText('vu-teresina.vercel.app', {
    x: 1.1, y: 5.05, w: 5, h: 0.5,
    fontSize: 22, fontFace: 'Calibri', color: C.white, bold: true,
    margin: 0, isTextBox: true,
  });

  s.addText('Yuri Medeiros  ·  Extensão 2026  ·  Teresina/PI', {
    x: 0.8, y: 6.6, w: 11, h: 0.35,
    fontSize: 14, fontFace: 'Calibri', color: C.moss,
    margin: 0, isTextBox: true,
  });
}

pres.writeFile({ fileName: OUT }).then(() => {
  console.log('OK', OUT);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
