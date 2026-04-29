from __future__ import annotations

from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

PAGE_SIZE = landscape(A4)
PAGE_WIDTH, PAGE_HEIGHT = PAGE_SIZE
MARGIN = 28
TITLE_GAP = 18
DESC_GAP = 12
IMAGE_GAP = 16
IMAGE_BORDER = HexColor("#D1D5DB")
TEXT_MAIN = HexColor("#1F2937")
TEXT_MUTED = HexColor("#4B5563")

SCREENSHOTS = [
    ("01_acomp_login.png", "01 - Tela de Login", "Portal dos Acompanhantes"),
    ("02_acomp_dashboard.png", "02 - Dashboard Principal", "Cards de status"),
    ("03_acomp_cards_servicos.png", "03 - Cards de Serviços", "Manutenção, Nutrição, Higienização, Hotelaria"),
    ("04_acomp_modal_manutencao.png", "04 - Modal Nova Solicitação (Manutenção)", "Formulário de abertura"),
    ("05_acomp_modal_nutricao.png", "05 - Modal Nova Solicitação (Nutrição)", "Formulário de abertura"),
    ("06_acomp_modal_higienizacao.png", "06 - Modal Nova Solicitação (Higienização)", "Formulário de abertura"),
    ("07_acomp_modal_hotelaria.png", "07 - Modal Nova Solicitação (Hotelaria)", "Formulário de abertura"),
    ("08_acomp_lista_solicitacoes.png", "08 - Lista de Solicitações", "Minhas solicitações"),
    ("09_acomp_detalhes_solicitacao.png", "09 - Detalhes de Solicitação", "Modal com detalhes"),
    ("10_acomp_modal_avaliacao.png", "10 - Modal de Avaliação", "Formulário 5 estrelas"),
    ("11_acomp_mobile.png", "11 - Dashboard Mobile", "Versão 375px"),
    ("12_admin_login.png", "12 - Tela de Login Admin", "/admin"),
    ("13_admin_dashboard.png", "13 - Dashboard Geral", "Todos departamentos"),
    ("14_admin_painel_manutencao.png", "14 - Painel Manutenção", "Seção Manutenção"),
    ("15_admin_painel_nutricao.png", "15 - Painel Nutrição", "Seção Nutrição"),
    ("16_admin_painel_higienizacao.png", "16 - Painel Higienização", "Seção Higienização"),
    ("17_admin_painel_hotelaria.png", "17 - Painel Hotelaria", "Seção Hotelaria"),
    ("18_admin_detalhes_solicitacao.png", "18 - Detalhes de Solicitação", "Modal com ações"),
    ("19_admin_usuarios_lista.png", "19 - Gestão de Usuários (Lista)", "Usuários"),
    ("20_admin_criar_usuario.png", "20 - Modal Criar Usuário", "Formulário de criação"),
    ("21_admin_editar_usuario.png", "21 - Modal Editar Usuário", "Formulário de edição"),
    ("22_admin_relatorios.png", "22 - Tela de Relatórios", "Dashboard de métricas"),
    ("23_admin_grafico_satisfacao.png", "23 - Gráfico de Satisfação", "Avaliações"),
    ("25_admin_notificacao.png", "24 - Notificações em Tempo Real", "Toast de notificação"),
    ("26_admin_timeout_sessao.png", "25 - Timeout de Sessão", "Modal de aviso"),
    ("27_console_performance_monitor.png", "26 - Performance Monitor", "showPerformanceReport()"),
    ("28_console_cache_manager.png", "27 - Cache Manager", "showCacheStats()"),
    ("29_console_listener_manager.png", "28 - Listener Manager", "showListeners()"),
    ("30_console_query_helper.png", "29 - Query Helper", "showQueryReport()"),
]


def fit_image(image_width: int, image_height: int, max_width: float, max_height: float) -> tuple[float, float]:
    scale = min(max_width / image_width, max_height / image_height)
    return image_width * scale, image_height * scale


def draw_centered_image(pdf: canvas.Canvas, image_path: Path, x: float, y: float, width: float, height: float) -> None:
    with Image.open(image_path) as image:
        image_width, image_height = image.size

    draw_width, draw_height = fit_image(image_width, image_height, width, height)
    draw_x = x + (width - draw_width) / 2
    draw_y = y + (height - draw_height) / 2

    pdf.setStrokeColor(IMAGE_BORDER)
    pdf.rect(x, y, width, height, stroke=1, fill=0)
    pdf.drawImage(str(image_path), draw_x, draw_y, width=draw_width, height=draw_height, preserveAspectRatio=True, mask="auto")


def main() -> int:
    workspace = Path(r"E:\APP\deploy")
    source_dir = workspace / "REGISTRO_YUNA_V2.0" / "5_INTERFACES" / "screenshots_originais"
    output_pdf = workspace / "UPLOAD_FINAL_BN_MARCO_2026" / "04_INTERFACES_E_MODULOS" / "YUNA_v2.0_Interfaces_Screenshots.pdf"

    pdf = canvas.Canvas(str(output_pdf), pagesize=PAGE_SIZE)
    pdf.setTitle("YUNA v2.0 - Interfaces (Screenshots)")
    pdf.setAuthor("Samuel dos Reis Lacerda Junior")
    pdf.setSubject("Capturas de tela das interfaces do sistema YUNA v2.0")

    content_width = PAGE_WIDTH - (MARGIN * 2)
    image_y = MARGIN
    image_height = PAGE_HEIGHT - (MARGIN * 2) - 54 - TITLE_GAP - 28 - DESC_GAP - IMAGE_GAP

    for filename, title, description in SCREENSHOTS:
        image_path = source_dir / filename
        if not image_path.exists():
            raise FileNotFoundError(f"Imagem não encontrada: {image_path}")

        title_y = PAGE_HEIGHT - MARGIN - 8
        pdf.setFont("Helvetica-Bold", 21)
        pdf.setFillColor(TEXT_MAIN)
        pdf.drawString(MARGIN, title_y, title)

        desc_y = title_y - TITLE_GAP - 6
        pdf.setFont("Helvetica", 13)
        pdf.setFillColor(TEXT_MUTED)
        pdf.drawString(MARGIN, desc_y, description)

        frame_y = image_y
        frame_height = desc_y - IMAGE_GAP - frame_y
        draw_centered_image(pdf, image_path, MARGIN, frame_y, content_width, frame_height)

        footer = f"YUNA v2.0 | Captura {title.split(' - ')[0]} de 29"
        pdf.setFont("Helvetica", 9)
        pdf.setFillColor(TEXT_MUTED)
        footer_width = stringWidth(footer, "Helvetica", 9)
        pdf.drawString(PAGE_WIDTH - MARGIN - footer_width, 12, footer)

        pdf.showPage()

    pdf.save()
    print(f"generated={output_pdf}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
