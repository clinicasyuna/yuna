Param(
    [string]$DataRef = (Get-Date -Format "yyyyMMdd"),
    [string]$MainBranch = "main"
)

$ErrorActionPreference = "Stop"

$backupBranch = "backup/producao-estavel-$DataRef"
$releaseTag = "release-producao-estavel-$DataRef"

Write-Host "Criando snapshot de producao..." -ForegroundColor Cyan

git checkout $MainBranch
git pull origin $MainBranch

git checkout -b $backupBranch
git push -u origin $backupBranch

git checkout $MainBranch
git tag $releaseTag
git push origin $releaseTag

Write-Host "Snapshot criado com sucesso:" -ForegroundColor Green
Write-Host "Branch: $backupBranch"
Write-Host "Tag: $releaseTag"
