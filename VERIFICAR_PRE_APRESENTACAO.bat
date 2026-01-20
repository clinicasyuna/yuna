@echo off
REM ============================================================================
REM Script de Verificacao Pre-Apresentacao
REM Verifica se tudo esta pronto para apresentar a diretoria
REM ============================================================================

setlocal enabledelayedexpansion

title Verificacao Pre-Apresentacao - Dashboard Yuna TI 2025

color 0A
cls

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║      VERIFICACAO PRE-APRESENTACAO - DASHBOARD YUNA TI        ║
echo ║                  Semana de 20-24 de Janeiro                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Verificar se Python esta instalado
echo [1/5] Verificando Python...
where E:\APP\deploy\.venv\Scripts\python.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Python environment encontrado
) else (
    echo ✗ ERRO: Python environment nao encontrado em E:\APP\deploy\.venv
    goto ERRO
)

REM Verificar arquivos Excel necessarios
echo [2/5] Verificando arquivos de dados...
set ARQUIVOS_OK=1

if not exist "E:\APP\deploy\CF_YUNA_TI_2025.xlsx" (
    echo ✗ Arquivo nao encontrado: CF_YUNA_TI_2025.xlsx
    set ARQUIVOS_OK=0
)

if not exist "E:\APP\deploy\Relatório_Chamados_15-01-2026_937 - Samuel Lacerda.xlsx" (
    echo ✗ Arquivo nao encontrado: Relatório_Chamados_15-01-2026_937
    set ARQUIVOS_OK=0
)

if not exist "E:\APP\deploy\Yuna - Estacoes de trabalho - 2026-01-15.xlsx" (
    echo ✗ Arquivo nao encontrado: Yuna - Estacoes de trabalho
    set ARQUIVOS_OK=0
)

if %ARQUIVOS_OK% equ 1 (
    echo ✓ Todos os arquivos de dados encontrados
) else (
    goto ERRO
)

REM Verificar script dashboard
echo [3/5] Verificando script do dashboard...
if exist "E:\APP\deploy\scripts\dashboard_unificado.py" (
    echo ✓ Script dashboard_unificado.py encontrado
) else (
    echo ✗ ERRO: Script dashboard nao encontrado
    goto ERRO
)

REM Verificar porta 8502
echo [4/5] Verificando disponibilidade da porta 8502...
netstat -ano | findstr :8502 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠ AVISO: Porta 8502 ja esta em uso
    echo Sugestao: Feche o dashboard anterior ou use outra porta
) else (
    echo ✓ Porta 8502 disponivel
)

REM Testar importacao de modulos
echo [5/5] Verificando dependencias Python...
E:\APP\deploy\.venv\Scripts\python.exe -c "import streamlit; import pandas; import plotly" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Todos os modulos necessarios estao instalados
) else (
    echo ✗ ERRO: Faltam dependencias Python
    goto ERRO
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                  ✓ TUDO PRONTO PARA APRESENTACAO!            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Para iniciar o dashboard, execute:
echo   INICIAR_DASHBOARD_APRESENTACAO.bat
echo.
echo Ou acesse diretamente:
echo   http://localhost:8502
echo.
pause
goto FIM

:ERRO
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                  ✗ ERRO ENCONTRADO                            ║
echo ║  Resolva os problemas acima antes de apresentar              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
pause
goto FIM

:FIM
endlocal
