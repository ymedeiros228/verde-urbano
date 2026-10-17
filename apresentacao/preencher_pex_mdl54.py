# -*- coding: utf-8 -*-
"""Preenche o formulário PEX-MDL-54 (Projeto de Intervenção — Extensão) com o Verde Urbano."""
from __future__ import annotations

import shutil
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.shared import Pt, Twips
from docx.table import _Cell

SRC = Path(
    r"c:\Users\Yuri\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm"
    r"\LocalState\sessions\07FBEA9241EA14D514941BECDB3FB2C20341E370\transfers\2026-39"
    r"\PEX-MDL-54 -PROJETO DE INTERVENÇÃ - (DISCIPLINA DE EXTENSÃO - DISCENTE).docx"
)
OUT_DIR = Path(__file__).resolve().parent
OUT = OUT_DIR / "PEX-MDL-54_Verde_Urbano_Projeto_Intervencao.docx"
DOWNLOADS = Path.home() / "Downloads" / OUT.name


def set_run_font(run, *, size=12, bold=False, name="Arial"):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold


def clear_cell(cell: _Cell):
    """Remove paragraphs and nested tables inside the cell (keeps tcPr)."""
    tc = cell._tc
    for child in list(tc):
        if child.tag in (qn("w:p"), qn("w:tbl")):
            tc.remove(child)


def add_para(
    cell: _Cell,
    text: str,
    *,
    bold=False,
    size=12,
    align=WD_ALIGN_PARAGRAPH.JUSTIFY,
    space_after=6,
    first_line_indent=True,
):
    p = cell.add_paragraph()
    p.alignment = align
    pf = p.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(space_after)
    pf.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
    if first_line_indent and align == WD_ALIGN_PARAGRAPH.JUSTIFY and text and not bold:
        pf.first_line_indent = Cm_ish(1.25)
    run = p.add_run(text)
    set_run_font(run, size=size, bold=bold)
    return p


def Cm_ish(cm: float) -> Twips:
    # 1 cm ≈ 567 twips
    return Twips(int(cm * 567))


def set_plain_cell(cell: _Cell, text: str, *, size=11, bold=False):
    """Replace cell content with a single left-aligned paragraph (dados do projeto)."""
    # reuse first paragraph if present
    if cell.paragraphs:
        p0 = cell.paragraphs[0]
        for r in p0.runs:
            r.text = ""
        # clear extra paragraphs
        tc = cell._tc
        for child in list(tc):
            if child.tag == qn("w:p") and child is not p0._p:
                tc.remove(child)
        if p0.runs:
            p0.runs[0].text = text
            set_run_font(p0.runs[0], size=size, bold=bold)
        else:
            run = p0.add_run(text)
            set_run_font(run, size=size, bold=bold)
        p0.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p0.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
    else:
        add_para(cell, text, bold=bold, size=size, align=WD_ALIGN_PARAGRAPH.LEFT, first_line_indent=False)


def fill_section_cell(cell: _Cell, title: str, paragraphs: list[str], *, bullets: list[str] | None = None):
    """Keep section title bold, then body text (ABNT-like: Arial 12, 1,5, justificado)."""
    clear_cell(cell)
    add_para(cell, title, bold=True, size=12, align=WD_ALIGN_PARAGRAPH.LEFT, space_after=8, first_line_indent=False)
    for t in paragraphs:
        add_para(cell, t, size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=8, first_line_indent=True)
    if bullets:
        for b in bullets:
            p = add_para(cell, b, size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=4, first_line_indent=False)
            p.paragraph_format.left_indent = Cm_ish(1.0)


def add_cronograma_table(cell: _Cell, doc: Document):
    clear_cell(cell)
    add_para(cell, "Cronograma", bold=True, size=12, align=WD_ALIGN_PARAGRAPH.LEFT, space_after=8, first_line_indent=False)
    add_para(
        cell,
        "As atividades foram organizadas em etapas sequenciais ao longo do semestre letivo de 2026, "
        "combinando pesquisa aplicada, desenvolvimento do artefato tecnológico, validação com o "
        "público e sistematização dos resultados para a banca de extensão.",
        size=12,
        space_after=8,
    )

    rows = [
        ("Etapa", "Atividades", "Período"),
        ("1. Imersão e diagnóstico", "Levantamento do problema local; estudo de competências SEMAM/SAADs; definição de personas e escopo MoSCoW.", "Fev–Mar/2026"),
        ("2. Pipeline de dados", "Processamento de ESA WorldCover, Landsat 8/9 e OpenStreetMap; geração da grade H3 (1.884 hexágonos) e índice de prioridade.", "Mar–Abr/2026"),
        ("3. Desenvolvimento do MVP", "Implementação da PWA (Next.js, MapLibre, Supabase): mapear, feed, mutirões, guias e painel de gestão.", "Abr–Jun/2026"),
        ("4. Validação e ajustes", "Testes de usabilidade; publicação em produção (vu-teresina.vercel.app); correções de mapa/calor e fluxos cidadão–gestão.", "Jun–Ago/2026"),
        ("5. Extensão e articulação", "Organização de conteúdos SEMAM; preparação de mutirões-piloto; diálogo com viveiros e potenciais parceiros comunitários.", "Ago–Set/2026"),
        ("6. Documentação e banca", "Documentação técnica, resumo executivo, apresentação e entrega do Projeto de Intervenção (PEX-MDL-54).", "Set/2026"),
    ]

    # Tabela aninhada: cria no corpo e move para dentro da célula
    table = doc.add_table(rows=len(rows), cols=3)
    table.style = "Table Grid"
    for i, vals in enumerate(rows):
        for j, val in enumerate(vals):
            p = table.rows[i].cells[j].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if j < 2 else WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(val)
            set_run_font(run, size=9, bold=(i == 0))
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)

    # Âncora: último parágrafo da célula; em seguida move a tabela
    anchor = cell.paragraphs[-1]._p
    anchor.addnext(table._tbl)


def main():
    if not SRC.exists():
        raise SystemExit(f"Modelo não encontrado: {SRC}")

    shutil.copy2(SRC, OUT)
    doc = Document(str(OUT))

    # ——— Título ———
    title = (
        "Verde Urbano: plataforma colaborativa de mapeamento, arborização "
        "e revitalização de espaços públicos em Teresina/PI"
    )
    para = doc.paragraphs[8]
    para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if para.runs:
        para.runs[0].text = title
        set_run_font(para.runs[0], size=14, bold=True)
        for r in para.runs[1:]:
            r.text = ""
    else:
        run = para.add_run(title)
        set_run_font(run, size=14, bold=True)

    # ——— Tabela 0: dados ———
    t0 = doc.tables[0]
    set_plain_cell(t0.rows[1].cells[1], "Sistemas de Informação — Centro Universitário Maurício de Nassau (UNINASSAU), Teresina/PI")
    set_plain_cell(
        t0.rows[2].cells[1],
        "Meio Ambiente (interface com Tecnologia e Produção / tecnologia cívica)",
    )
    set_plain_cell(
        t0.rows[3].cells[1],
        "Yuri Medeiros Bandeira — 01693923\n"
        "Emanuel Da Silva Oliveira — 01679028\n"
        "Isaac Soares Almeida — 01694978\n"
        "Andressa Vitória dos Santos Gualter — 01701260",
    )
    set_plain_cell(t0.rows[4].cells[1], "04 (quatro) discentes")

    # ——— Introdução ———
    fill_section_cell(
        doc.tables[1].rows[0].cells[0],
        "Introdução",
        [
            "Teresina/PI carrega historicamente o epíteto de “Cidade Verde”, expressão atribuída ao "
            "escritor Coelho Neto em visita à capital em 1899. Contudo, levantamento da própria "
            "Secretaria Municipal do Meio Ambiente, repercutido pelo G1 Piauí, indica que a cidade "
            "perde, em média, área verde equivalente a 217 campos de futebol por ano — perda "
            "concentrada sobretudo nos quintais residenciais, além de canteiros e demais espaços "
            "urbanos (G1 PI; TV CLUBE, 2024). O analista ambiental Leonardo Madeira observa que "
            "retirar vegetação nos lotes contribui para o aquecimento urbano e questiona a "
            "permanência do título sob a realidade atual.",
            "A capital figura entre as mais quentes do Brasil. No período conhecido localmente como "
            "BR-O-BRÓ, a redução da cobertura arbórea agrava a sensação térmica e a baixa umidade. "
            "Análises do próprio projeto, com Landsat 8/9 e ESA WorldCover, apontam temperatura média "
            "de superfície próxima de 46,0 °C na estação seca e cobertura de copa média em torno de "
            "14,6% na área urbana — quadro compatível com o diagnóstico do Plano Diretor de "
            "Arborização Urbana (2023), que registra densidade arbórea inferior a 200 árvores/km em "
            "todas as zonas e ausência de sombreamento em calçadas comerciais.",
            "Diante desse cenário, a percepção difusa dos moradores sobre a falta de sombra raramente "
            "se converte em informação georreferenciada, priorizada e acionável. O projeto Verde "
            "Urbano responde a essa lacuna com uma Progressive Web App (PWA) que conecta cidadãos, "
            "ONG de arborização e gestão municipal (SEMAM), permitindo mapear demandas, apoiar pontos "
            "prioritários, organizar mutirões e consultar guias de plantio — alinhando-se também à "
            "Agenda 2030 municipal de rearborização (meta de mais de 1,5 milhão de mudas em 30 anos). "
            "O diferencial técnico é o mapa de prioridade em 1.884 hexágonos H3, a partir de dados "
            "abertos. O MVP está publicado em https://vu-teresina.vercel.app.",
        ],
    )

    # ——— Objetivos ———
    fill_section_cell(
        doc.tables[2].rows[0].cells[0],
        "Objetivo",
        [
            "Objetivo geral: desenvolver e validar uma plataforma web colaborativa que permita mapear, "
            "priorizar e acompanhar demandas de arborização e revitalização de espaços públicos em "
            "Teresina/PI, integrando cidadãos, organização não governamental ambiental e órgãos públicos.",
            "Objetivos específicos:",
        ],
        bullets=[
            "• Registrar locais degradados ou carentes de vegetação com fotografia, categoria e coordenadas GPS;",
            "• Construir mapa de prioridade a partir de dados abertos de satélite e cartografia colaborativa;",
            "• Viabilizar apoio coletivo às demandas e a organização de mutirões de plantio;",
            "• Disponibilizar guias técnicos de espécies adequadas e competências dos órgãos (SEMAM e correlatos);",
            "• Oferecer painel de inteligência espacial com indicadores e exportação em formato aberto (GeoJSON);",
            "• Manter custo de infraestrutura próximo de zero, assegurando continuidade após o semestre letivo.",
        ],
    )

    # ——— Caracterização da área ———
    fill_section_cell(
        doc.tables[3].rows[0].cells[0],
        "Caracterização da área",
        [
            "Teresina, capital do Piauí, situa-se às margens do rio Parnaíba, com clima tropical quente "
            "e longos períodos de estiagem. A malha urbana organiza-se nas zonas Centro, Norte, Sul, "
            "Leste, Sudeste e Rural, sob gestão descentralizada das SAADs e política ambiental "
            "coordenada pela SEMAM. Culturalmente, o imaginário da “Cidade Verde” remonta a Coelho "
            "Neto (1899); ambientalmente, porém, a perda contínua de vegetação — em especial nos "
            "quintais — tensiona esse imaginário (G1 PI; TV CLUBE, 2024).",
            "Dados municipais e o Plano Diretor de Arborização Urbana (elaborado em 2023 em parceria "
            "com a Ferma Engenharia) apontam: densidade arbórea abaixo da referência de 200 árvores/km "
            "em todas as zonas; calçadas comerciais sem sombreamento adequado; e uso relativo melhor "
            "de canteiros centrais. A prefeitura mantém três viveiros (Zonas Norte, Leste e Sul) com "
            "produção estimada de 10 a 15 mil mudas/mês e doação à população, além da Agenda 2030 de "
            "rearborização com meta de mais de 1,5 milhão de mudas em 30 anos.",
            "No recorte do pipeline do Verde Urbano, 491 hexágonos H3 apresentam copa inferior a 5%, "
            "configurando zonas críticas. O projeto cobre o perímetro urbano, com ênfase em bairros de "
            "expansão e baixa cobertura vegetal, na escala municipal necessária ao mapa de prioridade "
            "e à articulação com viveiros, SAADs e SEMAM.",
        ],
    )

    # ——— Local e público ———
    fill_section_cell(
        doc.tables[4].rows[0].cells[0],
        "Local de execução e público-alvo",
        [
            "Local de execução: município de Teresina/PI, com base digital na plataforma Verde Urbano "
            "(produção em https://vu-teresina.vercel.app) e potencial de ações presenciais em praças, "
            "canteiros, terrenos baldios e entorno de viveiros municipais da SEMAM (a exemplo do Parque "
            "da Cidade / Palácio Verde e demais viveiros oficiais).",
            "Público-alvo direto: (i) moradores e moradoras que desejam registrar e acompanhar demandas "
            "de arborização ou revitalização; (ii) voluntários e coletivos interessados em mutirões; "
            "(iii) gestores e técnicos da SEMAM e de órgãos parceiros que necessitem de visão "
            "priorizada e dados exportáveis.",
            "Público-alvo indireto: comunidade escolar e acadêmica da UNINASSAU, organizações "
            "ambientais locais e população beneficiada pelo aumento de sombra e pela melhoria de "
            "espaços coletivos nos bairros intervenientes.",
        ],
    )

    # ——— Materiais e métodos ———
    fill_section_cell(
        doc.tables[5].rows[0].cells[0],
        "Materiais e métodos de abordagem",
        [
            "Trata-se de pesquisa aplicada, de natureza quali-quantitativa, orientada à construção de "
            "artefato tecnológico em ciclos ágeis (imersão, definição, pipeline de dados, desenvolvimento "
            "e validação). Os princípios norteadores são o uso de dados reais e rastreáveis e a operação "
            "com custo de infraestrutura nulo ou mínimo.",
            "Materiais e tecnologias: aplicativo web (PWA) desenvolvido em Next.js 14 e TypeScript; "
            "mapas interativos com MapLibre GL; backend/autenticação em Supabase (PostgreSQL, Storage e "
            "RLS); hospedagem na Vercel; pipeline offline em Python para ESA WorldCover (10 m), mediana "
            "de temperatura de superfície Landsat 8/9 e densidade construída via OpenStreetMap, "
            "agregados em grade H3. Produtos digitais incluem feed de demandas, mapa com lentes de "
            "prioridade/copa/calor, agenda de mutirões, guias SEMAM/espécies e painel de gestão com "
            "exportação GeoJSON.",
            "Método de abordagem junto ao público: o cidadão acessa a PWA pelo navegador ou instalação "
            "no celular; registra pontos com foto e GPS; apoia demandas de terceiros; consulta guias e "
            "participa de mutirões. Gestores utilizam o painel para triagem, indicadores e exportação. "
            "A participação é voluntária, mediada por interface acessível, com conteúdos institucionais "
            "baseados em fontes oficiais da Prefeitura de Teresina/SEMAM. A validação ocorre por uso "
            "real em produção, testes de fluxo e sistematização documental para a disciplina de extensão.",
        ],
    )

    # ——— Resultados esperados ———
    fill_section_cell(
        doc.tables[6].rows[0].cells[0],
        "Resultados esperados",
        [
            "Na formação profissional da equipe, espera-se consolidar competências em engenharia de "
            "software, geoprocessamento aplicado, produto digital e extensão universitária — da escuta "
            "do território à entrega de solução em produção, com documentação técnica e comunicação "
            "para banca e parceiros.",
            "No público-alvo, espera-se: (i) canal estruturado para transformar reclamações isoladas em "
            "demandas georreferenciadas; (ii) mapa de prioridade compreensível para mobilização e "
            "apoio à decisão pública; (iii) maior acesso a orientações de plantio e competências "
            "institucionais; (iv) estímulo a mutirões e à corresponsabilidade cidadã pela arborização.",
            "Como indicadores de êxito do MVP: plataforma publicada e estável; mapa verde com 1.884 "
            "hexágonos analisados; fluxos de registro/apoio/gestão operacionais; materiais de "
            "disseminação (resumo executivo e apresentação); e modelo sustentável a custo zero para "
            "continuidade pós-disciplina.",
        ],
    )

    # ——— Cronograma ———
    add_cronograma_table(doc.tables[7].rows[0].cells[0], doc)

    # ——— Referências ABNT ———
    refs = [
        "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 6023: informação e documentação — referências — elaboração. Rio de Janeiro: ABNT, 2018.",
        "BRASIL. Lei nº 10.257, de 10 de julho de 2001. Regulamenta os arts. 182 e 183 da Constituição Federal, estabelece diretrizes gerais da política urbana e dá outras providências (Estatuto da Cidade). Diário Oficial da União: Brasília, DF, 11 jul. 2001.",
        "EUROPEAN SPACE AGENCY. ESA WorldCover 10 m 2021. 2021. Disponível em: https://esa-worldcover.org/. Acesso em: 20 set. 2026.",
        "G1 PI; TV CLUBE. Cidade Verde? Teresina perde área verde equivalente a mais de 200 campos de futebol por ano, diz relatório. G1, Teresina, 23 jul. 2024. Disponível em: https://g1.globo.com/pi/piaui/noticia/2024/07/23/cidade-verde-teresina-perde-area-verde-equivalente-a-mil-campos-de-futebol-por-ano-diz-relatorio.ghtml. Acesso em: 27 set. 2026.",
        "OKE, T. R. The energetic basis of the urban heat island. Quarterly Journal of the Royal Meteorological Society, v. 108, n. 455, p. 1-24, 1982.",
        "OPENSTREETMAP CONTRIBUTORS. OpenStreetMap. Disponível em: https://www.openstreetmap.org/. Acesso em: 20 set. 2026.",
        "ORGANIZAÇÃO DAS NAÇÕES UNIDAS. Transformando nosso mundo: a Agenda 2030 para o Desenvolvimento Sustentável. Nova York: ONU, 2015. (ODS 11 e 13).",
        "TERESINA. Secretaria Municipal de Meio Ambiente e Recursos Hídricos — SEMAM. Portal da Prefeitura de Teresina. Disponível em: https://www.teresina.pi.gov.br/semam/. Acesso em: 20 set. 2026.",
        "UNITED STATES GEOLOGICAL SURVEY. Landsat 8/9 Collection. Disponível em: https://www.usgs.gov/landsat-missions. Acesso em: 20 set. 2026.",
        "VERDE URBANO. Plataforma colaborativa de mapeamento e arborização urbana — Teresina/PI. 2026. Disponível em: https://vu-teresina.vercel.app. Acesso em: 27 set. 2026.",
    ]
    clear_cell(doc.tables[8].rows[0].cells[0])
    add_para(
        doc.tables[8].rows[0].cells[0],
        "Referências",
        bold=True,
        size=12,
        align=WD_ALIGN_PARAGRAPH.LEFT,
        space_after=8,
        first_line_indent=False,
    )
    for ref in refs:
        p = add_para(
            doc.tables[8].rows[0].cells[0],
            ref,
            size=11,
            align=WD_ALIGN_PARAGRAPH.JUSTIFY,
            space_after=6,
            first_line_indent=False,
        )
        # ABNT hanging indent
        p.paragraph_format.left_indent = Cm_ish(1.25)
        p.paragraph_format.first_line_indent = Cm_ish(-1.25)

    doc.save(str(OUT))
    shutil.copy2(OUT, DOWNLOADS)
    print("OK", OUT)
    print("OK", DOWNLOADS)


if __name__ == "__main__":
    main()
