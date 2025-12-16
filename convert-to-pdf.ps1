# Script para converter Markdown para PDF usando Pandoc + Chrome/Edge
# Autor: Samuel dos Reis Lacerda Junior

param(
    [string]$MarkdownFile,
    [string]$OutputPdf
)

function Convert-MarkdownToPdf {
    param($MdFile, $PdfFile)
    
    Write-Host "Convertendo $MdFile para PDF..." -ForegroundColor Cyan
    
    # Extrair informações do arquivo
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($MdFile)
    $tempHtml = "$fileName-temp.html"
    
    # Converter MD para HTML com estilo
    $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>$fileName</title>
    <style>
        @page {
            size: A4;
            margin: 2.5cm;
        }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-top: 0;
            font-size: 24pt;
        }
        h2 {
            color: #34495e;
            border-bottom: 2px solid #95a5a6;
            padding-bottom: 8px;
            margin-top: 30px;
            font-size: 18pt;
        }
        h3 {
            color: #7f8c8d;
            margin-top: 20px;
            font-size: 14pt;
        }
        h4, h5, h6 {
            color: #95a5a6;
            font-size: 12pt;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 10pt;
        }
        pre {
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
            page-break-inside: avoid;
        }
        pre code {
            background-color: transparent;
            padding: 0;
            font-size: 9pt;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #3498db;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }
        li {
            margin: 5px 0;
        }
        blockquote {
            border-left: 4px solid #3498db;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #ecf0f1;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            font-size: 9pt;
            color: #7f8c8d;
        }
        .author-info {
            background-color: #e8f4f8;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: white; border: none; margin: 0;">Sistema de Gerenciamento YUNA</h1>
        <p style="margin: 10px 0 0 0;">Documentação Oficial para Registro de Direitos Autorais</p>
    </div>
    <div class="author-info">
        <strong>Autor:</strong> Samuel dos Reis Lacerda Junior<br>
        <strong>Data:</strong> $(Get-Date -Format "dd/MM/yyyy")<br>
        <strong>Documento:</strong> $fileName
    </div>
"@

    # Ler o conteúdo markdown
    $mdContent = Get-Content $MdFile -Raw -Encoding UTF8
    
    # Converter markdown para HTML usando pandoc
    $htmlBody = & pandoc $MdFile -f markdown -t html
    
    $htmlContent += $htmlBody
    $htmlContent += @"
    <div class="footer">
        <p><strong>Sistema YUNA - Gerenciamento de Solicitações de Saúde</strong></p>
        <p>© 2024-2025 Samuel dos Reis Lacerda Junior - Todos os direitos reservados</p>
        <p>Documento gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")</p>
    </div>
</body>
</html>
"@
    
    # Salvar HTML temporário
    $htmlContent | Out-File -FilePath $tempHtml -Encoding UTF8
    
    Write-Host "HTML temporário criado: $tempHtml" -ForegroundColor Green
    
    # Tentar converter com Microsoft Edge (PrintToPDF)
    try {
        $edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        if (-not (Test-Path $edgePath)) {
            $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
        }
        
        if (Test-Path $edgePath) {
            Write-Host "Usando Microsoft Edge para conversão..." -ForegroundColor Yellow
            $htmlFullPath = (Resolve-Path $tempHtml).Path
            $pdfFullPath = Join-Path (Get-Location) $PdfFile
            
            # Converter usando Edge em modo headless
            & $edgePath --headless --disable-gpu --print-to-pdf="$pdfFullPath" "file:///$($htmlFullPath.Replace('\','/'))"
            
            Start-Sleep -Seconds 3
            
            if (Test-Path $PdfFile) {
                Write-Host "✓ PDF criado com sucesso: $PdfFile" -ForegroundColor Green
                Remove-Item $tempHtml -Force
                return $true
            }
        }
    } catch {
        Write-Host "Erro com Edge: $_" -ForegroundColor Red
    }
    
    # Fallback: Tentar com Chrome
    try {
        $chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
        if (-not (Test-Path $chromePath)) {
            $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
        }
        
        if (Test-Path $chromePath) {
            Write-Host "Usando Google Chrome para conversão..." -ForegroundColor Yellow
            $htmlFullPath = (Resolve-Path $tempHtml).Path
            $pdfFullPath = Join-Path (Get-Location) $PdfFile
            
            & $chromePath --headless --disable-gpu --print-to-pdf="$pdfFullPath" "file:///$($htmlFullPath.Replace('\','/'))"
            
            Start-Sleep -Seconds 3
            
            if (Test-Path $PdfFile) {
                Write-Host "✓ PDF criado com sucesso: $PdfFile" -ForegroundColor Green
                Remove-Item $tempHtml -Force
                return $true
            }
        }
    } catch {
        Write-Host "Erro com Chrome: $_" -ForegroundColor Red
    }
    
    Write-Host "✗ Não foi possível converter para PDF. HTML salvo em: $tempHtml" -ForegroundColor Red
    Write-Host "  Você pode abrir o HTML no navegador e usar Ctrl+P > Salvar como PDF" -ForegroundColor Yellow
    return $false
}

# Processar arquivo ou todos
if ($MarkdownFile -and $OutputPdf) {
    Convert-MarkdownToPdf -MdFile $MarkdownFile -PdfFile $OutputPdf
} else {
    # Converter todos os 4 arquivos
    Write-Host "`n=== Conversão em Lote de Documentos YUNA ===" -ForegroundColor Magenta
    Write-Host ""
    
    $files = @(
        @{Md="ESPECIFICACOES_TECNICAS.md"; Pdf="ESPECIFICACOES_TECNICAS.pdf"},
        @{Md="MANUAL_USUARIO.md"; Pdf="MANUAL_USUARIO.pdf"},
        @{Md="HISTORICO_DESENVOLVIMENTO.md"; Pdf="HISTORICO_DESENVOLVIMENTO.pdf"},
        @{Md="CHECKLIST_REGISTRO.md"; Pdf="CHECKLIST_REGISTRO.pdf"}
    )
    
    $success = 0
    $failed = 0
    
    foreach ($file in $files) {
        if (Test-Path $file.Md) {
            $result = Convert-MarkdownToPdf -MdFile $file.Md -PdfFile $file.Pdf
            if ($result) {
                $success++
            } else {
                $failed++
            }
            Write-Host ""
        } else {
            Write-Host "✗ Arquivo não encontrado: $($file.Md)" -ForegroundColor Red
            $failed++
        }
    }
    
    Write-Host "`n=== Resumo da Conversão ===" -ForegroundColor Magenta
    Write-Host "Sucesso: $success arquivos" -ForegroundColor Green
    Write-Host "Falhas: $failed arquivos" -ForegroundColor Red
    
    if ($success -gt 0) {
        Write-Host "`nArquivos PDF prontos para envio a Biblioteca Nacional!" -ForegroundColor Green
    }
}
