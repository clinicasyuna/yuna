Param(
    [string]$AdminUrl = "https://clinicasyuna.github.io/yuna/admin/?v=20260114-2130",
    [string]$AcompanhantesUrl = "https://clinicasyuna.github.io/yuna/acompanhantes/"
)

$ErrorActionPreference = "Stop"

function Test-UrlStatus {
    param(
        [string]$Url,
        [string]$Nome
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 20 -UseBasicParsing
        [PSCustomObject]@{
            Check = $Nome
            Url = $Url
            StatusCode = $response.StatusCode
            Ok = ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400)
        }
    }
    catch {
        [PSCustomObject]@{
            Check = $Nome
            Url = $Url
            StatusCode = "ERROR"
            Ok = $false
        }
    }
}

Write-Host "Iniciando validacao pos deploy..." -ForegroundColor Cyan

$results = @()
$results += Test-UrlStatus -Url $AdminUrl -Nome "Admin URL"
$results += Test-UrlStatus -Url $AcompanhantesUrl -Nome "Acompanhantes URL"

$results | Format-Table -AutoSize

$failed = $results | Where-Object { -not $_.Ok }

if ($failed.Count -gt 0) {
    Write-Host "Falha em checks HTTP. Revisar deploy antes de liberar." -ForegroundColor Red
    exit 1
}

Write-Host "Checks HTTP basicos concluidos com sucesso." -ForegroundColor Green
Write-Host "Proximo passo manual: validar login, criacao de solicitacao, fluxo de status e finalizacao." -ForegroundColor Yellow
