# ============================================================================
# Script de Configuração Automática de GitHub Secrets para SLA Notifications
# ============================================================================
# Prerequisito: gh CLI autenticado (`gh auth login`)
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\setup-github-secrets.ps1
# ============================================================================

param(
    [string]$Repository = "Samukajr/clinicasyuna",
    [string]$FirebaseConfigPath = "firebase-service-account.json"
)

# Cores para output
$Colors = @{
    Success = 'Green'
    Error   = 'Red'
    Warning = 'Yellow'
    Info    = 'Cyan'
}

function Write-Status {
    param($Message, $Type = 'Info')
    $Color = $Colors[$Type]
    Write-Host $Message -ForegroundColor $Color
}

function Test-GhInstalled {
    try {
        $version = gh --version 2>&1
        Write-Status "[OK] GitHub CLI detectado: $version" Success
        return $true
    }
    catch {
        Write-Status "[ERRO] GitHub CLI nao encontrado!" Error
        Write-Status "   Instale em: https://cli.github.com/" Warning
        return $false
    }
}

function Test-GhAuthenticated {
    try {
        $user = gh auth status 2>&1 | Select-Object -First 1
        if ($user -match "Logged in") {
            Write-Status "[OK] GitHub CLI autenticado" Success
            return $true
        }
        else {
            Write-Status "[ERRO] GitHub CLI nao autenticado!" Error
            Write-Status "   Execute: gh auth login" Warning
            return $false
        }
    }
    catch {
        Write-Status "[ERRO] Erro ao verificar autenticacao: $_" Error
        return $false
    }
}

function Test-FirebaseConfig {
    param($Path)OK] Arquivo encontrado: $Path" Success
        return $true
    }
    else {
        Write-Status "[ERRO] Arquivo na
    } else {
        Write-Status "[✗] Arquivo não encontrado: $Path" Error
        return $false
    }
}

function Get-FirebaseAccountJson {
    param($Path)
    try {
        $content = Get-OK] Conteudo de firebase-service-account.json carregado" Success
        return $content
    }
    catch {
        Write-Status "[ERRO
        Write-Status "[✗] Erro ao ler arquivo: $_" Error
        return $null
    }
}

function Add-GithubSecret {
    param($SecretName, $SecretValue, $Repo)
    try {-> Adicionando secret: $SecretName..." Info
        
        # Usar echo para passar valor sem expor em linha de comando
        $SecretValue | gh secret set $SecretName --repo $Repo
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "  [OK] Secret adicionado com sucesso!" Success
            return $true
        }
        else {
            Write-Status "  [ERRO] Falha ao adicionar secret" Error
            return $false
        }
    }
    catch {
        Write-Status "  [ERRO]
    } catch {
        Write-Status "  ✗ Erro: $_" Error
        return $false
    }
}

function Verify-SecretExists {
    param($SecretName, $Repo)
    try {[OK] Secret '$SecretName' verificado no repositorio" Success
            return $true
        }
        else {
            Write-Status "  [AVISO] Secret '$SecretName' nao encontrado" Warning
            return $false
        }
    }
    catch {
        Write-Status "  [ERRO]
        }
    } catch {
        Write-Status "  ✗ Erro ao verificar secret: $_" Error
        return $false
    }
}
-> Disparando workflow: $WorkflowName..." Info
        
        gh workflow run $WorkflowName --repo $Repo
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "  [OK] Workflow disparado com sucesso!" Success
            Write-Status "  -> Monitorando execucao..." Info
            
            Start-Sleep -Seconds 2
            
            $runs = gh run list --workflow $WorkflowName --repo $Repo --limit 1 2>&1
            Write-Host $runs
            
            Write-Status "  -> Acesse o status em: https://github.com/$Repo/actions" Info
            return $true
        }
        else {
            Write-Status "  [ERRO] Falha ao disparar workflow" Error
            return $false
        }
    }
    catch {
        Write-Status "  [ERRO]
            Write-Status "  ✗ Falha ao disparar workflow" Error
            return $false
        }
    } catch {
        Write-Status "  ✗ Erro: $_" Error
        return $false
    }
}=========================================================" Info
Write-Status "CONFIGURACAO AUTOMATICA - GitHub Secrets SLA" Info
Write-Status "=========================================================" Info
Write-Host ""

# Step 1: Verificações preliminares
Write-Status "[PASSO 1] Verificacoes preliminares..." Info
Write-Host ""

if (-not (Test-GhInstalled)) { exit 1 }
if (-not (Test-GhAuthenticated)) { exit 1 }
if (-not (Test-FirebaseConfig $FirebaseConfigPath)) { exit 1 }

Write-Host ""

# Step 2: Carregar configurações
Write-Status "[PASSO 2] Carregando configuracoes..." Info
Write-Host ""

$firebaseJson = Get-FirebaseAccountJson $FirebaseConfigPath
if (-not $firebaseJson) { exit 1 }

$adminUrl = "https://clinicasyuna.github.io/yuna/admin/"
Write-Status "[OK] URL Admin configurada: $adminUrl" Success

Write-Host ""

# Step 3: Adicionar secrets
Write-Status "[PASSO 3] Adicionando secrets no repositorio: $Repository..." Info

$secret1Success = Add-GithubSecret -SecretName "FIREBASE_SERVICE_ACCOUNT_JSON" `
                                   -SecretValue $firebaseJson `
                                   -Repo $Repository

$secret2Success = Add-GithubSecret -SecretName "YUNA_ADMIN_URL" `
                                   -SecretValue $adminUrl `
                                   -Repo $Repository

Write-Host ""

# Step 4: Validar secrets
Write-Status "[PASSO 4] Validando secrets..." Info
Write-Host ""

$verify1 = Verify-SecretExists -SecretName "FIREBASE_SERVICE_ACCOUNT_JSON" -Repo $Repository
$verify2 = Verify-SecretExists -SecretName "YUNA_ADMIN_URL" -Repo $Repository

Write-Host ""

# Step 5: Disparar workflow
Write-Status "[PASSO 5] Disparando workflow de teste..." Info

$workflowTriggered = Trigger-WorkflowDispatch -WorkflowName "SLA Push Alerts" -Repo $Repository

Write-Host ""

# Summary
Write-Status "=========================================================" Info
Write-Status "RESUMO FINAL" Info
Write-Status "=========================================================" Info
Write-Host ""

$status = @{
    "GitHub CLI autenticado" = $true
    "Firebase config carregado" = $($firebaseJson -ne $null)
    "Secret FIREBASE_SERVICE_ACCOUNT_JSON adicionado" = $secret1Success
    "Secret YUNA_ADMIN_URL adicionado" = $secret2Success
    "Secrets verificados" = $($verify1 -and $verify2)
    "Workflow disparado" = $workflowTriggered
}

$allSuccess = $true
foreach ($check in $status.GetEnumerator()) {
    $symbol = if ($check.Value) { "[OK]" } else { "[ERRO]" }
    $color = if ($check.Value) { 'Green' } else { 'Red' }
    Write-Host "  $symbol $($check.Name)" -ForegroundColor $color
    if (-not $check.Value) { $allSuccess = $false }
}

Write-Host ""

if ($allSuccess) {
    Write-Status "[SUCESSO] Tudo foi configurado automaticamente!" Success
    Write-Status "Proximos passos:" Info
    Write-Status "  1. Acesse: https://github.com/$Repository/actions" Info
    Write-Status "  2. Veja o status do workflow SLA Push Alerts" Info
    Write-Status "  3. Apos primeira execucao, confira notificacoes no painel admin" Info
    exit 0
}
else {
    Write-Status "[ERRO]SO! Tudo foi configurado automaticamente!" Success
    Write-Status "→ Próximos passos:" Info
    Write-Status "  1. Veja o status do workflow em: https://github.com/$Repository/actions" Info
    Write-Status "  2. Após a primeira execução, confira Firestore para verificar notificações" Info
    Write-Status "  3. Abra o painel admin e confirme o recebimento de push notifications" Info
    exit 0
} else {
    Write-Status "✗ ERRO: Alguns passos falharam. Verifique os erros acima." Error
    exit 1
}
