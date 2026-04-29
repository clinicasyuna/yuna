param(
    [string]$ProtocolFolder = ".\\PROTOCOLO_FINAL_YUNA_2026-03-30"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProtocolFolder)) {
    Write-Error "Pasta de protocolo nao encontrada: $ProtocolFolder"
}

$requiredFiles = @(
    "CHECKLIST_PRONTO_PARA_PROTOCOLO_FINAL_2026-03-30.md",
    "RELATORIO_CONFORMIDADE_BN_EDA_LEI9609_9610_2026-03-30.md",
    "README_PROTOCOLO_FINAL.md",
    "01_FORMULARIOS\\Declaracao_Autoria_Cartorio_Yuna_Solicite_v2.pdf",
    "03_CODIGO_E_HASHES\\codigo-fonte-yuna-v2.0.zip",
    "03_CODIGO_E_HASHES\\HASHES.txt"
)

$recommendedFiles = @(
    "01_FORMULARIOS\\Formulario_Oficial_Vigente_Assinado.pdf",
    "02_DOCUMENTOS_IDENTIFICACAO\\CNH_Samuel_dos_Reis_Lacerda_Junior.pdf",
    "02_DOCUMENTOS_IDENTIFICACAO\\CPF_Samuel_dos_Reis_Lacerda_Junior.pdf",
    "05_INTERFACES_E_DIAGRAMAS\\YUNA_v2.0_Interfaces_Screenshots.pdf",
    "05_INTERFACES_E_DIAGRAMAS\\YUNA_v2.0_Diagramas_Arquitetura.pdf",
    "06_COMPROVANTES_E_PROTOCOLO\\Comprovante_Pagamento_Taxa.pdf",
    "06_COMPROVANTES_E_PROTOCOLO\\Comprovante_Protocolo_Oficial.pdf"
)

$placeholderPattern = '\[(PREENCHER|SEU CPF|NUMERO|VALOR|DATA|Seu Nome/Empresa|Data do primeiro commit|Preencher|N.?MERO)'
$textExtensions = @("*.md", "*.txt", "*.html", "*.ps1", "*.json")
$placeholderIgnoreFiles = @(
    "CHECKLIST_PRONTO_PARA_PROTOCOLO_FINAL_2026-03-30.md",
    "RELATORIO_CONFORMIDADE_BN_EDA_LEI9609_9610_2026-03-30.md"
)

$missingRequired = @()
foreach ($relPath in $requiredFiles) {
    $fullPath = Join-Path $ProtocolFolder $relPath
    if (-not (Test-Path $fullPath)) {
        $missingRequired += $relPath
    }
}

$missingRecommended = @()
foreach ($relPath in $recommendedFiles) {
    $fullPath = Join-Path $ProtocolFolder $relPath
    if (-not (Test-Path $fullPath)) {
        $missingRecommended += $relPath
    }
}

$placeholderFindings = @()
foreach ($pattern in $textExtensions) {
    $files = Get-ChildItem -Path $ProtocolFolder -Recurse -File -Filter $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if ($placeholderIgnoreFiles -contains $file.Name) {
            continue
        }
        $matches = Select-String -Path $file.FullName -Pattern $placeholderPattern -CaseSensitive:$false
        foreach ($match in $matches) {
            $relative = $file.FullName.Replace((Resolve-Path $ProtocolFolder).Path + "\\", "")
            $placeholderFindings += [PSCustomObject]@{
                File = $relative
                Line = $match.LineNumber
                Text = $match.Line.Trim()
            }
        }
    }
}

$zipHashes = @()
$zipFiles = Get-ChildItem -Path $ProtocolFolder -Recurse -File -Filter "*.zip" -ErrorAction SilentlyContinue
foreach ($zip in $zipFiles) {
    $hash = Get-FileHash -Path $zip.FullName -Algorithm SHA256
    $relative = $zip.FullName.Replace((Resolve-Path $ProtocolFolder).Path + "\\", "")
    $zipHashes += [PSCustomObject]@{
        File = $relative
        SHA256 = $hash.Hash
    }
}

$goNoGo = "GO"
if ($missingRequired.Count -gt 0 -or $placeholderFindings.Count -gt 0) {
    $goNoGo = "NO-GO"
}

$reportPath = Join-Path $ProtocolFolder "VALIDACAO_FINAL_RELATORIO.md"
$lines = @()
$lines += "# VALIDACAO FINAL DE PROTOCOLO"
$lines += ""
$lines += "Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$lines += "Pasta validada: $ProtocolFolder"
$lines += "Resultado: $goNoGo"
$lines += ""
$lines += "## 1) Arquivos obrigatorios"
if ($missingRequired.Count -eq 0) {
    $lines += "- Status: OK"
} else {
    $lines += "- Status: FALHA"
    foreach ($item in $missingRequired) {
        $lines += "- Ausente: $item"
    }
}
$lines += ""
$lines += "## 2) Arquivos recomendados pendentes"
if ($missingRecommended.Count -eq 0) {
    $lines += "- Nenhum pendente"
} else {
    foreach ($item in $missingRecommended) {
        $lines += "- Pendente: $item"
    }
}
$lines += ""
$lines += "## 3) Placeholders detectados"
if ($placeholderFindings.Count -eq 0) {
    $lines += "- Nenhum placeholder critico encontrado"
} else {
    foreach ($finding in $placeholderFindings) {
        $lines += "- $($finding.File):$($finding.Line) -> $($finding.Text)"
    }
}
$lines += ""
$lines += "## 4) Hashes SHA256 dos ZIPs"
if ($zipHashes.Count -eq 0) {
    $lines += "- Nenhum ZIP encontrado"
} else {
    foreach ($zipHash in $zipHashes) {
        $lines += "- $($zipHash.File): $($zipHash.SHA256)"
    }
}
$lines += ""
$lines += "## 5) Criterio de saida"
$lines += "- GO: sem arquivos obrigatorios ausentes e sem placeholders criticos"
$lines += "- NO-GO: com arquivos obrigatorios ausentes ou placeholders criticos"

Set-Content -Path $reportPath -Value $lines -Encoding UTF8
Write-Output "relatorio=$reportPath"
Write-Output "resultado=$goNoGo"

if ($goNoGo -eq "NO-GO") {
    exit 1
}
