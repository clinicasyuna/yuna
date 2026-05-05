# Script simples para adicionar GitHub Secrets
# Prerequisito: gh CLI autenticado

$Repository = "Samukajr/clinicasyuna"
$FirebaseConfigPath = "firebase-service-account.json"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Setup GitHub Secrets para SLA Notifications" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar gh CLI
Write-Host "[1/5] Verificando GitHub CLI..." -ForegroundColor Yellow
$gh_version = gh --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] $gh_version" -ForegroundColor Green
} else {
    Write-Host "  [ERRO] GitHub CLI nao encontrado" -ForegroundColor Red
    exit 1
}

# Verificar autenticacao
Write-Host "[2/5] Verificando autenticacao..." -ForegroundColor Yellow
$auth_status = gh auth status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Autenticado" -ForegroundColor Green
} else {
    Write-Host "  [ERRO] Nao autenticado. Execute: gh auth login" -ForegroundColor Red
    exit 1
}

# Carregar Firebase config
Write-Host "[3/5] Carregando firebase-service-account.json..." -ForegroundColor Yellow
if (-not (Test-Path $FirebaseConfigPath)) {
    Write-Host "  [ERRO] Arquivo nao encontrado: $FirebaseConfigPath" -ForegroundColor Red
    exit 1
}
$firebaseJson = Get-Content -Path $FirebaseConfigPath -Raw
Write-Host "  [OK] Arquivo carregado" -ForegroundColor Green

# Adicionar secrets
Write-Host "[4/5] Adicionando secrets..." -ForegroundColor Yellow

Write-Host "  - FIREBASE_SERVICE_ACCOUNT_JSON..." -ForegroundColor Cyan
$firebaseJson | gh secret set FIREBASE_SERVICE_ACCOUNT_JSON --repo $Repository
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] Adicionado" -ForegroundColor Green
} else {
    Write-Host "    [ERRO] Falha" -ForegroundColor Red
    exit 1
}

Write-Host "  - YUNA_ADMIN_URL..." -ForegroundColor Cyan
$adminUrl = "https://clinicasyuna.github.io/yuna/admin/"
$adminUrl | gh secret set YUNA_ADMIN_URL --repo $Repository
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] Adicionado" -ForegroundColor Green
} else {
    Write-Host "    [ERRO] Falha" -ForegroundColor Red
    exit 1
}

# Disparar workflow
Write-Host "[5/5] Disparando workflow de teste..." -ForegroundColor Yellow
gh workflow run "SLA Push Alerts" --repo $Repository
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Workflow disparado" -ForegroundColor Green
    Start-Sleep -Seconds 2
    Write-Host ""
    Write-Host "  Veja o status em:" -ForegroundColor Cyan
    Write-Host "  https://github.com/$Repository/actions" -ForegroundColor Yellow
} else {
    Write-Host "  [AVISO] Nao conseguiu disparar workflow (pode executar na proxima rodada)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "[SUCESSO] Tudo configurado!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://github.com/$Repository/actions" -ForegroundColor White
Write-Host "2. Veja o status do workflow SLA Push Alerts" -ForegroundColor White
Write-Host "3. Apos a execucao, confira notificacoes no painel admin" -ForegroundColor White
Write-Host ""
