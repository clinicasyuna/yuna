# Yuna Solicite - Guia de ProgramaÃ§Ã£o para IA

## VisÃ£o Geral do Sistema
Yuna Solicite: Sistema de gerenciamento de solicitaÃ§Ãµes de serviÃ§os de saÃºde para clÃ­nicas YUNA com duas SPAs independentes:
- **Painel Administrativo** (`/admin/`) - Dashboard 13k+ linhas para gestÃ£o completa de solicitaÃ§Ãµes, usuÃ¡rios e analytics
- **Portal dos Acompanhantes** (`/acompanhantes/`) - Interface 4.5k+ linhas auto-contida em single-file HTML para submissÃ£o de solicitaÃ§Ãµes

**CaracterÃ­sticas Chave:**
- PWA instalÃ¡vel (offline-capable) via service worker
- Real-time sync com Firestore listeners
- Session timeout (10min inatividade) implementado em ambas SPAs
- Sistema de avaliaÃ§Ã£o de satisfaÃ§Ã£o automÃ¡tico (janela 7 dias pÃ³s-finalizaÃ§Ã£o)

## Arquitetura e Stack TecnolÃ³gico

### Arquitetura Frontend
- **JavaScript Vanilla puro** - Sem frameworks, manipulaÃ§Ã£o DOM direta
- **Firebase SDK 9.23.0 (modo compat)** - Para compatibilidade com cÃ³digo legado
- **Arquitetura multi-SPA**: Cada diretÃ³rio Ã© uma aplicaÃ§Ã£o isolada com prÃ³prio `index.html`
- **State management**: VariÃ¡veis globais via `window.X` + cache in-memory (`window.cachedSolicitacoes`, `window.cachedUsuarios`)
- **Deploy multi-plataforma**: Netlify (produÃ§Ã£o), GitHub Pages (alternativo), Vercel (suportado)

### Backend e Dados (Firebase)
**ColeÃ§Ãµes Firestore Principais:**
```
usuarios_admin/        â†’ {uid, email, role: 'super_admin'|'admin', permissoes, ativo}
usuarios_equipe/       â†’ {uid, email, equipe/departamento, ativo}
usuarios_acompanhantes/ â†’ {uid, email, quarto, preCadastro?, ativo}
solicitacoes/          â†’ {usuarioId, tipo, status, equipe, avaliada?, satisfacao?, criadoEm, finalizadoEm}
quartos_ocupados/      â†’ {quarto (ID), acompanhanteId, ativo} - Controle de unicidade
audit_logs/            â†’ {timestamp, userId, action, resource, details, metadata} - Sistema de auditoria v2.0
usuarios_online/       â†’ {userId, status: 'online'|'idle'|'offline', lastActivity, page} - PresenÃ§a em tempo real
```

**Regras de SeguranÃ§a Firestore (`firestore.rules`):**
- Admins: full read/write em usuÃ¡rios e solicitaÃ§Ãµes
- Equipes: read/write apenas solicitaÃ§Ãµes do seu departamento (`equipe == userEquipe()`)
- Acompanhantes: CRUD apenas nas prÃ³prias solicitaÃ§Ãµes (`usuarioId == request.auth.uid`)

### PWA e Deploy
- **`manifest.json`**: Nome, Ã­cones, cores tema, standalone mode
- **`service-worker.js`**: Cache assets estÃ¡ticos (offline-first)
- **`netlify.toml`**: Redirecionamentos SPA + proxy `/api/*` â†’ `https://api.yuna.com.br`
- **`_redirects`**: Fallback para SPAs (404 â†’ index.html)

## PadrÃµes CrÃ­ticos de LÃ³gica de NegÃ³cio

### Sistema RBAC (Role-Based Access Control)
**Arquivo:** `admin/admin-permissions.js` (165 linhas)

```javascript
// Hierarquia: super_admin > admin > equipe
await verificarUsuarioAdminJS(user); // Retorna null se inativo ou nÃ£o encontrado

// VerificaÃ§Ã£o de permissÃ£o especÃ­fica
if (!temPermissaoJS(currentUser, 'create_users')) { /* bloquear aÃ§Ã£o */ }

// Filtragem por departamento (equipes veem sÃ³ suas solicitaÃ§Ãµes)
if (!podeVerSolicitacaoJS(currentUser, solicitacao)) { /* ocultar */ }
```

**PermissÃµes por Role:**
- `super_admin`: Tudo + criaÃ§Ã£o/exclusÃ£o de admins
- `admin`: Gerenciar equipes, acompanhantes, ver todas solicitaÃ§Ãµes
- `equipe`: Ver/atualizar apenas solicitaÃ§Ãµes do prÃ³prio departamento

### Fluxo de Trabalho de SolicitaÃ§Ãµes
1. **CriaÃ§Ã£o** (Acompanhantes):
   - UI: 4 cards de serviÃ§o (ðŸ”§ ManutenÃ§Ã£o, ðŸ½ï¸ NutriÃ§Ã£o, ðŸ§½ HigienizaÃ§Ã£o, ðŸ¨ Hotelaria)
   - Campos: tipo, prioridade (baixa/media/alta/urgente), descriÃ§Ã£o, horÃ¡rio preferencial
   - Auto-atribuiÃ§Ã£o de `equipe` baseada em `tipo` de serviÃ§o

2. **Processamento** (Admin/Equipe):
   - Status flow: `pendente` â†’ `em-andamento` â†’ `finalizada` (ou `cancelada`)
   - Modal arrastÃ¡vel (`window.tornarModalArrastavel(modalId)`) para visualizaÃ§Ã£o
   - CronÃ´metros em tempo real via `setInterval` em cards

3. **AvaliaÃ§Ã£o** (Acompanhantes):
   - Trigger automÃ¡tico: solicitaÃ§Ã£o finalizada + `avaliada: false` + < 7 dias
   - Modal com 5 estrelas + aspectos (rapidez, qualidade, atendimento) + recomendaÃ§Ã£o
   - PersistÃªncia: `satisfacao: {nota, aspectos, comentarios, recomendaria}`

### Sistema de Quartos (Locking AtÃ´mico)
**Problema:** Prevenir mÃºltiplos acompanhantes no mesmo quarto

**SoluÃ§Ã£o:** TransaÃ§Ã£o Firestore + coleÃ§Ã£o `quartos_ocupados`
```javascript
// Durante cadastro/atualizaÃ§Ã£o de acompanhante
await db.runTransaction(async (transaction) => {
  const quartoDoc = await transaction.get(db.collection('quartos_ocupados').doc(quarto));
  if (quartoDoc.exists && quartoDoc.data().ativo) throw new Error('QUARTO_OCUPADO');
  
  transaction.set(db.collection('quartos_ocupados').doc(quarto), {
    quarto, acompanhanteId: user.uid, ativo: true, ocupadoEm: serverTimestamp()
  });
});
```

**Auto-limpeza:** Se hÃ¡ `quartos_ocupados` ativo mas nenhum `usuarios_acompanhantes` ativo com esse quarto, marca como liberado.

### Sistema de PrÃ©-Cadastro (Admin cria, Acompanhante ativa)
1. **Admin cria:** `usuarios_acompanhantes` com `preCadastro: true` + senha temporÃ¡ria
2. **Acompanhante ativa:** 
   - Login tenta `signInWithEmailAndPassword` â†’ falha (`auth/user-not-found`)
   - Fallback: `createUserWithEmailAndPassword` + remove flag `preCadastro`
   - Veja implementaÃ§Ã£o em `acompanhantes/index.html` funÃ§Ã£o `handleLogin()`

## PadrÃµes de Desenvolvimento

### Gerenciamento de Estado Global
```javascript
// Cache in-memory para evitar re-fetches
window.cachedSolicitacoes = []; // Array de objetos solicitaÃ§Ã£o
window.cachedUsuarios = [];     // Array de objetos usuÃ¡rio

// Inicializado no topo de admin/admin-panel.js (linha 17-19)
// Atualizado apÃ³s cada carregamento de dados
```

### PadrÃ£o de Modal/UI
```javascript
// Show modal
document.getElementById('modal-id').classList.remove('hidden');
document.getElementById('modal-id').style.display = 'flex'; // Alguns modais usam flex

// Hide modal
function fecharModal() {
  document.getElementById('modal-id').classList.add('hidden');
}

// Expor globalmente (final do arquivo)
window.fecharModal = fecharModal;
```

**Modal ArrastÃ¡vel:** Chame `window.tornarModalArrastavel('modal-id')` apÃ³s abrir modal.

### NotificaÃ§Ãµes Toast
```javascript
// Ambas SPAs implementam:
showToast(titulo, mensagem, tipo, duracao = 5000);
// tipo: 'success' (verde), 'error' (vermelho), 'warning' (amarelo)
```

### Real-time Listeners
```javascript
// PadrÃ£o em ambas SPAs
let unsubscribe = db.collection('solicitacoes')
  .where('usuarioId', '==', userId)
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') { /* nova solicitaÃ§Ã£o */ }
      if (change.type === 'modified') { /* atualizaÃ§Ã£o */ }
    });
  });

// Limpeza ao logout
function cleanup() {
  if (unsubscribe) unsubscribe();
}
```

### Tratamento de Erros Firestore
```javascript
// CRÃTICO: Queries com mÃºltiplos where + orderBy requerem Ã­ndice composto
// Evitar: .where('userId', '==', X).where('status', '==', Y).orderBy('createdAt')
// Preferir: ordenaÃ§Ã£o client-side via Array.sort() pÃ³s-fetch

try {
  const snapshot = await db.collection('X').where('Y', '==', Z).get();
  // processar
} catch (error) {
  console.error('[ERRO] Contexto:', error);
  showToast('Erro', 'Mensagem amigÃ¡vel para usuÃ¡rio', 'error');
  // Nunca expor error.message diretamente ao usuÃ¡rio
}
```

## Estrutura de Arquivos CrÃ­tica

### Arquivos de LÃ³gica Principal
```
admin/
â”œâ”€â”€ admin-panel.js (13k+ linhas)  â†’ Core admin: CRUD usuÃ¡rios, solicitaÃ§Ãµes, dashboard
â”œâ”€â”€ admin-permissions.js          â†’ RBAC helper functions
â””â”€â”€ admin-panel-styles.css        â†’ Estilos especÃ­ficos admin

acompanhantes/
â””â”€â”€ index.html (4.5k+ linhas)     â†’ Single-file SPA (HTML + CSS + JS inline)

root/
â”œâ”€â”€ firebase-config-secure.js     â†’ Shared config (importado via script tag)
â”œâ”€â”€ firestore.rules               â†’ Security rules (deploy via Firebase CLI)
â”œâ”€â”€ manifest.json                 â†’ PWA manifest
â”œâ”€â”€ service-worker.js             â†’ Cache strategy
â””â”€â”€ netlify.toml / _redirects     â†’ Deploy routing
```

### Scripts de ManutenÃ§Ã£o (`/scripts/`)
- `enviar-emails-reset.js` - Envia reset de senha para lista de emails
- `recriar-usuarios.js` - Recria usuÃ¡rios com Firebase Admin SDK
- `atualizar-senhas-direto.js` - Atualiza senhas via Admin SDK

**Executar via:** `node scripts/nome-do-script.js` (requer `firebase-service-account.json` na raiz)

## Fluxos de Trabalho Comuns

### Adicionar Novo Tipo de SolicitaÃ§Ã£o
1. **Admin:** Adicionar card em `acompanhantes/index.html` (seÃ§Ã£o `.services-grid`):
   ```html
   <div class="service-card [classe-tema]" onclick="abrirSolicitacao('novo-tipo')">
     <div class="icon">ðŸ†•</div>
     <h3>Novo ServiÃ§o</h3>
   </div>
   ```

2. **Atualizar lÃ³gica:** Adicionar case em `abrirSolicitacao()` e `enviarSolicitacao()`

3. **Mapear equipe:** Atualizar mapeamento `tipo` â†’ `equipe` em funÃ§Ã£o de criaÃ§Ã£o

4. **Firestore rules:** Verificar se regras permitem novo campo `tipo`

### Criar Nova PermissÃ£o Admin
1. **Adicionar em `admin/admin-permissions.js`:**
   ```javascript
   const PERMISSOES = {
     'nova_permissao': {
       super_admin: true,
       admin: false, // ou true
       equipe: false
     }
   };
   ```

2. **Usar em `admin/admin-panel.js`:**
   ```javascript
   if (!temPermissaoJS(currentUser, 'nova_permissao')) {
     showToast('Erro', 'Sem permissÃ£o', 'error');
     return;
   }
   ```

### Deploy para ProduÃ§Ã£o
```bash
# GitHub Pages (automÃ¡tico em push para main)
git add . && git commit -m "feat: nova funcionalidade" && git push origin main

# Netlify (link repositÃ³rio GitHub no dashboard ou CLI)
netlify deploy --prod

# Verificar
# Admin: https://clinicasyuna.github.io/yuna/admin/
# Acompanhantes: https://clinicasyuna.github.io/yuna/acompanhantes/
```

**Lembrete:** Adicionar domÃ­nio em Firebase Console â†’ Authentication â†’ Authorized domains

## Debugging e Troubleshooting

### Logs Estruturados
**PadrÃ£o usado no projeto:**
```javascript
console.log('[DEBUG] Contexto:', dados);
console.log('[SUCCESS] OperaÃ§Ã£o:', resultado);
console.error('[ERRO] Falha em:', error);
console.log('ðŸŽ¯ðŸŽ¯ðŸŽ¯ [TAG] Debug especÃ­fico:', valor); // Tags visuais para busca rÃ¡pida
```

### Issues Comuns
1. **"Permission denied" em queries:**
   - Verificar `firestore.rules` â†’ UsuÃ¡rio tem role correto?
   - Usuario estÃ¡ `ativo: true`?

2. **Modal nÃ£o fecha:**
   - Verificar se funÃ§Ã£o estÃ¡ em `window.X = X`
   - Classe `.hidden` estÃ¡ aplicada?

3. **Cache desatualizado:**
   - Limpar: `window.cachedSolicitacoes = []` e recarregar dados
   - Service worker: Limpar cache do navegador (Ctrl+Shift+Del)

4. **Timeout de sessÃ£o nÃ£o funciona:**
   - Verificar se `initializeSessionTimeout()` foi chamado apÃ³s login
   - Events listeners de atividade (`mousedown`, `keypress`, etc.) estÃ£o ativos?

## ConsideraÃ§Ãµes de Performance

### OtimizaÃ§Ãµes Implementadas
- **PaginaÃ§Ã£o:** Listas de usuÃ¡rios/solicitaÃ§Ãµes carregam 50 itens por vez
- **Filtragem client-side:** Evita Ã­ndices compostos Firestore (caros e lentos de criar)
- **Cache in-memory:** `window.cachedX` evita re-fetches desnecessÃ¡rios
- **Listeners limitados:** Desinscrever (`unsubscribe()`) ao logout/navegaÃ§Ã£o

### Anti-Patterns a Evitar
- âŒ `orderBy()` + mÃºltiplos `where()` sem Ã­ndice composto â†’ Usar `.sort()` pÃ³s-fetch
- âŒ Listeners sem cleanup â†’ Memory leak ao navegar entre pÃ¡ginas
- âŒ `get()` em loop â†’ Preferir `in` queries ou `getAll()`
- âŒ Atualizar Firestore em cada keystroke â†’ Debounce ou salvar sÃ³ ao blur

## IntegraÃ§Ãµes Externas

### DependÃªncias (Carregadas via CDN)
```html
<!-- Firebase 9.23.0 (modo compat) -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

<!-- Font Awesome 6.4.0 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- XLSX.js (sÃ³ admin) -->
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
```

### EmailJS (NotificaÃ§Ãµes)
- Configurado em admin para envio de notificaÃ§Ãµes
- Template IDs e chaves API em variÃ¡veis globais no topo de `admin-panel.js`

## Sistema de Auditoria e Monitoramento v2.0

### VisÃ£o Geral
Sistema completo de logs, auditoria e monitoramento de usuÃ¡rios implementado em 14/01/2026. Registra todas as aÃ§Ãµes dos usuÃ¡rios (login, logout, CRUD) e permite monitoramento em tempo real de quem estÃ¡ online.

### Arquivos do Sistema
- **`admin/audit-system.js`** (500+ linhas) - Core do sistema de auditoria
- **`admin/audit-integration.js`** (700+ linhas) - IntegraÃ§Ã£o com admin-panel.js + UI completa
- **SeÃ§Ã£o HTML** - Interface em `admin/index.html` (botÃ£o "Logs e Auditoria")
- **Regras Firestore** - PermissÃµes para `audit_logs/` e `usuarios_online/`

### Funcionalidades Principais

**1. Registro AutomÃ¡tico de AÃ§Ãµes:**
```javascript
// Toda aÃ§Ã£o Ã© registrada automaticamente
await registrarAcaoAuditoria({
    action: 'create|update|delete|view|export|login|logout',
    resource: 'solicitacoes|usuarios_admin|usuarios_equipe|etc',
    resourceId: 'ID do documento',
    success: true|false,
    details: {
        before: {...}, // Estado anterior
        after: {...},  // Estado novo
        changes: ['campo1', 'campo2'] // Campos alterados
    }
});
```

**2. Monitoramento de PresenÃ§a (UsuÃ¡rios Online):**
- Sistema atualiza status a cada 30 segundos
- Detecta inatividade apÃ³s 5 minutos (muda para `idle`)
- Marca como `offline` ao fechar aba/naveg

ador
- Exibe tempo de sessÃ£o em tempo real

**3. Painel de Logs e Auditoria:**
- Acesso via botÃ£o "Logs e Auditoria" no menu admin
- Filtros: usuÃ¡rio, aÃ§Ã£o, recurso, perÃ­odo
- Lista em tempo real de usuÃ¡rios online com status
- HistÃ³rico completo de aÃ§Ãµes com detalhes
- Alertas de atividades suspeitas (mÃºltiplas falhas, aÃ§Ãµes fora do horÃ¡rio)
- ExportaÃ§Ã£o para Excel (em desenvolvimento)

**4. DetecÃ§Ã£o de Atividades Suspeitas:**
```javascript
const alertas = await detectarAtividadesSuspeitas();
// Detecta:
// - MÃºltiplas tentativas falhas de login (>= 3)
// - AÃ§Ãµes de delete fora do horÃ¡rio (00h-06h)
// - AÃ§Ãµes em cascata (>10 aÃ§Ãµes em 1 minuto)
```

### IntegraÃ§Ã£o com Admin Panel

**Pontos de IntegraÃ§Ã£o Implementados:**

1. **Login (linha ~2150):**
   - Registra login bem-sucedido
   - Inicializa sistema de presenÃ§a

2. **Logout (linha ~2000):**
   - Calcula tempo de sessÃ£o
   - Registra logout com duraÃ§Ã£o
   - Para sistema de presenÃ§a

3. **Outras aÃ§Ãµes (via audit-integration.js):**
   - CRUD de solicitaÃ§Ãµes
   - CRUD de usuÃ¡rios
   - ExportaÃ§Ã£o de relatÃ³rios
   - VisualizaÃ§Ã£o de dashboards

### Estrutura de Dados

**audit_logs:**
```javascript
{
  timestamp: Timestamp,
  userId: "UID",
  userEmail: "email@exemplo.com",
  userRole: "admin",
  action: "create",
  resource: "solicitacoes",
  resourceId: "DOC_ID",
  details: {
    before: {...},
    after: {...},
    changes: ["status", "prioridade"],
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0..."
  },
  metadata: {
    page: "/admin/",
    sessionId: "UID_timestamp",
    success: true,
    error: null
  }
}
```

**usuarios_online:**
```javascript
{
  userId: "UID",
  email: "email@exemplo.com",
  role: "admin",
  lastActivity: Timestamp,
  page: "/admin/",
  status: "online", // online|idle|offline
  sessionId: "UID_timestamp",
  sessionStart: Timestamp
}
```

### ConfiguraÃ§Ã£o

**AUDIT_CONFIG (audit-system.js):**
```javascript
OFFLINE_TIMEOUT: 5 * 60 * 1000, // 5min sem atividade = offline
PRESENCE_UPDATE_INTERVAL: 30 * 1000, // Atualizar status a cada 30s
LOG_RETENTION_DAYS: 90 // Reter logs por 90 dias
```

### ManutenÃ§Ã£o

**Limpeza automÃ¡tica de logs antigos:**
```javascript
await limparLogsAntigos(); // Remove logs > 90 dias
```

**Executar periodicamente** (recomendaÃ§Ã£o: 1x por semana via Cloud Functions ou script manual)

### Performance

- **Logs:** IndexaÃ§Ã£o por `userId`, `action`, `resource`, `timestamp`
- **PresenÃ§a:** TTL implÃ­cito (offline apÃ³s 5min)
- **Queries:** Limite de 200 registros por busca (paginaÃ§Ã£o client-side)
- **Cache:** Usa `window.cachedX` para evitar re-fetches

### SeguranÃ§a (Firestore Rules)

```javascript
match /audit_logs/{logId} {
  allow read: if isAdmin(); // Apenas admins leem logs
  allow create: if isSignedIn(); // UsuÃ¡rio autenticado pode criar log de suas aÃ§Ãµes
  allow update, delete: if false; // Logs sÃ£o IMUTÃVEIS
}

match /usuarios_online/{userId} {
  allow read: if isAdmin(); // Apenas admins veem quem estÃ¡ online
  allow write: if isSignedIn() && userId == request.auth.uid; // SÃ³ atualiza prÃ³prio status
}
```

### Uso (Para Desenvolvedores)

**Registrar aÃ§Ã£o customizada:**
```javascript
await window.registrarAcaoAuditoria({
    action: 'update',
    resource: 'solicitacoes',
    resourceId: solicitacaoId,
    success: true,
    details: {
        before: estadoAnterior,
        after: novoEstado,
        changes: ['status', 'prioridade']
    }
});
```

**Buscar histÃ³rico de recurso:**
```javascript
const historico = await window.buscarHistoricoRecurso('solicitacoes', 'DOC_ID');
// Retorna array com todas as mudanÃ§as daquele documento
```

**Gerar relatÃ³rio de usuÃ¡rio:**
```javascript
const relatorio = await window.gerarRelatorioUsuario(
    userId,
    new Date('2026-01-01'),
    new Date('2026-01-31')
);
// Retorna: totalAcoes, acoesPorTipo, acoesPorRecurso, logs[]
```

## Recursos de ReferÃªncia
- **Firebase Console:** https://console.firebase.google.com (projeto: app-pedidos-4656c)
- **GitHub Repo:** https://github.com/clinicasyuna/yuna
- **Deploy Prod:** https://clinicasyuna.github.io/yuna/
- **DocumentaÃ§Ã£o Firebase:** https://firebase.google.com/docs/firestore
- **PWA Checklist:** https://web.dev/pwa-checklist/
