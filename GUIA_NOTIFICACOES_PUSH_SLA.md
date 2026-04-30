# Guia - Notificacoes Push SLA (Painel Fechado)

Este guia ativa notificacoes push de SLA em risco (faltando ate 30 minutos) mesmo com o painel administrativo fechado.

## O que ja foi implementado

- Cliente web para registrar token push no painel: [admin/push-notifications.js](admin/push-notifications.js)
- Service Worker de messaging: [firebase-messaging-sw.js](firebase-messaging-sw.js)
- Regras Firestore para tokens/locks: [firestore.rules](firestore.rules)
- Agendador sem Blaze via GitHub Actions: [.github/workflows/sla-push-alerts.yml](.github/workflows/sla-push-alerts.yml)
- Script de envio push: [scripts/send-sla-push-alerts.js](scripts/send-sla-push-alerts.js)

## 1) Configurar chave VAPID (obrigatorio)

1. Abra Firebase Console > Cloud Messaging > Web configuration > Web Push certificates.
2. Copie a Public key (VAPID).
3. No arquivo [admin/push-notifications.js](admin/push-notifications.js), substitua o placeholder:

- De: PREENCHER_CHAVE_PUBLICA_VAPID_AQUI
- Para: sua chave publica VAPID

Opcao alternativa: definir `window.YUNA_PUSH_VAPID_KEY` antes de carregar [admin/push-notifications.js](admin/push-notifications.js).

## 2) Publicar regras do Firestore

Execute no workspace:

```powershell
firebase deploy --only firestore:rules
```

## 3) Configurar GitHub Actions

No repositorio GitHub, adicione os secrets:

- `FIREBASE_SERVICE_ACCOUNT_JSON`:
  - JSON completo da service account com acesso ao Firestore e FCM.
- `YUNA_ADMIN_URL`:
  - URL do painel admin em producao (exemplo: https://clinicasyuna.github.io/yuna/admin/).

Observacao: se `YUNA_ADMIN_URL` nao for definido, o script usa valor padrao.

## 4) Validar o workflow agendado

1. Abra Actions > workflow "SLA Push Alerts".
2. Rode manualmente (`workflow_dispatch`) para teste inicial.
3. Verifique logs do step "Send SLA push alerts".

## 5) Validar no navegador

1. Acesse o painel admin.
2. Aceite a permissao de notificacoes quando o banner aparecer.
3. Confirme no Firestore que a colecao `admin_push_tokens` recebeu o token.
4. Simule uma solicitacao com SLA faltando <= 30 min.
5. Feche o painel e aguarde execucao do workflow (ate 5 min).
6. Confirme recebimento da push no sistema operacional/navegador.

## Comandos uteis

Teste local do script (com service account local):

```powershell
node scripts/send-sla-push-alerts.js
```

Preflight de prontidao antes de deploy:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\preflight-sla-notificacoes.ps1
```

Forcar disparo do workflow:

- Actions > SLA Push Alerts > Run workflow

## Limites e observacoes

- A Cloud Function em [functions/index.js](functions/index.js) nao sobe em projeto Spark (sem Blaze).
- O fluxo por GitHub Actions foi aplicado para funcionar sem upgrade de plano.
- Sem chave VAPID valida, o navegador nao gera token e nao recebe push.
- O lock em `sla_notification_locks` evita envio duplicado da mesma solicitacao na janela de 30 min.
