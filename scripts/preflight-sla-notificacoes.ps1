Param(
    [string]$RootPath = "."
)

$ErrorActionPreference = "Stop"

function Add-Result {
    param(
        [System.Collections.ArrayList]$List,
        [string]$Check,
        [bool]$Ok,
        [string]$Detail
    )

    [void]$List.Add([PSCustomObject]@{
        Check = $Check
        Ok = $Ok
        Detail = $Detail
    })
}

$results = New-Object System.Collections.ArrayList

$pushScript = Join-Path $RootPath "admin/push-notifications.js"
$workflow = Join-Path $RootPath ".github/workflows/sla-push-alerts.yml"
$worker = Join-Path $RootPath "firebase-messaging-sw.js"
$senderScript = Join-Path $RootPath "scripts/send-sla-push-alerts.js"
$firebaseRc = Join-Path $RootPath ".firebaserc"
$firebaseConfig = Join-Path $RootPath "firebase-config-secure.js"

Add-Result -List $results -Check "Arquivo admin/push-notifications.js" -Ok (Test-Path $pushScript) -Detail $pushScript
Add-Result -List $results -Check "Arquivo workflow sla-push-alerts.yml" -Ok (Test-Path $workflow) -Detail $workflow
Add-Result -List $results -Check "Arquivo firebase-messaging-sw.js" -Ok (Test-Path $worker) -Detail $worker
Add-Result -List $results -Check "Arquivo scripts/send-sla-push-alerts.js" -Ok (Test-Path $senderScript) -Detail $senderScript

if (Test-Path $pushScript) {
    $pushContent = Get-Content $pushScript -Raw
    $hasPlaceholder = $pushContent -match "PREENCHER_CHAVE_PUBLICA_VAPID_AQUI"
    Add-Result -List $results -Check "Chave VAPID configurada" -Ok (-not $hasPlaceholder) -Detail "Placeholder removido = $(-not $hasPlaceholder)"
}

if ((Test-Path $firebaseRc) -and (Test-Path $firebaseConfig)) {
    $rc = Get-Content $firebaseRc -Raw
    $cfg = Get-Content $firebaseConfig -Raw

    $rcMatch = [regex]::Match($rc, '"default"\s*:\s*"([^"]+)"')
    $cfgMatch = [regex]::Match($cfg, 'projectId\s*:\s*"([^"]+)"')

    if ($rcMatch.Success -and $cfgMatch.Success) {
        $rcProject = $rcMatch.Groups[1].Value
        $cfgProject = $cfgMatch.Groups[1].Value
        $sameProject = $rcProject -eq $cfgProject
        Add-Result -List $results -Check "Projeto Firebase CLI x Front" -Ok $sameProject -Detail ".firebaserc=$rcProject | firebase-config-secure.js=$cfgProject"
    }
}

$results | Format-Table -AutoSize

$failed = @($results | Where-Object { [System.Convert]::ToBoolean($_.Ok) -eq $false })
if ($failed.Count -gt 0) {
    Write-Host "" 
    Write-Host "Preflight com pendencias. Ajuste os itens marcados antes do deploy." -ForegroundColor Yellow
    exit 1
}

Write-Host "" 
Write-Host "Preflight concluido com sucesso. Ambiente pronto para deploy da notificacao SLA." -ForegroundColor Green
