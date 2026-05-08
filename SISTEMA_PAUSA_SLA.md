# Sistema de Pausa de SLA - Yuna Solicite
## Documentação Completa

**Data de Implementação:** 08 de maio de 2026  
**Status:** Pronto para Integração  
**Módulos:** 2 (admin-panel, acompanhantes-portal)

---

## 📋 Visão Geral

O **Sistema de Pausa de SLA** permite que as equipes pausem o cronômetro de SLA durante o atendimento de solicitações quando necessário aguardar recursos externos (peças, informações, aprovações, etc.).

### Benefícios Principais
✅ **Realismo de Métricas** - SLA reflete apenas tempo de trabalho real  
✅ **Transparência** - Acompanhante sabe por que o atendimento demorará mais  
✅ **Auditoria Completa** - Histórico de todas as pausas com timestamps  
✅ **Sem Perda de SLA** - Equipe não é penalizada por esperar recursos  

---

## 🏗️ Arquitetura Técnica

### Estrutura de Dados (Firestore)
```javascript
// Nova seção da coleção "solicitacoes"
{
  id: "string",
  // ... campos existentes ...
  
  // CAMPOS DE PAUSA SLA
  slaEmPausa: false,                    // boolean: SLA está em pausa?
  pausaAtiva: {                         // pausa atual (null se não em pausa)
    motivo: "string",                   // razão da pausa
    dataInicio: "ISO8601",              // quando pausou
    usuario: "uid",                     // quem pausou
    email: "email@exemplo.com"          // referência legível
    timestamp: Timestamp                // timestamp Firestore
  },
  historicopauas: [                     // array de pausas completadas
    {
      motivo: "string",
      dataInicio: "ISO8601",
      dataFim: "ISO8601",
      duracao: 45,                      // minutos
      usuario: "uid",
      email: "email@exemplo.com"
    }
  ],
  tempoTotalEmPausa: 120                // total acumulado em minutos
}
```

### Fluxo de Cálculo de SLA

**Antes da Pausa:**
```
SLA Cumprido = tempoTotal <= slaLimite
Tempo = 240 minutos
SLA Limite = 240 min (Manutenção)
Status = VIOLADO (240 > 240 é falso, mas 240 = 240)
```

**Com Pausa Implementada:**
```
tempoEfetivo = tempoTotal - tempoTotalEmPausa
SLA Cumprido = tempoEfetivo <= slaLimite

Exemplo:
- Tempo total: 300 min
- Pausas: 60 min (esperando peça)
- Tempo efetivo: 300 - 60 = 240 min
- SLA Limite: 240 min
- Status: CUMPRIDO ✅
```

### Módulos Criados

#### 1. `admin/sla-pause-system.js` (500+ linhas)
Core do sistema com funções principais:

```javascript
// Pausar SLA
pausarSLA(solicitacaoId, motivo, usuario)
// Retorna: {success, mensagem, pausa}

// Retomar SLA  
retomarSLA(solicitacaoId, usuario)
// Retorna: {success, mensagem, duracaoPausa, pausaCompletada}

// Calcular tempo efetivo
calcularTempoSLAEfetivo(solicitacao, dataAtual)
// Retorna: número de minutos (excluindo pausas)

// Verificar status
verificarStatusSLAComPausa(solicitacao, slaLimite)
// Retorna: {cumprido, status, tempoEfetivo, tempoEmPausa, ...}

// Gerar HTML de pausa
gerarHTMLStatusPausa(solicitacao)
// Retorna: string HTML com status visível

// UI de pausa
abrirModalPausarSLA(solicitacaoId, equipe)
executarPausarSLA(solicitacaoId, equipe)
executarRetomarSLA(solicitacaoId)
```

#### 2. `acompanhantes/sla-pause-portal.js` (200+ linhas)
Integração para portal de acompanhantes:

```javascript
// Formatar para exibição
formatarStatusPausaParaPortal(solicitacao)
// Retorna: HTML com notificação visual

// Adicionar badge de pausa
adicionarIndicadorPausaCard(elementoCard, solicitacao)

// Notificar acompanhante
notificarPausaSLA(solicitacaoId, motivo, emailEquipe)

// Listener em tempo real
ouvirPausaSLA(solicitacaoId, callbackOnChange)
// Retorna: unsubscribe function
```

---

## 🎯 Fluxo de Uso

### Cenário: Manutenção Aguardando Peça

**Passo 1 - Equipe Identifica Necessidade**
```
14:30 - Técnico abre solicitação de manutenção
14:35 - Identifica que precisa de peça X
14:36 - Clica em "Pausar SLA"
```

**Passo 2 - Modal de Pausa Aparece**
```
Título: ⏸️ Pausar SLA
Motivo: [textarea]
Exemplo: "Aguardando chegada de peça/rolamento 
          solicitada ao fornecedor. ETA: 30 min"
Botão: "Pausar SLA"
```

**Passo 3 - Sistema Registra Pausa**
```
Admin Panel:
- SLA pausa em 14:36:22
- Campo "slaEmPausa" = true
- Campo "pausaAtiva" preenchido
- Auditoria registrada

Portal Acompanhante:
- Notificação: "⏸️ Atendimento em Pausa"
- Motivo: "Aguardando chegada de peça..."
- Não conta tempo para SLA
```

**Passo 4 - Equipe Retoma Atendimento**
```
15:06 - Peça chega
15:07 - Técnico clica "Retomar SLA"
- Sistema registra:
  - Duração da pausa: 31 minutos
  - Status: RETOMADO
  - Cronômetro volta a contar
```

**Passo 5 - Solicitação Finalizada**
```
15:45 - Técnico finaliza solicitação
- Cálculo de SLA:
  - Tempo total: 75 minutos
  - Pausa: 31 minutos
  - Tempo efetivo: 44 minutos
  - Limite: 240 minutos
  - Status: CUMPRIDO ✅
  - Histórico: 1 pausa registrada
```

---

## 🔌 Integração no Admin Panel

### 1. Carregar Script (já feito em `admin/index.html`)
```html
<script src="sla-pause-system.js?v=20260508-001"></script>
```

### 2. Exibir Status de Pausa no Modal
```javascript
// Adicionar antes da seção de métricas:
${gerarHTMLStatusPausa(solicitacao)}
```

### 3. Adicionar Botões de Pausa/Retomada
```javascript
if (solicitacao.status === 'em-andamento') {
    if (solicitacao.slaEmPausa) {
        // Botão de Retomar
        <button onclick="executarRetomarSLA('${solicitacao.id}')">
            ▶️ Retomar SLA
        </button>
    } else {
        // Botão de Pausar
        <button onclick="abrirModalPausarSLA('${solicitacao.id}', '${solicitacao.equipe}')">
            ⏸️ Pausar SLA
        </button>
    }
}
```

### 4. Atualizar Cálculo de SLA
```javascript
// Ao invés de:
const statusSLA = tempoTotal <= slaLimite ? 'cumprido' : 'violado';

// Usar:
const statusSLA = verificarStatusSLAComPausa(solicitacao, slaLimite);
// statusSLA = {cumprido, status, tempoEfetivo, ...}
```

---

## 🔌 Integração no Portal de Acompanhantes

### 1. Carregar Script
```html
<script src="sla-pause-portal.js"></script>
```

### 2. Exibir Status ao Carregar Solicitações
```javascript
// Na função que renderiza solicitações:
if (solicitacao.slaEmPausa) {
    // Inserir antes dos dados principais
    containerSolicitacao.innerHTML += formatarStatusPausaParaPortal(solicitacao);
}
```

### 3. Adicionar Listener em Tempo Real
```javascript
const unsubscribe = ouvirPausaSLA(solicitacaoId, (estadoPausa, solicitacao) => {
    if (estadoPausa.emPausa) {
        notificarPausaSLA(solicitacaoId, estadoPausa.motivo, '...');
        // Atualizar UI
        containerSolicitacao.innerHTML = formatarStatusPausaParaPortal(solicitacao);
    }
});

// Ao descarregar página:
unsubscribe();
```

### 4. Adicionar Badge de Pausa aos Cards
```javascript
// Ao renderizar card de solicitação:
adicionarIndicadorPausaCard(cardElement, solicitacao);
// Adiciona "⏸️ SLA Pausado" no canto superior direito
```

---

## 📊 Campos de Pausa por Equipe

| Equipe | SLA Limite | Motivos Típicos de Pausa |
|--------|-----------|--------------------------|
| **Manutenção** | 240 min (4h) | Aguardando peça, ferramenta não disponível, aprovação do gestor |
| **Higienização** | 120 min (2h) | Aguardando material, usuário não disponível, limpeza profunda necessária |
| **Hotelaria** | 180 min (3h) | Aguardando atendimento do acompanhante, material fora de estoque, decisão do hóspede |

---

## 🔐 Regras de Segurança (Firestore)

```javascript
// Apenas equipes podem pausar/retomar SLA de suas solicitações
match /solicitacoes/{docId} {
  // Pausar SLA
  allow update: if request.auth != null 
    && resource.data.equipe == get(/databases/$(database)/documents/usuarios_equipe/$(request.auth.uid)).data.equipe
    && request.resource.data.slaEmPausa == true
    && request.resource.data.pausaAtiva != null;
  
  // Retomar SLA
  allow update: if request.auth != null 
    && resource.data.equipe == get(/databases/$(database)/documents/usuarios_equipe/$(request.auth.uid)).data.equipe
    && request.resource.data.slaEmPausa == false
    && request.resource.data.pausaAtiva == null;
}
```

---

## 📈 Casos de Uso

### ✅ Quando Usar Pausa de SLA

1. **Aguardando Recursos Físicos**
   - Peça em compra
   - Material em reposição
   - Ferramenta indisponível

2. **Aguardando Terceiros**
   - Aprovação de gestor
   - Contato com fornecedor
   - Comunicação com técnico especializado

3. **Aguardando Cliente**
   - Acompanhante indisponível
   - Cliente fora do quarto
   - Solicitação de informação do acompanhante

4. **Aguardando Eventos**
   - Horário de funcionamento
   - Período de descanso
   - Fim de turno

### ❌ Quando NÃO Usar Pausa de SLA

- Inatividade / Procrastinação
- Desorganização da equipe
- Falta de recursos planejados
- Não deve ser usada para "ganhar tempo"

**⚠️ A auditoria registra QUEM pausou e QUANDO, então abuso será visível**

---

## 📊 Métricas e Relatórios

### Dados Coletados
```javascript
stats = {
  // Existentes
  tempoTotal: 240,
  tempoTrabalho: 180,
  statusSLA: 'cumprido',
  
  // Novos
  tempoEmPausa: 60,
  numeroPausas: 2,
  pausaMedia: 30,
  pausaMais Longa: 45,
  tempoEfetivoSLA: 180  // Excluindo pausas
}
```

### Relatórios Possíveis

**Por Equipe:**
- Total de pausas
- Tempo médio em pausa
- Motivos mais comuns
- Impacto no cumprimento de SLA

**Por Motivo:**
- Frequência de cada motivo
- Tempo médio por motivo
- Equipes mais afetadas

**Individual:**
- Histórico de pausas por técnico
- Padrões de comportamento
- Eficiência (tempo pausa vs tempo trabalho)

---

## 🚀 Melhorias Futuras

1. **Templates de Motivos**
   - Dropdown pré-preenchido com motivos comuns
   - Economiza tempo de digitação

2. **Notificações Automáticas**
   - SMS/Email ao acompanhante quando pausa atinge X minutos
   - Alerta à equipe para retomar

3. **Estimativa de Tempo**
   - Campo "Quanto tempo em pausa?" no modal
   - Uso para agendar follow-up automático

4. **Relatórios em Tempo Real**
   - Dashboard mostrando solicitações em pausa agora
   - Duração acumulada por motivo

5. **Integração com CRM**
   - Sincronizar pausas com sistema externo
   - Histórico centralizado

---

## 🧪 Teste Rápido

### Checklist de Validação

- [ ] Sistema carrega sem erros (console.log: "✅ Sistema de Pausa de SLA...")
- [ ] Botão "Pausar SLA" aparece quando status = "em-andamento"
- [ ] Modal abre com formulário de motivo
- [ ] Pausa registra em Firestore
- [ ] SLA para de contar (tempoDesdeAbertura não aumenta)
- [ ] Botão muda para "Retomar SLA"
- [ ] Acompanhante vê notificação de pausa
- [ ] Histórico de pausas exibe corretamente
- [ ] SLA final não conta tempo em pausa
- [ ] Auditoria registra ação (action: 'pause_sla' / 'resume_sla')

---

## 🐛 Troubleshooting

### Problema: Botão não aparece

**Solução:**
1. Verificar se `sla-pause-system.js` foi carregado (F12 > Console)
2. Validar se `solicitacao.status === 'em-andamento'`
3. Confirmar que usuário tem permissão de equipe para solicitação

### Problema: Pausa não registra

**Solução:**
1. Verificar permissões Firestore para coleção `solicitacoes`
2. Validar Firestore rules (seção acima)
3. Confirmar que `firebase.firestore.Timestamp.now()` funciona

### Problema: SLA ainda conta durante pausa

**Solução:**
1. Verificar se `gerarHTMLStatusPausa()` está sendo chamada
2. Usar `calcularTempoSLAEfetivo()` ao invés de calcular manualmente
3. Confirmar que `tempoTotalEmPausa` está sendo atualizado

---

## 📞 Suporte

**Contato:** [seu-email@exemplo.com]  
**Issues:** Abrir em GitHub com label `feature:sla-pause`  
**Documentação:** https://github.com/clinicasyuna/yuna/wiki/SLA-Pause

---

**Versão:** 1.0  
**Última Atualização:** 08 de maio de 2026  
**Responsável:** Desenvolvimento Yuna Solicite
