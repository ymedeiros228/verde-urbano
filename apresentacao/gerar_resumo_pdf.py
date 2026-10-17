# -*- coding: utf-8 -*-
"""Resumo executivo 12–15 páginas da Documentação Verde Urbano."""
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, ListFlowable, ListItem,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parent
SHOTS = ROOT / "prints-app"
DOWNLOADS = Path(r"C:\Users\Yuri\Downloads")
OUT = DOWNLOADS / "Verde_Urbano_Resumo_Executivo.pdf"
OUT2 = ROOT / "Verde_Urbano_Resumo_Executivo.pdf"

FOREST = HexColor("#0F3D28")
GREEN = HexColor("#1A5C3A")
LEAF = HexColor("#2D8A58")
MOSS = HexColor("#97BC62")
GOLD = HexColor("#E8B84A")
HEAT = HexColor("#C44B2F")
MUTED = HexColor("#5C6B62")
SOFT = HexColor("#F4F7F5")
LINE = HexColor("#D5E0D8")

PAGE_W, PAGE_H = A4
MARGIN = 1.8 * cm


def img(name, *alts):
    for n in (name, *alts):
        for base in (SHOTS, DOWNLOADS, Path(r"C:\Users\Yuri\.cursor\projects\c-Users-Yuri-Documents-trabalho-de-extensao\assets")):
            p = base / n
            if p.exists():
                return str(p)
    return None


def styles():
    return {
        "cover_title": ParagraphStyle(
            "cover_title", fontName="Helvetica-Bold", fontSize=28,
            textColor=white, alignment=TA_CENTER, spaceAfter=8, leading=34,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub", fontName="Helvetica", fontSize=12,
            textColor=MOSS, alignment=TA_CENTER, leading=16, spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1", fontName="Helvetica-Bold", fontSize=16,
            textColor=FOREST, spaceBefore=4, spaceAfter=10, leading=20,
        ),
        "h2": ParagraphStyle(
            "h2", fontName="Helvetica-Bold", fontSize=12,
            textColor=GREEN, spaceBefore=8, spaceAfter=6, leading=15,
        ),
        "body": ParagraphStyle(
            "body", fontName="Helvetica", fontSize=10,
            textColor=HexColor("#1A1F1C"), alignment=TA_JUSTIFY,
            leading=14, spaceAfter=8,
        ),
        "caption": ParagraphStyle(
            "caption", fontName="Helvetica-Oblique", fontSize=8,
            textColor=MUTED, alignment=TA_CENTER, spaceBefore=4, spaceAfter=10,
        ),
        "bullet": ParagraphStyle(
            "bullet", fontName="Helvetica", fontSize=10,
            textColor=HexColor("#1A1F1C"), leading=14, leftIndent=8, spaceAfter=3,
        ),
        "footer": ParagraphStyle(
            "footer", fontName="Helvetica", fontSize=8,
            textColor=MUTED, alignment=TA_CENTER,
        ),
        "stat_n": ParagraphStyle(
            "stat_n", fontName="Helvetica-Bold", fontSize=18,
            textColor=GREEN, alignment=TA_CENTER, leading=22,
        ),
        "stat_l": ParagraphStyle(
            "stat_l", fontName="Helvetica", fontSize=8,
            textColor=MUTED, alignment=TA_CENTER, leading=11,
        ),
    }


def header_footer(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN, PAGE_H - 1.2 * cm, PAGE_W - MARGIN, PAGE_H - 1.2 * cm)
        canvas.setFillColor(GREEN)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.drawString(MARGIN, PAGE_H - 1.0 * cm, "Verde Urbano — Resumo executivo")
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 1.0 * cm, "Extensão · Teresina/PI · 2026")
        canvas.line(MARGIN, 1.2 * cm, PAGE_W - MARGIN, 1.2 * cm)
        canvas.drawCentredString(PAGE_W / 2, 0.7 * cm, f"{doc.page}")
    canvas.restoreState()


def shot_block(path, w_cm, caption, S):
    if not path:
        return [Paragraph("<i>[captura indisponível]</i>", S["caption"])]
    im = Image(path, width=w_cm * cm, height=(w_cm * 0.58) * cm)
    im.hAlign = "CENTER"
    return [im, Paragraph(caption, S["caption"])]


def build():
    S = styles()
    story = []

    # ——— 1 CAPA (simples e estável) ———
    logo = img("verde-urbano-logo-bonita.png", "verde-urbano-logo.png")
    qr = img("qrcode-logo-vu-teresina.png", "verde-urbano-qrcode.png", "qrcode-acessar-vu-teresina.png")
    uni = img("uninassau-logo.png")

    story.append(Spacer(1, 0.3 * cm))
    if uni:
        ui = Image(uni, width=4.2 * cm, height=3.0 * cm)
        ui.hAlign = "CENTER"
        story.append(ui)
        story.append(Paragraph(
            "<b>UNINASSAU</b> · Centro Universitário Maurício de Nassau",
            ParagraphStyle("uni", fontName="Helvetica", fontSize=9, alignment=TA_CENTER,
                           textColor=MUTED, spaceBefore=2, spaceAfter=6),
        ))
    if logo:
        li = Image(logo, width=2.8 * cm, height=2.8 * cm)
        li.hAlign = "CENTER"
        story.append(li)
    story.append(Spacer(1, 0.35 * cm))
    story.append(Paragraph(
        "<font color='#0F3D28'><b>VERDE URBANO</b></font>",
        ParagraphStyle("ct", fontName="Helvetica-Bold", fontSize=24, alignment=TA_CENTER, leading=28),
    ))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(
        "Plataforma colaborativa de mapeamento, arborização<br/>e revitalização comunitária em Teresina/PI",
        ParagraphStyle("cs", fontName="Helvetica", fontSize=10, alignment=TA_CENTER, textColor=MUTED, leading=14),
    ))
    story.append(Spacer(1, 0.25 * cm))
    story.append(Paragraph(
        "<font color='#1A5C3A'><b>Resumo executivo do MVP</b></font><br/>Documentação técnica condensada (a partir do volume de 57 páginas)",
        ParagraphStyle("cs2", fontName="Helvetica", fontSize=9, alignment=TA_CENTER, textColor=MUTED, leading=13),
    ))
    story.append(Spacer(1, 0.35 * cm))
    if qr:
        qi = Image(qr, width=4.2 * cm, height=4.2 * cm)
        qi.hAlign = "CENTER"
        story.append(qi)
        story.append(Paragraph(
            "Escaneie para acessar · <b>vu-teresina.vercel.app</b>",
            ParagraphStyle("cq", fontName="Helvetica", fontSize=8, alignment=TA_CENTER, textColor=GREEN, spaceBefore=4),
        ))
    story.append(Spacer(1, 0.35 * cm))
    story.append(Paragraph(
        "<b>Equipe</b><br/>"
        "Yuri Medeiros Bandeira — 01693923<br/>"
        "Emanuel Da Silva Oliveira — 01679028<br/>"
        "Isaac Soares Almeida — 01694978<br/>"
        "Andressa Vitória dos Santos Gualter — 01701260",
        ParagraphStyle(
            "equipe", fontName="Helvetica", fontSize=8.5, alignment=TA_CENTER,
            textColor=MUTED, leading=12, spaceBefore=2,
        ),
    ))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        "Trabalho de extensão · UNINASSAU · Teresina/PI · 2026",
        ParagraphStyle("cf", fontName="Helvetica", fontSize=9, alignment=TA_CENTER, textColor=MUTED),
    ))
    story.append(PageBreak())

    # ——— 2 RESUMO ———
    story.append(Paragraph("1. Resumo", S["h1"]))
    story.append(Paragraph(
        "O crescimento urbano de Teresina, capital com uma das maiores médias de temperatura "
        "do país, evidencia a carência de cobertura arbórea e a degradação de espaços coletivos "
        "(praças, canteiros e terrenos baldios). Este trabalho de extensão apresenta o "
        "<b>Verde Urbano</b>, uma PWA que conecta cidadãos, ONG de arborização e poder público "
        "municipal para identificar, priorizar e transformar áreas carentes de vegetação.",
        S["body"],
    ))
    story.append(Paragraph(
        "O MVP permite registrar locais com foto e GPS, apoiar demandas, participar de mutirões "
        "e consultar guias SEMAM. Para gestores, oferece painel com indicadores, mapa de "
        "inteligência e exportação GeoJSON. O diferencial técnico é o <b>mapa verde real</b> "
        "de Teresina, a partir de ESA WorldCover, Landsat 8/9 e OpenStreetMap, agregados em "
        "<b>1.884 hexágonos H3</b>, com índice de prioridade que combina falta de copa, "
        "temperatura de superfície e densidade construída.",
        S["body"],
    ))
    story.append(Paragraph(
        "<b>Palavras-chave:</b> arborização urbana; participação cidadã; geoprocessamento; "
        "ilhas de calor; tecnologia cívica.",
        S["body"],
    ))
    story.append(Paragraph("Indicadores-chave do mapa verde", S["h2"]))
    stats = [
        [Paragraph("46,0 °C", S["stat_n"]), Paragraph("14,6%", S["stat_n"]),
         Paragraph("491", S["stat_n"]), Paragraph("1.884", S["stat_n"])],
        [Paragraph("temperatura média<br/>do chão na seca", S["stat_l"]),
         Paragraph("copa arbórea média<br/>na área urbana", S["stat_l"]),
         Paragraph("hexágonos críticos<br/>(copa &lt; 5%)", S["stat_l"]),
         Paragraph("hexágonos H3<br/>analisados", S["stat_l"])],
    ]
    t = Table(stats, colWidths=[4 * cm, 4 * cm, 4 * cm, 4 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SOFT),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(
        "Stack: Next.js 14, TypeScript, MapLibre GL, Supabase · custo de infraestrutura zero · "
        "publicado em <b>vu-teresina.vercel.app</b>.",
        S["body"],
    ))
    story.append(PageBreak())

    # ——— 3 PROBLEMA ———
    story.append(Paragraph("2. O problema", S["h1"]))
    story.append(Paragraph(
        "Teresina é conhecida como a “cidade verde”, título ligado às mangueiras e oitizeiros "
        "históricos. Paradoxalmente, figura entre as capitais mais quentes do Brasil. A expansão "
        "nas zonas sul, sudeste e norte gerou bairros extensos sem cobertura arbórea: terrenos "
        "baldios viram depósitos de entulho, praças perdem equipamentos e crianças brincam sem sombra.",
        S["body"],
    ))
    story.append(Paragraph(
        "<b>Pergunta-problema:</b> como transformar a percepção difusa dos moradores sobre a "
        "falta de áreas verdes em informação georreferenciada, priorizada e acionável, capaz de "
        "orientar o poder público e mobilizar a comunidade?",
        S["body"],
    ))
    # captura REAL do app (mapa calor com colmeia H3) — não ilustração gerada
    captura = img(
        "11-mapa-calor-colmeia.png",
        "mapa-calor-colmeia.png",
        "10-mapear-calor.png",
        "12-mapa-prioridade-colmeia.png",
        "02-mapear.png",
    )
    if captura:
        im = Image(captura, width=16 * cm, height=9.5 * cm)
        im.hAlign = "CENTER"
        story.append(Spacer(1, 0.25 * cm))
        story.append(im)
        story.append(Paragraph(
            "Figura — Captura real do MVP: mapa de calor de superfície com colmeia H3 "
            "(vu-teresina.vercel.app/mapear · lente Calor).",
            S["caption"],
        ))
    story.append(PageBreak())

    # ——— 4 OBJETIVOS ———
    story.append(Paragraph("3. Objetivos", S["h1"]))
    story.append(Paragraph("3.1 Objetivo geral", S["h2"]))
    story.append(Paragraph(
        "Desenvolver e validar uma plataforma web colaborativa que permita mapear, priorizar e "
        "acompanhar demandas de arborização e revitalização de espaços públicos em Teresina/PI, "
        "integrando cidadãos, ONG ambiental e órgãos públicos.",
        S["body"],
    ))
    story.append(Paragraph("3.2 Objetivos específicos", S["h2"]))
    for b in [
        "Registrar locais degradados com fotografia, categoria e coordenadas GPS;",
        "Construir mapa de prioridade com dados abertos de satélite e cartografia colaborativa;",
        "Viabilizar apoio coletivo às demandas e organização de mutirões;",
        "Disponibilizar guias técnicos de espécies nativas e competências dos órgãos (SEMAM);",
        "Oferecer painel de inteligência com indicadores e exportação de dados abertos;",
        "Manter custo de infraestrutura zero após o período acadêmico.",
    ]:
        story.append(Paragraph(f"• {b}", S["bullet"]))
    story.append(Paragraph("3.3 Justificativa (síntese)", S["h2"]))
    story.append(Paragraph(
        "A OMS associa áreas verdes à saúde cardiovascular e mental e à mitigação do calor "
        "extremo. Ilhas de calor urbanas (Oke, 1982) se agravam com superfícies impermeáveis — "
        "confirmadas em Teresina pelos 46,0 °C médios de superfície na seca. O projeto dialoga "
        "com o Estatuto da Cidade e com os ODS 11 e 13.",
        S["body"],
    ))
    story.append(PageBreak())

    # ——— 5 METODOLOGIA E PRODUTO ———
    story.append(Paragraph("4. Metodologia e visão do produto", S["h1"]))
    story.append(Paragraph(
        "Pesquisa aplicada, quali-quantitativa, com artefato tecnológico em ciclos ágeis: "
        "imersão → definição (personas, MoSCoW) → pipeline de dados → desenvolvimento → validação.",
        S["body"],
    ))
    story.append(Paragraph(
        "Princípios: <b>dados reais</b> (rastreáveis) e <b>custo zero de operação</b>, para o "
        "projeto sobreviver ao semestre e poder ser mantido pela ONG ou pela comunidade.",
        S["body"],
    ))
    story.append(Paragraph("4.1 Visão", S["h2"]))
    story.append(Paragraph(
        "Para moradores que desejam uma cidade mais sombreada, o Verde Urbano transforma "
        "denúncias isoladas em demandas priorizadas por dados e por apoio coletivo — combinando "
        "mapa real de calor/copa, curadoria de espécies e mutirões, em um fluxo único cidadão–ONG–poder público.",
        S["body"],
    ))
    story.append(Paragraph("4.2 Personas (síntese)", S["h2"]))
    pers = [
        ["Persona", "Necessidade"],
        ["Dona Francisca (cidadã)", "Registrar terreno baldio sem burocracia"],
        ["Lucas (voluntário)", "Encontrar mutirões e contribuir"],
        ["Gestão / SEMAM", "Priorizar com dados e exportar GeoJSON"],
        ["ONG parceira", "Orientar espécies e articular mudas"],
    ]
    pt = Table(pers, colWidths=[5.5 * cm, 11 * cm])
    pt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BACKGROUND", (0, 1), (-1, -1), SOFT),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(pt)
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("4.3 Fluxo do cidadão", S["h2"]))
    for b in [
        "<b>1. Mapear</b> — registra ponto com foto e GPS;",
        "<b>2. Apoiar</b> — pedidos com mais apoio sobem na prioridade;",
        "<b>3. Plantar junto</b> — mutirões com mudas dos viveiros municipais.",
    ]:
        story.append(Paragraph(f"• {b}", S["bullet"]))
    story.append(PageBreak())

    # ——— 6 TECNOLOGIA ———
    story.append(Paragraph("5. Arquitetura e tecnologias", S["h1"]))
    story.append(Paragraph(
        "Arquitetura em camadas: interface (Next.js App Router + MapLibre) na Vercel; dados "
        "(Supabase/PostgreSQL + GeoJSON estático do pipeline); mapas-base gratuitos. "
        "Degradação graciosa: sem Supabase, a app usa mock tipado e localStorage — nunca fica "
        "fora do ar em apresentações.",
        S["body"],
    ))
    tech = [
        ["Camada", "Tecnologia", "Papel"],
        ["Frontend", "Next.js 14 + TypeScript", "PWA cidadão e painel gestão"],
        ["Mapas", "MapLibre GL", "Lentes prioridade / copa / calor + H3"],
        ["Backend", "Supabase", "Auth, Postgres, Storage, RLS"],
        ["Dados", "Python (WorldCover, Landsat, OSM)", "Pipeline mapa verde offline"],
        ["Deploy", "Vercel", "Produção custo zero"],
    ]
    tt = Table(tech, colWidths=[3.2 * cm, 6.5 * cm, 6.8 * cm])
    tt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("BACKGROUND", (0, 1), (-1, -1), SOFT),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(tt)
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph("5.1 Repositório e acesso", S["h2"]))
    story.append(Paragraph(
        "App: <b>https://vu-teresina.vercel.app</b><br/>"
        "Código: <b>https://github.com/ymedeiros228/verde-urbano</b>",
        S["body"],
    ))
    if qr:
        qi = Image(qr, width=5 * cm, height=5 * cm)
        qi.hAlign = "CENTER"
        story.append(qi)
        story.append(Paragraph("Figura — QR Code de acesso à aplicação (com logo).", S["caption"]))
    story.append(PageBreak())

    # ——— 7 MAPA VERDE ———
    story.append(Paragraph("6. Mapa verde de Teresina", S["h1"]))
    story.append(Paragraph(
        "Pipeline offline (<i>scripts/build_mapa_verde.py</i>): ESA WorldCover (10 m), mediana "
        "de temperatura Landsat 8/9 (seca, &lt;10% nuvens), OSM via Overpass → agregação em "
        "hexágonos H3 resolução 9 (~0,1 km²). Índice de prioridade combina déficit de copa, "
        "temperatura e densidade construída.",
        S["body"],
    ))
    ind = [
        ["Indicador", "Valor"],
        ["Hexágonos no município", "1.884"],
        ["Hexágonos urbanos (≥25% construído)", "1.247"],
        ["Copa média urbana", "14,6%"],
        ["Temperatura média (seca)", "46,0 °C"],
        ["Críticos (copa &lt; 5%)", "491"],
        ["Bem arborizados (copa ≥ 25%)", "278"],
        ["Áreas verdes OSM", "680 (5.349 ha)"],
        ["Bairros ranqueados", "122"],
    ]
    it = Table(ind, colWidths=[10 * cm, 6.5 * cm])
    it.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("BACKGROUND", (0, 1), (-1, -1), SOFT),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(it)
    story.append(Spacer(1, 0.35 * cm))
    story.append(Paragraph(
        "Urgência concentra-se no sul/sudeste (conjuntos densos, pouca vegetação). Áreas junto "
        "aos rios Poti e Parnaíba e grandes parques têm menor prioridade. Bairros-piloto naturais: "
        "Promorar, Dirceu Arcoverde II, Torquato Neto, entre outros com copa &lt; 5% e &gt; 47 °C.",
        S["body"],
    ))
    story.append(PageBreak())

    # ——— 8 CAPTURAS MAPA ———
    story.append(Paragraph("7. Interface — mapa de inteligência", S["h1"]))
    story.append(Paragraph(
        "Três lentes sobre a mesma colmeia H3: <b>Prioridade</b> (onde plantar primeiro), "
        "<b>Copa</b> e <b>Calor</b> (temperatura de superfície). Capturas do MVP em produção.",
        S["body"],
    ))
    prio = img("12-mapa-prioridade-colmeia.png", "02-mapear.png", "mapear.png")
    calor = img("11-mapa-calor-colmeia.png", "mapa-calor-colmeia.png", "10-mapear-calor.png")
    row = []
    if prio:
        row.append(Image(prio, width=8.2 * cm, height=5.1 * cm))
    if calor:
        row.append(Image(calor, width=8.2 * cm, height=5.1 * cm))
    if row:
        tw = Table([row], colWidths=[8.5 * cm] * len(row))
        tw.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 2)]))
        story.append(tw)
        story.append(Paragraph(
            "Figura — Esquerda: lente Prioridade. Direita: lente Calor (colmeia H3).",
            S["caption"],
        ))
    sat = img("09-mapear-satelite.png")
    if sat:
        story.extend(shot_block(sat, 16, "Figura — Mapa com basemap de satélite.", S))
    story.append(PageBreak())

    # ——— 9 CAPTURAS APP ———
    story.append(Paragraph("8. Interface — app cidadão", S["h1"]))
    land = img("01-landing.png", "landing.png")
    feed = img("03-feed.png", "feed.png")
    row = []
    if land:
        row.append(Image(land, width=8.2 * cm, height=5.1 * cm))
    if feed:
        row.append(Image(feed, width=8.2 * cm, height=5.1 * cm))
    if row:
        tw = Table([row], colWidths=[8.5 * cm] * len(row))
        tw.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
        story.append(tw)
        story.append(Paragraph("Figura — Landing e feed de demandas.", S["caption"]))
    mut = img("04-mutiroes.png", "mutiroes.png")
    gui = img("05-guias.png", "guias.png")
    row = []
    if mut:
        row.append(Image(mut, width=8.2 * cm, height=5.1 * cm))
    if gui:
        row.append(Image(gui, width=8.2 * cm, height=5.1 * cm))
    if row:
        tw = Table([row], colWidths=[8.5 * cm] * len(row))
        story.append(tw)
        story.append(Paragraph("Figura — Agenda de mutirões e guias SEMAM / espécies.", S["caption"]))
    story.append(PageBreak())

    # ——— 10 INTEGRAÇÃO ———
    story.append(Paragraph("9. Integração institucional", S["h1"]))
    story.append(Paragraph("9.1 ONG parceira", S["h2"]))
    story.append(Paragraph(
        "Curadoria de espécies (porte e raiz vs. fiação/calçadas), educação ambiental "
        "(guias de plantio/irrigação/poda) e articulação de mudas com viveiros SEMAM e parceiros.",
        S["body"],
    ))
    esp = [
        ["Espécie", "Porte", "Observação"],
        ["Ipê-amarelo", "Médio", "Floração; evitar sob fiação baixa"],
        ["Oiti", "Grande", "Boa sombra; atenção a calçadas"],
        ["Pau-ferro", "Médio", "Adaptação ao calor"],
        ["Sibipiruna", "Grande", "Sombra em praças/avenidas"],
        ["Caneleiro", "Médio", "Nativa; viveiros SEMAM"],
        ["Sambaíba", "Médio", "Nativa do cerrado piauiense"],
    ]
    et = Table(esp, colWidths=[4.5 * cm, 3 * cm, 9 * cm])
    et.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("BACKGROUND", (0, 1), (-1, -1), SOFT),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(et)
    story.append(Paragraph("9.2 Poder público", S["h2"]))
    story.append(Paragraph(
        "Conteúdos baseados em fontes oficiais da Prefeitura/SEMAM. Articulação prevista com "
        "SEMAM, SAADs (limpeza/praças), Defesa Civil, SEMARH-PI / Polícia Ambiental e MPE-PI.",
        S["body"],
    ))
    story.append(PageBreak())

    # ——— 11 RESULTADOS ———
    story.append(Paragraph("10. Resultados, validação e evolução", S["h1"]))
    story.append(Paragraph("10.1 Resultados alcançados", S["h2"]))
    for b in [
        "Mapa de prioridade de arborização inédito para Teresina, com dados abertos e reprodutível;",
        "Aplicação funcional e instalável (PWA), com custo zero de infraestrutura;",
        "Sistematização de informações oficiais sobre competências e canais (antes dispersas).",
    ]:
        story.append(Paragraph(f"• {b}", S["bullet"]))
    story.append(Paragraph("10.2 Métricas do piloto", S["h2"]))
    met = [
        ["Hipótese", "Métrica / meta"],
        ["Cadastro simples", "≥ 50 pontos; &lt; 2 min por registro"],
        ["Priorização coletiva", "Média ≥ 5 apoios por demanda"],
        ["Ação concreta", "≥ 2 mutirões; ≥ 40 voluntários"],
        ["Decisão pública", "Parecer favorável SEMAM/ONG"],
    ]
    mt = Table(met, colWidths=[6 * cm, 10.5 * cm])
    mt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("BACKGROUND", (0, 1), (-1, -1), SOFT),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(mt)
    story.append(Paragraph("10.3 Limitações", S["h2"]))
    for b in [
        "WorldCover (2021, 10 m) não captura árvores isoladas pequenas nem cortes recentes;",
        "Temperatura de superfície ≠ temperatura do ar, embora correlacionada;",
        "Bairro do hexágono via localidade OSM mais próxima (não limites oficiais);",
        "Modo demo: registros locais até ativação completa do banco.",
    ]:
        story.append(Paragraph(f"• {b}", S["bullet"]))
    story.append(Paragraph("10.4 Roteiro", S["h2"]))
    for b in [
        "<b>Alpha (concluída)</b> — MVP, mapa verde, documentação;",
        "<b>Piloto</b> — bairro prioritário, banco ativo, métricas;",
        "<b>Cooperação</b> — Prefeitura, termo de cooperação;",
        "<b>Expansão</b> — periurbano, mutirões fixos, gamificação por bairro.",
    ]:
        story.append(Paragraph(f"• {b}", S["bullet"]))
    story.append(PageBreak())

    # ——— 12 FECHO ———
    story.append(Paragraph("11. Considerações finais", S["h1"]))
    story.append(Paragraph(
        "O MVP valida a hipótese de que <b>dados abertos</b> e <b>participação comunitária</b> "
        "podem orientar, de forma objetiva, a política de arborização urbana. O Verde Urbano "
        "oferece um canal estruturado do registro cidadão à ação coletiva e à decisão pública, "
        "com evidência espacial rastreável e operação sustentável a custo zero.",
        S["body"],
    ))
    story.append(Spacer(1, 0.4 * cm))
    uni_end = img("uninassau-logo.png")
    end_row = []
    if uni_end:
        end_row.append(Image(uni_end, width=3.6 * cm, height=2.6 * cm))
    if logo:
        end_row.append(Image(logo, width=3.0 * cm, height=3.0 * cm))
    if qr:
        end_row.append(Image(qr, width=4.5 * cm, height=4.5 * cm))
    if end_row:
        duo = Table([end_row], colWidths=[5.5 * cm] * len(end_row))
        duo.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(duo)
    story.append(Paragraph(
        "<b>Mapear. Apoiar. Plantar.</b> Juntos por uma Teresina mais verde.",
        ParagraphStyle("end", parent=S["body"], alignment=TA_CENTER, fontSize=12, textColor=FOREST),
    ))
    story.append(Paragraph(
        "vu-teresina.vercel.app · github.com/ymedeiros228/verde-urbano<br/><br/>"
        "<b>Equipe:</b><br/>"
        "Yuri Medeiros Bandeira — 01693923<br/>"
        "Emanuel Da Silva Oliveira — 01679028<br/>"
        "Isaac Soares Almeida — 01694978<br/>"
        "Andressa Vitória dos Santos Gualter — 01701260<br/><br/>"
        "UNINASSAU · Extensão 2026 · Teresina/PI",
        ParagraphStyle("end2", parent=S["caption"], fontSize=8, alignment=TA_CENTER, leading=11),
    ))
    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=0.6, color=LINE))
    story.append(Paragraph(
        "Este documento resume a Documentação técnica do MVP (57 p.). Para detalhes de código, "
        "ER, RLS e apêndices, consultar o volume completo.",
        S["caption"],
    ))

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm,
        title="Verde Urbano — Resumo executivo",
        author="Yuri Medeiros Bandeira; Emanuel Da Silva Oliveira; Isaac Soares Almeida; Andressa Vitória dos Santos Gualter",
    )
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    OUT2.write_bytes(OUT.read_bytes())
    # count pages
    from pypdf import PdfReader
    n = len(PdfReader(str(OUT)).pages)
    print(f"OK {OUT} ({n} páginas, {OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
