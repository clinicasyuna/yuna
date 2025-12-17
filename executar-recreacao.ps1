# 🎯 SCRIPT INTERATIVO - Menu de Opções para Recreação de Usuários
# 
# Use: .\executar-recreacao.ps1
# Compatível com Windows PowerShell 5.1+

param(
    [switch]$SemConfirmacao = $false
)

# ============================================
# CORES E FORMATAÇÃO
# ============================================

function EscreverCor($texto, $cor = "Gray") {
    Write-Host $texto -ForegroundColor $cor
}

function ExibirCabecalho {
    Clear-Host
    EscreverCor "`n╔══════════════════════════════════════════════════════════╗" "Cyan"
    EscreverCor "║     🚀 SCRIPT DE RECREAÇÃO DE USUÁRIOS - YUNA           ║" "Cyan"
    EscreverCor "╚══════════════════════════════════════════════════════════╝`n" "Cyan"
}

function ExibirMenu {
    ExibirCabecalho
    
    EscreverCor "Escolha uma opção:" "Yellow"
    EscreverCor "1) 📧 Enviar emails de reset (RECOMENDADO - Mais seguro)" "Green"
    EscreverCor "2) 🔄 Recrear usuários (Requer Firebase Admin SDK)" "Cyan"
    EscreverCor "3) 📋 Ver guia de opções" "Gray"
    EscreverCor "4) 🔍 Verificar dependências" "Gray"
    EscreverCor "5) ❌ Sair" "Red"
    EscreverCor ""
}

function VerificardDependencias {
    ExibirCabecalho
    EscreverCor "Verificando dependências..." "Yellow"
    
    # Node.js
    try {
        $versaoNode = node --version 2>$null
        EscreverCor "✅ Node.js: $versaoNode" "Green"
    } catch {
        EscreverCor "❌ Node.js: NÃO INSTALADO" "Red"
        EscreverCor "   Baixe em: https://nodejs.org/" "Gray"
    }
    
    # npm
    try {
        $versaoNpm = npm --version 2>$null
        EscreverCor "✅ npm: $versaoNpm" "Green"
    } catch {
        EscreverCor "❌ npm: NÃO INSTALADO" "Red"
    }
    
    # Git
    try {
        $versaoGit = git --version 2>$null
        EscreverCor "✅ Git: $versaoGit" "Green"
    } catch {
        EscreverCor "❌ Git: NÃO INSTALADO (opcional)" "Yellow"
    }
    
    # Firebase Admin SDK
    $caminhoFirebase = Join-Path $PSScriptRoot "node_modules\firebase-admin\package.json"
    if (Test-Path $caminhoFirebase) {
        EscreverCor "✅ Firebase Admin SDK: Instalado" "Green"
    } else {
        EscreverCor "❌ Firebase Admin SDK: Não instalado" "Yellow"
        EscreverCor "   Execute: npm install firebase-admin" "Gray"
    }
    
    # Arquivo de serviço
    $caminhoServico = Join-Path $PSScriptRoot "scripts\firebase-service-account.json"
    if (Test-Path $caminhoServico) {
        EscreverCor "✅ Arquivo de serviço Firebase: Encontrado" "Green"
    } else {
        EscreverCor "❌ Arquivo de serviço Firebase: NÃO ENCONTRADO" "Yellow"
        EscreverCor "   Esperado em: scripts\firebase-service-account.json" "Gray"
    }
    
    EscreverCor ""
    Read-Host "Pressione ENTER para voltar ao menu"
}

function ExibirGuia {
    ExibirCabecalho
    
    EscreverCor "📚 GUIA DE OPÇÕES" "Yellow"
    EscreverCor ""
    
    EscreverCor "OPÇÃO 1: 📧 Email Reset (RECOMENDADO)" "Green"
    EscreverCor "─────────────────────────────────────" "Green"
    EscreverCor "Envia email para cada usuário resetar a senha" "Gray"
    EscreverCor "✅ Mais seguro (padrão Firebase)" "Green"
    EscreverCor "✅ Simples e rápido de configurar" "Green"
    EscreverCor "✅ Não requer chave de serviço" "Green"
    EscreverCor "⏱️  Usuário tem 1 hora para resetar" "Yellow"
    EscreverCor ""
    
    EscreverCor "OPÇÃO 2: 🔄 Recreação Completa" "Cyan"
    EscreverCor "──────────────────────────────" "Cyan"
    EscreverCor "Deleta e recria todos os usuários" "Gray"
    EscreverCor "✅ Totalmente automático" "Green"
    EscreverCor "✅ Instantâneo" "Green"
    EscreverCor "⚠️  Requer Firebase Admin SDK" "Yellow"
    EscreverCor "⚠️  Requer chave de serviço" "Yellow"
    EscreverCor ""
    
    EscreverCor "RECOMENDAÇÃO:" "Magenta"
    EscreverCor "Comece com OPÇÃO 1 (Email Reset) - é mais simples!" "Magenta"
    EscreverCor ""
    
    Read-Host "Pressione ENTER para voltar ao menu"
}

function InstalarDependencias {
    EscreverCor "Instalando Firebase Admin SDK..." "Yellow"
    EscreverCor ""
    
    try {
        npm install firebase-admin
        EscreverCor "`n✅ Firebase Admin SDK instalado com sucesso!" "Green"
    } catch {
        EscreverCor "`n❌ Erro ao instalar: $_" "Red"
    }
    
    EscreverCor ""
    Read-Host "Pressione ENTER para continuar"
}

function ExecutarEmailReset {
    ExibirCabecalho
    
    $scriptPath = Join-Path $PSScriptRoot "scripts\enviar-emails-reset.js"
    
    if (-not (Test-Path $scriptPath)) {
        EscreverCor "❌ Arquivo não encontrado: $scriptPath" "Red"
        Read-Host "Pressione ENTER para voltar"
        return
    }
    
    EscreverCor "📧 Enviando emails de reset..." "Green"
    EscreverCor ""
    
    try {
        node $scriptPath
    } catch {
        EscreverCor "`n❌ Erro: $_" "Red"
    }
    
    EscreverCor ""
    Read-Host "Pressione ENTER para voltar ao menu"
}

function ExecutarRecriacao {
    ExibirCabecalho
    
    # Verificar se firebase-admin está instalado
    $packagePath = Join-Path $PSScriptRoot "node_modules\firebase-admin"
    if (-not (Test-Path $packagePath)) {
        EscreverCor "❌ Firebase Admin SDK não está instalado!" "Red"
        EscreverCor ""
        EscreverCor "Para instalar, execute:" "Yellow"
        EscreverCor "  npm install firebase-admin" "Cyan"
        EscreverCor ""
        $instalarf = Read-Host "Deseja instalar agora? (S/N)"
        if ($instalar -eq "S" -or $instalar -eq "s") {
            InstalarDependencias
            return
        } else {
            Read-Host "Pressione ENTER para voltar"
            return
        }
    }
    
    # Verificar arquivo de serviço
    $servicePath = Join-Path $PSScriptRoot "scripts\firebase-service-account.json"
    if (-not (Test-Path $servicePath)) {
        EscreverCor "❌ Arquivo firebase-service-account.json não encontrado!" "Red"
        EscreverCor ""
        EscreverCor "Por favor:" "Yellow"
        EscreverCor "1. Acesse: https://console.firebase.google.com" "Cyan"
        EscreverCor "2. Selecione: studio-5526632052-23813" "Cyan"
        EscreverCor "3. ⚙️ Configurações → Contas de Serviço → Gerar nova chave" "Cyan"
        EscreverCor "4. Salve em: scripts\firebase-service-account.json" "Cyan"
        EscreverCor ""
        Read-Host "Pressione ENTER para voltar"
        return
    }
    
    EscreverCor "🔄 Iniciando recreação de usuários..." "Green"
    EscreverCor ""
    
    $scriptPath = Join-Path $PSScriptRoot "scripts\recriar-usuarios.js"
    
    if (-not (Test-Path $scriptPath)) {
        EscreverCor "❌ Script não encontrado: $scriptPath" "Red"
        Read-Host "Pressione ENTER para voltar"
        return
    }
    
    try {
        node $scriptPath
    } catch {
        EscreverCor "`n❌ Erro: $_" "Red"
    }
    
    EscreverCor ""
    Read-Host "Pressione ENTER para voltar ao menu"
}

# ============================================
# LOOP PRINCIPAL
# ============================================

do {
    ExibirMenu
    
    $escolha = Read-Host "Escolha uma opção (1-5)"
    
    switch ($escolha) {
        "1" { ExecutarEmailReset }
        "2" { ExecutarRecriacao }
        "3" { ExibirGuia }
        "4" { VerificardDependencias }
        "5" { 
            EscreverCor "Até logo! 👋" "Cyan"
            exit 0
        }
        default {
            EscreverCor "❌ Opção inválida!" "Red"
            Start-Sleep -Seconds 1
        }
    }
} while ($true)
