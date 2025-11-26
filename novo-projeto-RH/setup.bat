@echo off
echo ========================================
echo  RH Plus - Setup Inicial
echo ========================================
echo.

echo [1/5] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker nao encontrado. Por favor, instale o Docker Desktop.
    echo Download: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✓ Docker encontrado

echo.
echo [2/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado. Por favor, instale Node.js 18+
    echo Download: https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [3/5] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do workspace
    pause
    exit /b 1
)

echo.
echo [4/5] Configurando arquivos de ambiente...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo ✓ Criado backend\.env
) else (
    echo ✓ backend\.env ja existe
)

if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo ✓ Criado frontend\.env
) else (
    echo ✓ frontend\.env ja existe
)

echo.
echo [5/5] Iniciando servicos...
echo Subindo PostgreSQL, Redis e servicos...
docker-compose up -d postgres redis

echo Aguardando servicos iniciarem...
timeout /t 10 /nobreak

echo.
echo ========================================
echo  Setup concluido com sucesso!
echo ========================================
echo.
echo Para iniciar o desenvolvimento:
echo   npm run dev          - Inicia todos os servicos
echo   npm run dev:backend  - Apenas backend
echo   npm run dev:frontend - Apenas frontend
echo.
echo URLs de acesso:
echo   Backend:      http://localhost:3000
echo   Frontend:     http://localhost:5173
echo   Swagger:      http://localhost:3000/api-docs
echo   pgAdmin:      http://localhost:5050
echo   Redis UI:     http://localhost:8081
echo.
echo Credenciais pgAdmin:
echo   Email:    admin@rhplus.com
echo   Senha:    admin123
echo.

pause