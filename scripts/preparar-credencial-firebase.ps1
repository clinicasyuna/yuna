param(
    [Parameter(Mandatory = $true)]
    [string]$SourceJsonPath,
    [string]$TargetProjectId = "app-pedidos-4656c"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $SourceJsonPath)) {
    throw "Arquivo de credencial nao encontrado: $SourceJsonPath"
}

$json = Get-Content -LiteralPath $SourceJsonPath -Raw | ConvertFrom-Json
if (-not $json.project_id) {
    throw "Credencial invalida: campo project_id ausente."
}

if ($json.project_id -ne $TargetProjectId) {
    throw "Credencial do projeto '$($json.project_id)' nao corresponde ao alvo '$TargetProjectId'."
}

$secretsDir = Join-Path (Resolve-Path "$PSScriptRoot\..") ".secrets"
if (-not (Test-Path -LiteralPath $secretsDir)) {
    New-Item -ItemType Directory -Path $secretsDir | Out-Null
}

$targetPath = Join-Path $secretsDir "firebase-service-account.json"
Copy-Item -LiteralPath $SourceJsonPath -Destination $targetPath -Force

Write-Host "Credencial validada e copiada para: $targetPath" -ForegroundColor Green
Write-Host "Projeto confirmado: $TargetProjectId" -ForegroundColor Green
Write-Host ""
Write-Host "Use assim na sessao atual:" -ForegroundColor Cyan
Write-Host "$env:FIREBASE_SERVICE_ACCOUNT_PATH = '.secrets/firebase-service-account.json'" -ForegroundColor Yellow
Write-Host ""
Write-Host "Exemplo de execucao de script:" -ForegroundColor Cyan
Write-Host "node scripts/recriar-usuarios.js" -ForegroundColor Yellow
