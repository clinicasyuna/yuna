@echo off
REM ============================================================================
REM Script para iniciar Dashboard Yuna TI 2025 - Apresentação Diretoria
REM ============================================================================

title Dashboard Yuna TI 2025 - Apresentacao Diretoria

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     DASHBOARD YUNA TI 2025 - APRESENTAÇÃO DIRETORIA          ║
echo ║                                                                ║
echo ║  Iniciando dashboard em 3 segundos...                        ║
echo ║  Acesse em seu navegador: http://localhost:8502             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

timeout /t 3

REM Navegar para diretório do projeto
cd /d E:\APP\deploy

REM Iniciar o dashboard
E:\APP\deploy\.venv\Scripts\streamlit.exe run scripts\dashboard_unificado.py --server.port 8502

pause
