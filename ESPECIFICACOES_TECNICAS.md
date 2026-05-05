# ESPECIFICAÃ‡Ã•ES TÃ‰CNICAS - SISTEMA YUNA

## ðŸ”§ ARQUITETURA DE SOFTWARE

### PadrÃ£o Arquitetural
**Multi-SPA (Multiple Single Page Applications)**
- Cada diretÃ³rio funciona como uma SPA independente
- Compartilhamento de recursos via arquivos na raiz
- Deploy otimizado com cache granular
- ManutenÃ§Ã£o modular facilitada

### Stack TecnolÃ³gico Detalhado

#### Frontend:
```javascript
// Tecnologias Core
HTML5: Estrutura semÃ¢ntica
CSS3: EstilizaÃ§Ã£o responsiva + Grid/Flexbox
JavaScript ES6+: LÃ³gica de negÃ³cio vanilla

// Bibliotecas Externas
Firebase SDK 9.23.0: Backend-as-a-Service
Font Awesome 6.4.0: Iconografia
XLSX.js: ExportaÃ§Ã£o de dados
EmailJS: Sistema de notificaÃ§Ãµes
```

#### Backend (Serverless):
```javascript
// Firebase Services
Authentication: Gerenciamento de usuÃ¡rios
Firestore: Banco NoSQL em tempo real
Hosting: Deploy e CDN global
Functions: Processamento serverless (futuro)

// ConfiguraÃ§Ã£o de SeguranÃ§a
Rules: ValidaÃ§Ã£o server-side
Indexes: OtimizaÃ§Ã£o de queries
```

### Estrutura de Dados (Firestore)

#### ColeÃ§Ãµes Principais:
```javascript
// usuarios_admin
{
  uid: string,
  email: string,
  nome: string,
  role: 'super_admin' | 'admin',
  ativo: boolean,
  criadoEm: timestamp,
  criadoPor: string,
  permissoes: {
    criarUsuarios: boolean,
    verRelatorios: boolean,
    verPesquisaSatisfacao: boolean
  }
}

// usuarios_equipe  
{
  uid: string,
  email: string,
  nome: string,
  equipe: 'manutencao' | 'nutricao' | 'higienizacao' | 'hotelaria',
  role: 'equipe',
  ativo: boolean,
  criadoEm: timestamp
}

// usuarios_acompanhantes
{
  uid: string,
  email: string,
  nome: string,
  quarto: string,
  telefone: string,
  role: 'acompanhante',
  ativo: boolean,
  criadoEm: timestamp
}

// solicitacoes
{
  id: string,
  tipo: string,
  equipe: string,
  status: 'pendente' | 'em-andamento' | 'finalizada',
  prioridade: 'normal' | 'alta' | 'urgente',
  quarto: string,
  descricao: string,
  usuarioNome: string,
  usuarioUid: string,
  dataAbertura: timestamp,
  dataFinalizacao?: timestamp,
  responsavel?: string,
  solucao?: string,
  tempoAtendimentoMinutos?: number
}

// avaliacoes_satisfacao
{
  id: string,
  solicitacaoId: string,
  nota: number (1-5),
  comentario?: string,
  dataAvaliacao: timestamp,
  usuarioUid: string
}
```

## ðŸ” SISTEMA DE SEGURANÃ‡A

### AutenticaÃ§Ã£o
```javascript
// Firebase Authentication
- OAuth2 + JWT tokens
- Session management automÃ¡tico
- Password policies configurÃ¡veis
- Rate limiting integrado
```

### AutorizaÃ§Ã£o (RBAC)
```javascript
// Role-Based Access Control
function verificarPermissoes(usuario, acao) {
  const permissoes = {
    super_admin: ['*'], // Todas as permissÃµes
    admin: ['view_all', 'export_reports', 'view_satisfaction'],
    equipe: ['view_own_team', 'update_requests'],
    acompanhante: ['create_request', 'view_own_requests']
  };
  
  return permissoes[usuario.role].includes(acao) || 
         permissoes[usuario.role].includes('*');
}
```

### Firestore Security Rules
```javascript
// Regras de seguranÃ§a no servidor
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // SolicitaÃ§Ãµes - filtro por equipe
    match /solicitacoes/{document} {
      allow read: if isAuthenticated() && 
        (isSuperAdmin() || isAdmin() || 
         (isEquipe() && resource.data.equipe == getUser().equipe) ||
         (isAcompanhante() && resource.data.usuarioUid == request.auth.uid));
      
      allow write: if isAuthenticated() && 
        (isSuperAdmin() || 
         (isEquipe() && resource.data.equipe == getUser().equipe) ||
         (isAcompanhante() && request.auth.uid != null));
    }
  }
}
```

## âš¡ PERFORMANCE E OTIMIZAÃ‡ÃƒO

### PWA (Progressive Web App)
```javascript
// Service Worker Strategy
const CACHE_NAME = 'yuna-v1.0';
const urlsToCache = [
  '/admin/',
  '/acompanhantes/',
  '/firebase-config-secure.js',
  '/manifest.json'
];

// Cache Strategy: Network First para dados dinÃ¢micos
// Cache Strategy: Cache First para assets estÃ¡ticos
```

### OtimizaÃ§Ãµes Implementadas:
- **Lazy Loading:** Carregamento sob demanda
- **Code Splitting:** DivisÃ£o de cÃ³digo por mÃ³dulos  
- **MinificaÃ§Ã£o:** CompressÃ£o CSS/JS automÃ¡tica
- **CDN:** DistribuiÃ§Ã£o global via Netlify
- **Gzip:** CompressÃ£o de transferÃªncia
- **Critical CSS:** CSS inline para above-the-fold

### MÃ©tricas de Performance:
```javascript
// Core Web Vitals Targets
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1

// Additional Metrics
TTFB (Time to First Byte): < 200ms
Speed Index: < 3.0s
Total Blocking Time: < 200ms
```

## ðŸ“± RESPONSIVIDADE E UX

### Breakpoints CSS:
```css
/* Mobile First Approach */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }

/* High DPI Displays */
@media (-webkit-min-device-pixel-ratio: 2) { /* Retina */ }
```

### Design System:
```css
:root {
  /* Cores PrimÃ¡rias */
  --primary-blue: #3b82f6;
  --primary-green: #10b981;
  --primary-orange: #f59e0b;
  
  /* Cores por Equipe */
  --manutencao: #ef4444;
  --nutricao: #22c55e;
  --higienizacao: #3b82f6;
  --hotelaria: #a855f7;
  
  /* Tipografia */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-base: 16px;
  --line-height: 1.5;
  
  /* Spacing System */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

## ðŸ”„ INTEGRAÃ‡ÃƒO E APIs

### Firebase Integration:
```javascript
// ConfiguraÃ§Ã£o Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "app-pedidos-4656c.firebaseapp.com",
  projectId: "app-pedidos-4656c",
  storageBucket: "app-pedidos-4656c.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Real-time Listeners
const unsubscribe = db.collection('solicitacoes')
  .where('equipe', '==', userEquipe)
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        handleNewRequest(change.doc.data());
      }
      if (change.type === 'modified') {
        handleRequestUpdate(change.doc.data());
      }
    });
  });
```

### EmailJS Integration:
```javascript
// Sistema de NotificaÃ§Ãµes
const emailParams = {
  to_email: userEmail,
  from_name: 'Sistema YUNA',
  subject: 'Nova SolicitaÃ§Ã£o de ServiÃ§o',
  message: `SolicitaÃ§Ã£o #${requestId} foi ${status}`
};

emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, PUBLIC_KEY);
```

## ðŸš€ DEPLOYMENT E CI/CD

### Environment Configuration:
```javascript
// Netlify Deploy Settings
[build]
  publish = "."
  command = "echo 'Static site - no build required'"

[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200

[[redirects]]
  from = "/acompanhantes/*" 
  to = "/acompanhantes/index.html"
  status = 200

// API Proxy
[[redirects]]
  from = "/api/*"
  to = "https://api.yuna.com.br/:splat"
  status = 200
```

### GitHub Actions Pipeline:
```yaml
name: Deploy to Production
on:
  push:
    branches: [ main ]
    
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Netlify
      uses: netlify/actions/build@master
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## ðŸ“Š MONITORING E ANALYTICS

### Error Tracking:
```javascript
// Custom Error Handler
window.addEventListener('error', (event) => {
  console.error('[SISTEMA-ERRO]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });
  
  // Enviar para sistema de monitoramento
  sendErrorToMonitoring(event);
});
```

### Performance Monitoring:
```javascript
// Web Vitals Tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## ðŸ”® ESCALABILIDADE E FUTURO

### Arquitetura Preparada Para:
- **Microservices:** MigraÃ§Ã£o gradual para arquitetura distribuÃ­da
- **Multi-tenant:** Suporte a mÃºltiplas clÃ­nicas/hospitais
- **Mobile Apps:** Base PWA facilita desenvolvimento nativo
- **AI/ML:** APIs preparadas para integraÃ§Ã£o de IA
- **IoT:** IntegraÃ§Ã£o com dispositivos hospitalares

### Roadmap TÃ©cnico:
1. **v1.1:** Mobile apps nativas (React Native)
2. **v1.2:** Sistema de relatÃ³rios avanÃ§ado (BI)
3. **v2.0:** Multi-tenant completo
4. **v2.1:** IntegraÃ§Ã£o HL7/FHIR
5. **v3.0:** AI para prediÃ§Ã£o de demandas

---

**Â© 2024-2025 Samuel dos Reis Lacerda Junior - Todos os direitos reservados**  
**Sistema YUNA - EspecificaÃ§Ãµes TÃ©cnicas ProprietÃ¡rias**  
**Desenvolvido por:** Samuel dos Reis Lacerda Junior  
**CNPJ:** 55.004.442 SAMUEL DOS REIS LACERDA JUNIOR  
**Contato:** ti@yuna.com.br | +55 11 94586-4671

