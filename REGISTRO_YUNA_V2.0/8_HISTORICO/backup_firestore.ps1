<#
    SCRIPT DE BACKUP FIRESTORE - YUNA V2.0
    - Faz export do Firestore para um bucket Cloud Storage
    - Usa gcloud firestore export

    COMO USAR:
      1) Instale gcloud SDK: https://cloud.google.com/sdk/docs/install
      2) Autentique:      gcloud auth login
      3) Se precisar, defina o projeto: gcloud config set project <SEU_PROJECT_ID>
      4) Ajuste as variáveis abaixo (BucketName, ProjectId opcional, Prefix opcional)
      5) Rode:          .\backup_firestore.ps1

    RESULTADO:
      - Backup em: gs://<bucket>/<prefix>/<yyyyMMdd-HHmmss>/
      - Log no console

    OBS:
      - Necessário permissão de Owner/Editor ou permissão de Storage Admin + Datastore Import/Export
      - Firestore modo nativo é suportado; Datastore mode também.
#>

param(
    [string]$BucketName = "SEU_BUCKET_AQUI",   # Ex.: yuna-backups
    [string]$ProjectId  = "",                  # Opcional: se vazio usa default do gcloud
    [string]$Prefix     = "backups"            # Pasta dentro do bucket
)

function Write-Info($msg)  { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg)   { Write-Host "[ERRO]  $msg" -ForegroundColor Red }

Write-Host "================ FIRESTORE BACKUP ================" -ForegroundColor Cyan

# Validar bucket
if ([string]::IsNullOrWhiteSpace($BucketName) -or $BucketName -eq "SEU_BUCKET_AQUI") {
    Write-Err "Configure o BucketName no topo do script antes de executar."
    exit 1
}

# Validar gcloud
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Err "gcloud não encontrado. Instale o Google Cloud SDK antes de continuar."
    exit 1
}

# Opcional: setar projeto
if (-not [string]::IsNullOrWhiteSpace($ProjectId)) {
    Write-Info "Definindo projeto: $ProjectId"
    gcloud config set project $ProjectId | Out-Null
}

# Montar caminho destino
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$destination = "gs://$BucketName/$Prefix/$timestamp"

Write-Info "Iniciando backup para: $destination"

# Executar export
$cmd = @("firestore", "export", $destination)

try {
    $process = Start-Process gcloud -ArgumentList $cmd -NoNewWindow -PassThru -Wait
    if ($process.ExitCode -eq 0) {
        Write-Ok "Backup concluído com sucesso."
        Write-Ok "Destino: $destination"
    } else {
        Write-Err "Export finalizou com código $($process.ExitCode). Verifique o console acima."
        exit $process.ExitCode
    }
} catch {
    Write-Err "Falha ao executar gcloud firestore export: $_"
    exit 1
}

Write-Info "Próximos passos (recomendado):"
Write-Host "  - Configurar agendamento semanal (Task Scheduler) para este script" -ForegroundColor Gray
Write-Host "  - Manter retenção de 6-12 meses no bucket (lifecycle rule)" -ForegroundColor Gray
Write-Host "  - Configurar alerta de billing (limite mensal + aviso 80%)" -ForegroundColor Gray

Write-Host "=====================================================" -ForegroundColor Cyan
