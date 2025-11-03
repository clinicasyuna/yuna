# Sistema de Gerenciamento de Solicitações YUNA - Guia de Programação para IA

## Visão Geral do Sistema
Este é um sistema de gerenciamento de solicitações de serviços de saúde para clínicas YUNA com duas interfaces principais:
- **Painel Administrativo** (`/admin/`) - Dashboard para equipe e administradores gerenciarem solicitações
- **Portal dos Acompanhantes** (`/acompanhantes/`) - Interface para acompanhantes de pacientes enviarem solicitações

## Arquitetura e Stack Tecnológico

### Arquitetura Frontend
- **JavaScript Vanilla** com Firebase SDK (sem frameworks)
- **Estrutura multi-tenant**: Cada diretório (`admin/`, `acompanhantes/`) é uma SPA separada
- **Componentes compartilhados**: Configuração Firebase, service worker e manifest na raiz
- **Deploy**: Netlify com redirecionamentos configurados em `netlify.toml` e `_redirects`

### Backend e Dados
- **Firebase Authentication** para gerenciamento de usuários
- **Firestore** coleções:
  - `usuarios_admin` - Usuários administradores com permissões baseadas em roles
  - `usuarios_equipe` - Usuários da equipe por departamento
  - `usuarios_acompanhantes` - Acompanhantes de pacientes
  - `solicitacoes` - Solicitações de serviços de todas as equipes
  - `quartos_ocupados` - Controle de ocupação de quartos
- **Atualizações em tempo real** via listeners do Firestore

## Padrões Chave da Lógica de Negócio

### Controle de Acesso Baseado em Roles (RBAC)
```javascript
// Localizado em admin/admin-permissions.js
// Três roles: super_admin > admin > equipe
// Permissões verificadas via temPermissaoJS(user, 'create_users')
// Filtragem por departamento via podeVerSolicitacaoJS()
```

### Fluxo de Trabalho das Solicitações
1. **Criação**: Acompanhantes enviam solicitações via cards de serviço (Manutenção, Nutrição, Higienização, Hotelaria)
2. **Atribuição**: Auto-atribuídas às equipes de departamento baseado no tipo de serviço
3. **Processamento**: Membros da equipe atualizam status (pendente → em-andamento → finalizada)
4. **Satisfação**: Prompt automático para avaliações em solicitações concluídas (janela de 7 dias)

### Sistema de Gerenciamento de Quartos
- **Operações atômicas** para atribuição de quartos usando transações Firestore
- **Validação de ocupação** previne atribuições duplicadas de quartos
- **Auto-limpeza** de registros órfãos durante validação

## Padrões de Desenvolvimento

### Integração Firebase
```javascript
// Padrão de inicialização usado em ambas SPAs
firebase.initializeApp(firebaseConfig);
window.auth = firebase.auth();
window.db = firebase.firestore();

// Gerenciamento de estado de autenticação
firebase.auth().onAuthStateChanged(async (user) => {
    // Verificação de role e gerenciamento de estado da UI
});
```

### Gerenciamento de Modais e Estado da UI
- **Manipulação manual do DOM** para estados show/hide usando classe `.hidden`
- **Padrão de exposição de funções**: `window.functionName = functionName` para acesso global
- **Notificações Toast**: Implementação customizada em ambas SPAs

### Padrões de Carregamento de Dados
```javascript
// Padrão padrão para consultas Firestore com tratamento de erro
async function carregarSolicitacoes() {
    try {
        const snapshot = await window.db.collection('solicitacoes').get();
        // Processar e renderizar dados
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro', 'Mensagem amigável', 'error');
    }
}
```

## Guia de Estrutura de Arquivos

### Arquivos Críticos
- `admin/admin-panel.js` - Lógica principal do admin e operações Firestore
- `admin/admin-permissions.js` - Implementação do RBAC
- `acompanhantes/index.html` - Portal dos acompanhantes (3160 linhas, auto-contido)
- `firebase-config-secure.js` - Configuração Firebase compartilhada
- `netlify.toml` - Configuração de deploy com proxy de API

### Configuração de Deploy
- **Redirecionamentos Netlify** lidam com roteamento SPA e proxy de API para `api.yuna.com.br`
- **Capacidades PWA** via `manifest.json` e `service-worker.js`
- **Setup multi-ambiente** com configuração Firebase segura

## Fluxo de Trabalho de Desenvolvimento

### Adicionando Novas Funcionalidades
1. **Funcionalidades admin**: Modificar `admin/admin-panel.js` e atualizar verificações de permissão
2. **Funcionalidades acompanhantes**: Editar JavaScript inline em `acompanhantes/index.html`
3. **Mudanças compartilhadas**: Atualizar arquivos na raiz para configuração Firebase ou PWA

### Tarefas Comuns
- **Novos tipos de usuário**: Adicionar à coleção Firestore apropriada e atualizar fluxos de auth
- **Novos tipos de solicitação**: Estender grids de cards de serviço e atualizar fluxos de status
- **Mudanças de permissão**: Modificar `admin/admin-permissions.js` e atribuições de roles

### Diretrizes de Debug
- **Log no console**: Uso extensivo de `console.log/error` com prefixos descritivos
- **Regras Firebase**: Lembrar de atualizar regras de segurança Firestore para novas coleções
- **Sincronização em tempo real**: Usar listeners Firestore para atualizações ao vivo, evitar polling

## Pontos de Integração

### Dependências Externas
- **Firebase SDK 9.23.0** (modo compat para compatibilidade legada)
- **Font Awesome 6.4.0** para ícones
- **EmailJS** para sistemas de notificação
- **XLSX.js** para funcionalidade de exportação Excel em relatórios admin

### Integração de API
- Netlify faz proxy de requisições `/api/*` para `https://api.yuna.com.br/:splat`
- Considerar isso para integrações de serviços externos

## Considerações de Performance
- **Filtragem client-side** preferida sobre consultas Firestore complexas
- **Paginação** implementada para grandes datasets (usuários, solicitações)
- **Atualizações otimistas da UI** com fallbacks de erro para melhor UX