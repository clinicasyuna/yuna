# Yuna Solicite - Guia de Programação para IA

## Visão Geral do Sistema
Yuna Solicite: Sistema de gerenciamento de solicitações de serviços de saúde para clínicas YUNA com duas SPAs independentes:
- **Painel Administrativo** (`/admin/`) - Dashboard 13k+ linhas para gestão completa de solicitações, usuários e analytics
- **Portal dos Acompanhantes** (`/acompanhantes/`) - Interface 4.5k+ linhas auto-contida em single-file HTML para submissão de solicitações

**Características Chave:**
- PWA instalável (offline-capable) via service worker
- Real-time sync com Firestore listeners
- Session timeout (10min inatividade) implementado em ambas SPAs
- Sistema de avaliação de satisfação automático (janela 7 dias pós-finalização)

## Arquitetura e Stack Tecnológico

### Arquitetura Frontend
- **JavaScript Vanilla puro** - Sem frameworks, manipulação DOM direta
- **Firebase SDK 9.23.0 (modo compat)** - Para compatibilidade com código legado
- **Arquitetura multi-SPA**: Cada diretório é uma aplicação isolada com próprio `index.html`
- **State management**: Variáveis globais via `window.X` + cache in-memory (`window.cachedSolicitacoes`, `window.cachedUsuarios`)
- **Deploy multi-plataforma**: Netlify (produção), GitHub Pages (alternativo), Vercel (suportado)

### Backend e Dados (Firebase)
**Coleções Firestore Principais:**
```
usuarios_admin/        → {uid, email, role: 'super_admin'|'admin', permissoes, ativo}
usuarios_equipe/       → {uid, email, equipe/departamento, ativo}
usuarios_acompanhantes/ → {uid, email, quarto, preCadastro?, ativo}
solicitacoes/          → {usuarioId, tipo, status, equipe, avaliada?, satisfacao?, criadoEm, finalizadoEm}
quartos_ocupados/      → {quarto (ID), acompanhanteId, ativo} - Controle de unicidade
audit_logs/            → {timestamp, userId, action, resource, details, metadata} - Sistema de auditoria v2.0
usuarios_online/       → {userId, status: 'online'|'idle'|'offline', lastActivity, page} - Presença em tempo real
```

**Regras de Segurança Firestore (`firestore.rules`):**
- Admins: full read/write em usuários e solicitações
- Equipes: read/write apenas solicitações do seu departamento (`equipe == userEquipe()`)
- Acompanhantes: CRUD apenas nas próprias solicitações (`usuarioId == request.auth.uid`)

### PWA e Deploy
- **`manifest.json`**: Nome, ícones, cores tema, standalone mode
- **`service-worker.js`**: Cache assets estáticos (offline-first)
- **`netlify.toml`**: Redirecionamentos SPA + proxy `/api/*` → `https://api.yuna.com.br`
- **`_redirects`**: Fallback para SPAs (404 → index.html)

## Padrões Críticos de Lógica de Negócio

### Sistema RBAC (Role-Based Access Control)
**Arquivo:** `admin/admin-permissions.js` (165 linhas)

```javascript
// Hierarquia: super_admin > admin > equipe
await verificarUsuarioAdminJS(user); // Retorna null se inativo ou não encontrado

// Verificação de permissão específica
if (!temPermissaoJS(currentUser, 'create_users')) { /* bloquear ação */ }

// Filtragem por departamento (equipes veem só suas solicitações)
if (!podeVerSolicitacaoJS(currentUser, solicitacao)) { /* ocultar */ }
```

**Permissões por Role:**
- `super_admin`: Tudo + criação/exclusão de admins
- `admin`: Gerenciar equipes, acompanhantes, ver todas solicitações
- `equipe`: Ver/atualizar apenas solicitações do próprio departamento

### Fluxo de Trabalho de Solicitações
1. **Criação** (Acompanhantes):
   - UI: 4 cards de serviço (🔧 Manutenção, 🍽️ Nutrição, 🧽 Higienização, 🏨 Hotelaria)
   - Campos: tipo, prioridade (baixa/media/alta/urgente), descrição, horário preferencial
   - Auto-atribuição de `equipe` baseada em `tipo` de serviço

2. **Processamento** (Admin/Equipe):
   - Status flow: `pendente` → `em-andamento` → `finalizada` (ou `cancelada`)
   - Modal arrastável (`window.tornarModalArrastavel(modalId)`) para visualização
   - Cronômetros em tempo real via `setInterval` em cards

3. **Avaliação** (Acompanhantes):
   - Trigger automático: solicitação finalizada + `avaliada: false` + < 7 dias
   - Modal com 5 estrelas + aspectos (rapidez, qualidade, atendimento) + recomendação
   - Persistência: `satisfacao: {nota, aspectos, comentarios, recomendaria}`

### Sistema de Quartos (Locking Atômico)
**Problema:** Prevenir múltiplos acompanhantes no mesmo quarto

**Solução:** Transação Firestore + coleção `quartos_ocupados`
```javascript
// Durante cadastro/atualização de acompanhante
await db.runTransaction(async (transaction) => {
  const quartoDoc = await transaction.get(db.collection('quartos_ocupados').doc(quarto));
  if (quartoDoc.exists && quartoDoc.data().ativo) throw new Error('QUARTO_OCUPADO');
  
  transaction.set(db.collection('quartos_ocupados').doc(quarto), {
    quarto, acompanhanteId: user.uid, ativo: true, ocupadoEm: serverTimestamp()
  });
});
```

**Auto-limpeza:** Se há `quartos_ocupados` ativo mas nenhum `usuarios_acompanhantes` ativo com esse quarto, marca como liberado.

### Sistema de Pré-Cadastro (Admin cria, Acompanhante ativa)
1. **Admin cria:** `usuarios_acompanhantes` com `preCadastro: true` + senha temporária
2. **Acompanhante ativa:** 
   - Login tenta `signInWithEmailAndPassword` → falha (`auth/user-not-found`)
   - Fallback: `createUserWithEmailAndPassword` + remove flag `preCadastro`
   - Veja implementação em `acompanhantes/index.html` função `handleLogin()`

## Padrões de Desenvolvimento

### Gerenciamento de Estado Global
```javascript
// Cache in-memory para evitar re-fetches
window.cachedSolicitacoes = []; // Array de objetos solicitação
window.cachedUsuarios = [];     // Array de objetos usuário

// Inicializado no topo de admin/admin-panel.js (linha 17-19)
// Atualizado após cada carregamento de dados
```

### Padrão de Modal/UI
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

**Modal Arrastável:** Chame `window.tornarModalArrastavel('modal-id')` após abrir modal.

### Notificações Toast
```javascript
// Ambas SPAs implementam:
showToast(titulo, mensagem, tipo, duracao = 5000);
// tipo: 'success' (verde), 'error' (vermelho), 'warning' (amarelo)
```

### Real-time Listeners
```javascript
// Padrão em ambas SPAs
let unsubscribe = db.collection('solicitacoes')
  .where('usuarioId', '==', userId)
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') { /* nova solicitação */ }
      if (change.type === 'modified') { /* atualização */ }
    });
  });

// Limpeza ao logout
function cleanup() {
  if (unsubscribe) unsubscribe();
}
```

### Tratamento de Erros Firestore
```javascript
// CRÍTICO: Queries com múltiplos where + orderBy requerem índice composto
// Evitar: .where('userId', '==', X).where('status', '==', Y).orderBy('createdAt')
// Preferir: ordenação client-side via Array.sort() pós-fetch

try {
  const snapshot = await db.collection('X').where('Y', '==', Z).get();
  // processar
} catch (error) {
  console.error('[ERRO] Contexto:', error);
  showToast('Erro', 'Mensagem amigável para usuário', 'error');
  // Nunca expor error.message diretamente ao usuário
}
```

## Estrutura de Arquivos Crítica

### Arquivos de Lógica Principal
```
admin/
├── admin-panel.js (13k+ linhas)  → Core admin: CRUD usuários, solicitações, dashboard
├── admin-permissions.js          → RBAC helper functions
└── admin-panel-styles.css        → Estilos específicos admin

acompanhantes/
└── index.html (4.5k+ linhas)     → Single-file SPA (HTML + CSS + JS inline)

root/
├── firebase-config-secure.js     → Shared config (importado via script tag)
├── firestore.rules               → Security rules (deploy via Firebase CLI)
├── manifest.json                 → PWA manifest
├── service-worker.js             → Cache strategy
└── netlify.toml / _redirects     → Deploy routing
```

### Scripts de Manutenção (`/scripts/`)
- `enviar-emails-reset.js` - Envia reset de senha para lista de emails
- `recriar-usuarios.js` - Recria usuários com Firebase Admin SDK
- `atualizar-senhas-direto.js` - Atualiza senhas via Admin SDK

**Executar via:** `node scripts/nome-do-script.js` (requer `firebase-service-account.json` na raiz)

## Fluxos de Trabalho Comuns

### Adicionar Novo Tipo de Solicitação
1. **Admin:** Adicionar card em `acompanhantes/index.html` (seção `.services-grid`):
   ```html
   <div class="service-card [classe-tema]" onclick="abrirSolicitacao('novo-tipo')">
     <div class="icon">🆕</div>
     <h3>Novo Serviço</h3>
   </div>
   ```

2. **Atualizar lógica:** Adicionar case em `abrirSolicitacao()` e `enviarSolicitacao()`

3. **Mapear equipe:** Atualizar mapeamento `tipo` → `equipe` em função de criação

4. **Firestore rules:** Verificar se regras permitem novo campo `tipo`

### Criar Nova Permissão Admin
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
     showToast('Erro', 'Sem permissão', 'error');
     return;
   }
   ```

### Deploy para Produção
```bash
# GitHub Pages (automático em push para main)
git add . && git commit -m "feat: nova funcionalidade" && git push origin main

# Netlify (link repositório GitHub no dashboard ou CLI)
netlify deploy --prod

# Verificar
# Admin: https://clinicasyuna.github.io/yuna/admin/
# Acompanhantes: https://clinicasyuna.github.io/yuna/acompanhantes/
```

**Lembrete:** Adicionar domínio em Firebase Console → Authentication → Authorized domains

## Debugging e Troubleshooting

### Logs Estruturados
**Padrão usado no projeto:**
```javascript
console.log('[DEBUG] Contexto:', dados);
console.log('[SUCCESS] Operação:', resultado);
console.error('[ERRO] Falha em:', error);
console.log('🎯🎯🎯 [TAG] Debug específico:', valor); // Tags visuais para busca rápida
```

### Issues Comuns
1. **"Permission denied" em queries:**
   - Verificar `firestore.rules` → Usuário tem role correto?
   - Usuario está `ativo: true`?

2. **Modal não fecha:**
   - Verificar se função está em `window.X = X`
   - Classe `.hidden` está aplicada?

3. **Cache desatualizado:**
   - Limpar: `window.cachedSolicitacoes = []` e recarregar dados
   - Service worker: Limpar cache do navegador (Ctrl+Shift+Del)

4. **Timeout de sessão não funciona:**
   - Verificar se `initializeSessionTimeout()` foi chamado após login
   - Events listeners de atividade (`mousedown`, `keypress`, etc.) estão ativos?

## Considerações de Performance

### Otimizações Implementadas
- **Paginação:** Listas de usuários/solicitações carregam 50 itens por vez
- **Filtragem client-side:** Evita índices compostos Firestore (caros e lentos de criar)
- **Cache in-memory:** `window.cachedX` evita re-fetches desnecessários
- **Listeners limitados:** Desinscrever (`unsubscribe()`) ao logout/navegação

### Anti-Patterns a Evitar
- ❌ `orderBy()` + múltiplos `where()` sem índice composto → Usar `.sort()` pós-fetch
- ❌ Listeners sem cleanup → Memory leak ao navegar entre páginas
- ❌ `get()` em loop → Preferir `in` queries ou `getAll()`
- ❌ Atualizar Firestore em cada keystroke → Debounce ou salvar só ao blur

## Integrações Externas

### Dependências (Carregadas via CDN)
```html
<!-- Firebase 9.23.0 (modo compat) -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

<!-- Font Awesome 6.4.0 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- XLSX.js (só admin) -->
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
```

### EmailJS (Notificações)
- Configurado em admin para envio de notificações
- Template IDs e chaves API em variáveis globais no topo de `admin-panel.js`

## Sistema de Auditoria e Monitoramento v2.0

### Visão Geral
Sistema completo de logs, auditoria e monitoramento de usuários implementado em 14/01/2026. Registra todas as ações dos usuários (login, logout, CRUD) e permite monitoramento em tempo real de quem está online.

### Arquivos do Sistema
- **`admin/audit-system.js`** (500+ linhas) - Core do sistema de auditoria
- **`admin/audit-integration.js`** (700+ linhas) - Integração com admin-panel.js + UI completa
- **Seção HTML** - Interface em `admin/index.html` (botão "Logs e Auditoria")
- **Regras Firestore** - Permissões para `audit_logs/` e `usuarios_online/`

### Funcionalidades Principais

**1. Registro Automático de Ações:**
```javascript
// Toda ação é registrada automaticamente
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

**2. Monitoramento de Presença (Usuários Online):**
- Sistema atualiza status a cada 30 segundos
- Detecta inatividade após 5 minutos (muda para `idle`)
- Marca como `offline` ao fechar aba/naveg

ador
- Exibe tempo de sessão em tempo real

**3. Painel de Logs e Auditoria:**
- Acesso via botão "Logs e Auditoria" no menu admin
- Filtros: usuário, ação, recurso, período
- Lista em tempo real de usuários online com status
- Histórico completo de ações com detalhes
- Alertas de atividades suspeitas (múltiplas falhas, ações fora do horário)
- Exportação para Excel (em desenvolvimento)

**4. Detecção de Atividades Suspeitas:**
```javascript
const alertas = await detectarAtividadesSuspeitas();
// Detecta:
// - Múltiplas tentativas falhas de login (>= 3)
// - Ações de delete fora do horário (00h-06h)
// - Ações em cascata (>10 ações em 1 minuto)
```

### Integração com Admin Panel

**Pontos de Integração Implementados:**

1. **Login (linha ~2150):**
   - Registra login bem-sucedido
   - Inicializa sistema de presença

2. **Logout (linha ~2000):**
   - Calcula tempo de sessão
   - Registra logout com duração
   - Para sistema de presença

3. **Outras ações (via audit-integration.js):**
   - CRUD de solicitações
   - CRUD de usuários
   - Exportação de relatórios
   - Visualização de dashboards

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

### Configuração

**AUDIT_CONFIG (audit-system.js):**
```javascript
OFFLINE_TIMEOUT: 5 * 60 * 1000, // 5min sem atividade = offline
PRESENCE_UPDATE_INTERVAL: 30 * 1000, // Atualizar status a cada 30s
LOG_RETENTION_DAYS: 90 // Reter logs por 90 dias
```

### Manutenção

**Limpeza automática de logs antigos:**
```javascript
await limparLogsAntigos(); // Remove logs > 90 dias
```

**Executar periodicamente** (recomendação: 1x por semana via Cloud Functions ou script manual)

### Performance

- **Logs:** Indexação por `userId`, `action`, `resource`, `timestamp`
- **Presença:** TTL implícito (offline após 5min)
- **Queries:** Limite de 200 registros por busca (paginação client-side)
- **Cache:** Usa `window.cachedX` para evitar re-fetches

### Segurança (Firestore Rules)

```javascript
match /audit_logs/{logId} {
  allow read: if isAdmin(); // Apenas admins leem logs
  allow create: if isSignedIn(); // Usuário autenticado pode criar log de suas ações
  allow update, delete: if false; // Logs são IMUTÁVEIS
}

match /usuarios_online/{userId} {
  allow read: if isAdmin(); // Apenas admins veem quem está online
  allow write: if isSignedIn() && userId == request.auth.uid; // Só atualiza próprio status
}
```

### Uso (Para Desenvolvedores)

**Registrar ação customizada:**
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

**Buscar histórico de recurso:**
```javascript
const historico = await window.buscarHistoricoRecurso('solicitacoes', 'DOC_ID');
// Retorna array com todas as mudanças daquele documento
```

**Gerar relatório de usuário:**
```javascript
const relatorio = await window.gerarRelatorioUsuario(
    userId,
    new Date('2026-01-01'),
    new Date('2026-01-31')
);
// Retorna: totalAcoes, acoesPorTipo, acoesPorRecurso, logs[]
```

## Recursos de Referência
- **Firebase Console:** https://console.firebase.google.com (projeto: studio-5526632052-23813)
- **GitHub Repo:** https://github.com/clinicasyuna/yuna
- **Deploy Prod:** https://clinicasyuna.github.io/yuna/
- **Documentação Firebase:** https://firebase.google.com/docs/firestore
- **PWA Checklist:** https://web.dev/pwa-checklist/