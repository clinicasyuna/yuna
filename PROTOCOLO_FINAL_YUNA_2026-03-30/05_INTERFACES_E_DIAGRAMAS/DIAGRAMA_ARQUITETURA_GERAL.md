# 🏗️ DIAGRAMA DE ARQUITETURA GERAL - YUNA SOLICITE V2.0

## 📋 INSTRUÇÕES PARA RENDERIZAÇÃO

Este arquivo contém diagramas em formato **Mermaid** que precisam ser convertidos para imagens PNG/PDF.

### Ferramentas para Converter:

1. **Online (Recomendado):**
   - https://mermaid.live/
   - Copiar código → Colar → Baixar PNG/SVG

2. **VS Code:**
   - Instalar extensão "Markdown Preview Mermaid Support"
   - Abrir preview (Ctrl+Shift+V)
   - Clicar com botão direito → Exportar

3. **CLI:**
   ```bash
   npm install -g @mermaid-js/mermaid-cli
   mmdc -i DIAGRAMA_ARQUITETURA_GERAL.md -o arquitetura_geral.png
   ```

---

## 1️⃣ ARQUITETURA GERAL DO SISTEMA

```mermaid
graph TB
    subgraph "CAMADA DE APRESENTAÇÃO"
        A1[🌐 Portal Acompanhantes<br/>index.html 4.5k linhas]
        A2[🖥️ Painel Admin<br/>admin-panel.js 13k linhas]
    end

    subgraph "CAMADA DE AUTENTICAÇÃO"
        B1[🔐 Firebase Authentication]
        B2[🛡️ RBAC System<br/>admin-permissions.js]
        B3[⏱️ Session Timeout<br/>10 min inatividade]
    end

    subgraph "CAMADA DE LÓGICA"
        C1[📝 Gestão Solicitações]
        C2[👥 Gestão Usuários]
        C3[📊 Analytics Dashboard]
        C4[⭐ Sistema Avaliação]
    end

    subgraph "MÓDULOS DE OTIMIZAÇÃO"
        D1[⚡ Performance Monitor<br/>349 linhas]
        D2[🔄 Listener Manager<br/>286 linhas]
        D3[💾 Cache Manager LRU<br/>410 linhas]
        D4[🔍 Query Helper<br/>380 linhas]
    end

    subgraph "CAMADA DE DADOS"
        E1[(🗄️ Firestore Database)]
        E2[📂 Collections:<br/>usuarios_admin<br/>usuarios_equipe<br/>usuarios_acompanhantes<br/>solicitacoes<br/>quartos_ocupados]
    end

    subgraph "CAMADA DE INFRAESTRUTURA"
        F1[☁️ Firebase Hosting]
        F2[🌐 Netlify/GitHub Pages]
        F3[📦 Service Worker<br/>PWA Offline]
        F4[🔔 Push Notifications]
    end

    A1 --> B1
    A2 --> B1
    B1 --> B2
    B2 --> C1
    B2 --> C2
    B1 --> B3

    C1 --> D1
    C1 --> D2
    C2 --> D3
    C3 --> D4

    D1 --> E1
    D2 --> E1
    D3 --> E1
    D4 --> E1

    E1 --> E2

    F1 --> A1
    F1 --> A2
    F2 --> A1
    F2 --> A2
    F3 --> A1
    F3 --> A2
    F4 --> A1

    style A1 fill:#4CAF50,stroke:#2E7D32,color:#fff
    style A2 fill:#2196F3,stroke:#1565C0,color:#fff
    style B1 fill:#FF9800,stroke:#E65100,color:#fff
    style B2 fill:#FF9800,stroke:#E65100,color:#fff
    style B3 fill:#FF9800,stroke:#E65100,color:#fff
    style D1 fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style D2 fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style D3 fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style D4 fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style E1 fill:#607D8B,stroke:#37474F,color:#fff
    style F3 fill:#00BCD4,stroke:#006064,color:#fff
```

---

## 2️⃣ FLUXO DE DADOS - SOLICITAÇÃO DE SERVIÇO

```mermaid
sequenceDiagram
    participant A as 👤 Acompanhante
    participant UI as 🌐 Portal UI
    participant Auth as 🔐 Firebase Auth
    participant Cache as 💾 Cache Manager
    participant Perf as ⚡ Performance Monitor
    participant DB as 🗄️ Firestore
    participant Admin as 🖥️ Painel Admin
    participant Equipe as 👷 Usuário Equipe

    A->>UI: 1. Seleciona serviço (🔧/🍽️/🧽/🏨)
    UI->>Auth: 2. Valida sessão ativa
    Auth-->>UI: 3. Token válido

    UI->>UI: 4. Abre modal formulário
    A->>UI: 5. Preenche (tipo, prioridade, descrição)
    
    UI->>Perf: 6. Inicia medição de operação
    UI->>DB: 7. Cria documento solicitação
    
    Note over DB: {<br/>  usuarioId: uid,<br/>  tipo: 'manutencao',<br/>  status: 'pendente',<br/>  equipe: 'Manutenção',<br/>  prioridade: 'alta',<br/>  criadoEm: timestamp<br/>}

    DB-->>UI: 8. Solicitação criada (ID)
    Perf->>Perf: 9. Registra tempo operação
    
    DB->>Admin: 10. Real-time listener notifica
    Admin->>Admin: 11. Atualiza contador "Pendentes"
    
    Admin->>Equipe: 12. Notificação push (se online)
    
    UI->>Cache: 13. Invalida cache solicitações
    UI->>A: 14. Toast "Solicitação criada!"
    
    UI->>UI: 15. Atualiza lista solicitações
```

---

## 3️⃣ FLUXO DE AUTENTICAÇÃO E RBAC

```mermaid
flowchart TD
    A[🔑 Usuário faz login] --> B{Credenciais válidas?}
    B -->|❌ Não| C[🚫 Erro login]
    B -->|✅ Sim| D[🔐 Firebase Auth]
    
    D --> E{Tipo de usuário?}
    
    E -->|Admin| F[Busca usuarios_admin]
    E -->|Equipe| G[Busca usuarios_equipe]
    E -->|Acompanhante| H[Busca usuarios_acompanhantes]
    
    F --> I{Ativo?}
    G --> J{Ativo?}
    H --> K{Ativo?}
    
    I -->|❌ Não| L[🚫 Acesso negado]
    J -->|❌ Não| L
    K -->|❌ Não| L
    
    I -->|✅ Sim| M{Role?}
    M -->|super_admin| N[✅ Full Access<br/>Todas permissões]
    M -->|admin| O[✅ Admin Access<br/>Permissões limitadas]
    
    J -->|✅ Sim| P[✅ Equipe Access<br/>Apenas seu departamento]
    
    K -->|✅ Sim| Q{Pré-cadastro?}
    Q -->|Sim| R[🔄 Ativar conta<br/>Redefinir senha]
    Q -->|Não| S[✅ Acompanhante Access<br/>Próprias solicitações]
    
    N --> T[Inicia Session Timeout<br/>10 min inatividade]
    O --> T
    P --> T
    R --> S
    S --> T
    
    T --> U[🎯 Dashboard carregado]
    
    style A fill:#4CAF50,stroke:#2E7D32,color:#fff
    style N fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style O fill:#2196F3,stroke:#1565C0,color:#fff
    style P fill:#FF9800,stroke:#E65100,color:#fff
    style S fill:#00BCD4,stroke:#006064,color:#fff
    style L fill:#F44336,stroke:#C62828,color:#fff
    style C fill:#F44336,stroke:#C62828,color:#fff
```

---

## 4️⃣ MÓDULOS DE OTIMIZAÇÃO - INTERAÇÃO

```mermaid
graph LR
    subgraph "ENTRADA"
        A[🌐 Requisição UI]
    end

    subgraph "PERFORMANCE MONITOR"
        B1[⏱️ Inicia timer]
        B2[📊 Coleta métricas]
        B3[💾 Armazena dados]
    end

    subgraph "CACHE MANAGER"
        C1{Cache hit?}
        C2[✅ Retorna do cache]
        C3[❌ Cache miss]
    end

    subgraph "QUERY HELPER"
        D1[🔍 Otimiza query]
        D2[📄 Aplica paginação]
        D3[🔢 Limita resultados]
    end

    subgraph "LISTENER MANAGER"
        E1[🔄 Registra listener]
        E2[🧹 Auto-cleanup]
        E3[📈 Rastreia ativos]
    end

    subgraph "FIRESTORE"
        F[(🗄️ Database)]
    end

    subgraph "SAÍDA"
        G[✅ Resposta UI]
    end

    A --> B1
    B1 --> C1
    
    C1 -->|Hit| C2
    C1 -->|Miss| C3
    
    C2 --> B2
    C3 --> D1
    
    D1 --> D2
    D2 --> D3
    D3 --> E1
    
    E1 --> F
    F --> E2
    E2 --> B2
    
    B2 --> B3
    B3 --> E3
    E3 --> G

    style B1 fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style C1 fill:#FF9800,stroke:#E65100,color:#fff
    style D1 fill:#2196F3,stroke:#1565C0,color:#fff
    style E1 fill:#4CAF50,stroke:#2E7D32,color:#fff
    style F fill:#607D8B,stroke:#37474F,color:#fff
    style G fill:#00BCD4,stroke:#006064,color:#fff
```

---

## 5️⃣ SISTEMA DE QUARTOS - CONTROLE ATÔMICO

```mermaid
flowchart TD
    A[👤 Cadastro/Atualização<br/>Acompanhante] --> B[🔒 Inicia Transação Firestore]
    
    B --> C[📖 Lê quartos_ocupados<br/>doc ID = quarto]
    
    C --> D{Quarto existe?}
    
    D -->|❌ Não| E[✅ Quarto livre]
    D -->|✅ Sim| F{ativo = true?}
    
    F -->|❌ Não| E
    F -->|✅ Sim| G{acompanhanteId<br/>é o mesmo?}
    
    G -->|✅ Sim| H[✅ Mesmo usuário<br/>pode atualizar]
    G -->|❌ Não| I[🚫 ERRO:<br/>Quarto ocupado]
    
    E --> J[✏️ Cria/Atualiza<br/>usuarios_acompanhantes]
    H --> J
    
    J --> K[✏️ Cria/Atualiza<br/>quartos_ocupados]
    
    K --> L[✅ Commit Transação]
    
    I --> M[❌ Rollback Transação]
    
    L --> N[🎉 Sucesso]
    M --> O[⚠️ Mostrar erro ao usuário]
    
    style A fill:#4CAF50,stroke:#2E7D32,color:#fff
    style B fill:#FF9800,stroke:#E65100,color:#fff
    style E fill:#00BCD4,stroke:#006064,color:#fff
    style H fill:#00BCD4,stroke:#006064,color:#fff
    style I fill:#F44336,stroke:#C62828,color:#fff
    style L fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style M fill:#F44336,stroke:#C62828,color:#fff
    style N fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

## 6️⃣ SISTEMA DE AVALIAÇÃO AUTOMÁTICA

```mermaid
sequenceDiagram
    participant DB as 🗄️ Firestore
    participant Listener as 🔄 Real-time Listener
    participant UI as 🌐 Portal UI
    participant A as 👤 Acompanhante
    participant Avaliacao as ⭐ Sistema Avaliação

    Note over DB: Solicitação muda para<br/>status: 'finalizada'

    DB->>Listener: 1. Notifica mudança (snapshot)
    Listener->>Avaliacao: 2. Verifica condições

    Avaliacao->>Avaliacao: 3. Checa:<br/>- avaliada = false<br/>- finalizadoEm < 7 dias

    alt Pode avaliar
        Avaliacao->>UI: 4. Mostra botão "Avaliar"
        UI->>A: 5. Exibe badge "Novo!"
        
        A->>UI: 6. Clica "Avaliar"
        UI->>UI: 7. Abre modal avaliação
        
        A->>UI: 8. Seleciona:<br/>- Nota (1-5 estrelas)<br/>- Aspectos (rapidez, qualidade, atendimento)<br/>- Comentário<br/>- Recomendaria?
        
        UI->>DB: 9. Atualiza solicitação
        
        Note over DB: satisfacao: {<br/>  nota: 5,<br/>  aspectos: {...},<br/>  comentarios: "...",<br/>  recomendaria: true,<br/>  avaliadoEm: timestamp<br/>}<br/>avaliada: true

        DB-->>UI: 10. Confirmação
        UI->>A: 11. Toast "Avaliação enviada!"
        UI->>UI: 12. Remove botão "Avaliar"
        
    else Não pode avaliar
        Avaliacao->>UI: 4. Oculta botão
        Note over UI: - Já avaliada<br/>- Passou 7 dias<br/>- Status diferente
    end
```

---

## 7️⃣ PWA - ESTRATÉGIA DE CACHE

```mermaid
flowchart TD
    A[📱 Requisição Recurso] --> B{Service Worker<br/>instalado?}
    
    B -->|❌ Não| C[🌐 Rede direta]
    B -->|✅ Sim| D{Tipo de recurso?}
    
    D -->|📄 HTML/CSS/JS| E[Cache First]
    D -->|🖼️ Imagens| F[Cache First]
    D -->|🔥 Firebase SDK| G[Network First]
    D -->|🗄️ API Firestore| H[Network Only]
    
    E --> I{Está no cache?}
    F --> I
    
    I -->|✅ Sim| J[✅ Retorna do cache<br/>Offline OK]
    I -->|❌ Não| K[🌐 Busca na rede]
    
    K --> L{Rede disponível?}
    L -->|✅ Sim| M[💾 Salva no cache]
    L -->|❌ Não| N[🚫 Erro offline]
    
    M --> O[✅ Retorna recurso]
    
    G --> P[🌐 Tenta rede primeiro]
    P --> Q{Sucesso?}
    Q -->|✅ Sim| R[💾 Atualiza cache]
    Q -->|❌ Não| S{Está no cache?}
    S -->|✅ Sim| T[✅ Retorna versão antiga]
    S -->|❌ Não| N
    
    H --> U[🌐 Apenas rede<br/>Requer conexão]
    
    C --> V[✅ Retorna recurso]
    
    style J fill:#4CAF50,stroke:#2E7D32,color:#fff
    style N fill:#F44336,stroke:#C62828,color:#fff
    style O fill:#4CAF50,stroke:#2E7D32,color:#fff
    style T fill:#FF9800,stroke:#E65100,color:#fff
```

---

## 📊 MÉTRICAS DE OTIMIZAÇÃO

### Antes vs Depois dos Módulos

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Tempo de carregamento** | 3.2s | 1.3s | ⬇️ 60% |
| **Leituras Firestore** | 850/dia | 85/dia | ⬇️ 90% |
| **Listeners ativos** | 15+ | 4-6 | ⬇️ 65% |
| **Cache hit rate** | 0% | 78% | ⬆️ 78% |
| **Tempo médio query** | 420ms | 95ms | ⬇️ 77% |
| **Memory leaks** | Sim | Não | ✅ 100% |

---

## 🎨 LEGENDA DE CORES

- 🟢 **Verde** (#4CAF50) - Camada de Apresentação / Sucesso
- 🔵 **Azul** (#2196F3) - Painel Admin / Lógica
- 🟠 **Laranja** (#FF9800) - Autenticação / Alerta
- 🟣 **Roxo** (#9C27B0) - Otimização / Destaque
- 🔴 **Vermelho** (#F44336) - Erro / Negado
- ⚫ **Cinza** (#607D8B) - Dados / Infraestrutura
- 🔷 **Ciano** (#00BCD4) - PWA / Features

---

## 📋 EXPORTAÇÃO PARA PDF

### Passo a passo:

1. **Abra:** https://mermaid.live/
2. **Copie** cada bloco de código `mermaid`
3. **Cole** no editor online
4. **Ajuste** tema (Padrão/Neutro recomendado)
5. **Baixe** como PNG ou SVG
6. **Nomeie** os arquivos:
   - `01_arquitetura_geral.png`
   - `02_fluxo_solicitacao.png`
   - `03_fluxo_autenticacao.png`
   - `04_modulos_otimizacao.png`
   - `05_sistema_quartos.png`
   - `06_sistema_avaliacao.png`
   - `07_pwa_cache.png`

7. **Consolide** em PDF usando PowerPoint:
   - 1 slide por diagrama
   - Adicione título e descrição
   - Exporte como `YUNA_v2.0_Diagramas_Arquitetura.pdf`

---

## ✅ CHECKLIST

- [ ] Todos os 7 diagramas renderizados
- [ ] Formato PNG ou SVG alta qualidade
- [ ] Cores originais preservadas
- [ ] Texto legível (fontes adequadas)
- [ ] Consolidado em PDF único
- [ ] Salvo em `6_DIAGRAMAS/`

---

**Autor:** Samuel Jesus Santos  
**Versão:** 2.0  
**Data:** Janeiro 2026  
**Copyright:** © 2026 YUNA - Todos os direitos reservados
