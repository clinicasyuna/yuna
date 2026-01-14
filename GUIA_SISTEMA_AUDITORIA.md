# 📊 GUIA DO SISTEMA DE AUDITORIA E MONITORAMENTO - YUNA SOLICITE

**Sistema de Logs e Auditoria v2.0**  
**Data:** 14 de janeiro de 2026  
**Autor:** Samuel dos Reis Lacerda Junior  

---

## 🎯 O QUE É O SISTEMA DE AUDITORIA?

O Sistema de Auditoria é uma ferramenta completa que permite:

- ✅ **Ver quem está online** - Monitoramento em tempo real
- ✅ **Registrar todas as ações** - Login, criação, edição, exclusão, visualização, exportação
- ✅ **Histórico completo** - Tudo o que aconteceu no sistema
- ✅ **Alertas de segurança** - Atividades suspeitas detectadas automaticamente
- ✅ **Relatórios detalhados** - Quem fez o quê, quando e onde

**Acesso:** Apenas administradores (`admin` e `super_admin`) têm acesso completo aos logs.

---

## 🚀 COMO ACESSAR

1. **Fazer login** no painel administrativo: https://clinicasyuna.github.io/yuna/admin/

2. **Clicar no botão "Logs e Auditoria"** no menu lateral (ícone 📋)

3. **Pronto!** O painel de logs será exibido

---

## 👥 USUÁRIOS ONLINE

### O que você vê:

- **Contador em tempo real** - Quantos usuários estão online agora
- **Lista de usuários** - Nome, role, página atual, tempo de sessão
- **Status visual:**
  - 🟢 **Verde** = Online (ativo)
  - 🟡 **Amarelo** = Idle (inativo há 5+ minutos)
  - ⚫ **Cinza** = Offline

### Exemplo:

```
👑 admin@yuna.com.br
   super_admin
   📄 /admin/
   ⏱️ 1h 23min
```

### Atualização:

- **Automática** a cada 30 segundos
- **Tempo real** - Lista atualiza sozinha sem reload

---

## 🔍 FILTROS DE BUSCA

Use os filtros para encontrar logs específicos:

### 1. Filtro por Usuário

**Dropdown com todos os usuários do sistema**

- Mostra: email + role
- Exemplo: `acompanhante@yuna.com.br (acompanhante)`

**Quando usar:**
- "O que o João fez hoje?"
- "Quais ações esse usuário realizou?"

### 2. Filtro por Ação

Tipos de ação:

| Ação | Descrição | Exemplo |
|------|-----------|---------|
| **Login** | Usuário entrou no sistema | Login às 08:30 |
| **Logout** | Usuário saiu do sistema | Logout às 17:45 |
| **Criar** | Criou novo registro | Nova solicitação #123 |
| **Atualizar** | Modificou registro existente | Status: pendente → finalizada |
| **Deletar** | Removeu registro | Deletou usuário X |
| **Visualizar** | Acessou página/relatório | Abriu dashboard |
| **Exportar** | Baixou relatório Excel | Exportou 50 solicitações |

**Quando usar:**
- "Quem deletou algo recentemente?"
- "Quantos logins tivemos hoje?"

### 3. Filtro por Recurso

Recursos monitorados:

| Recurso | O que é |
|---------|---------|
| **solicitacoes** | Solicitações de serviço |
| **usuarios_admin** | Usuários administradores |
| **usuarios_equipe** | Usuários da equipe |
| **usuarios_acompanhantes** | Acompanhantes cadastrados |
| **dashboard** | Acesso ao painel principal |
| **relatorios** | Geração de relatórios |

**Quando usar:**
- "Quem mexeu nas solicitações?"
- "Quais mudanças aconteceram nos usuários?"

### 4. Filtro por Data

**Data Início + Data Fim** = Período específico

**Exemplos:**
- Hoje: Início = hoje, Fim = hoje
- Última semana: Início = há 7 dias, Fim = hoje
- Mês de janeiro: Início = 01/01, Fim = 31/01

### 5. Botões de Ação

- **🔍 Buscar** - Aplica os filtros e busca logs
- **❌ Limpar** - Remove todos os filtros e limpa resultados

---

## 📋 TABELA DE LOGS

### Colunas:

| Coluna | Informação |
|--------|------------|
| **Data/Hora** | Quando aconteceu (formato: DD/MM/AAAA HH:MM:SS) |
| **Usuário** | Email do usuário que fez a ação |
| **Role** | Papel do usuário (admin, equipe, acompanhante) |
| **Ação** | O que foi feito (com ícone) |
| **Recurso** | Onde foi feito |
| **Detalhes** | Informações extras (ID, campos alterados, erros) |
| **Status** | ✅ Sucesso / ❌ Erro |

### Exemplo de Log:

```
Data/Hora: 14/01/2026 15:30:22
Usuário: admin@yuna.com.br
Role: super_admin
Ação: ✏️ update
Recurso: solicitacoes
Detalhes: ID: 12345678...
          Campos: status, prioridade
Status: ✅
```

**Interpretação:** O super admin `admin@yuna.com.br` atualizou a solicitação #12345678, modificando os campos `status` e `prioridade` com sucesso às 15:30.

---

## 🚨 ALERTAS DE SEGURANÇA

### O que são?

Alertas automáticos de atividades suspeitas ou fora do padrão.

### Tipos de Alerta:

#### 1. 🚨 MÚLTIPLAS FALHAS DE LOGIN (Severidade: ALTA)

**Quando aparece:** 3 ou mais tentativas falhas de login

**Exemplo:**
```
🚨 MULTIPLAS FALHAS LOGIN
Usuário: teste@yuna.com.br
Detalhes: 5 tentativas falhas de login
Quando: 14/01/2026 03:15:22
```

**O que fazer:**
- Verificar se é o próprio usuário esquecendo a senha
- Se suspeito, desativar conta temporariamente
- Investigar se é tentativa de invasão

#### 2. ⚠️ AÇÃO FORA DO HORÁRIO (Severidade: MÉDIA)

**Quando aparece:** Ação de `delete` entre 00h-06h

**Exemplo:**
```
⚠️ ACAO FORA HORARIO
Usuário: admin@yuna.com.br
Detalhes: Ação de delete às 2h
Quando: 14/01/2026 02:00:00
```

**O que fazer:**
- Verificar se era realmente necessário deletar nesse horário
- Confirmar com o usuário se foi ele mesmo
- Revisar o que foi deletado

#### 3. ⚠️ AÇÕES EM CASCATA (Severidade: MÉDIA)

**Quando aparece:** Mais de 10 ações da mesma tipo em menos de 1 minuto

**Exemplo:**
```
⚠️ ACOES EM CASCATA
Usuário: admin@yuna.com.br
Detalhes: 15 ações de delete em 45s
Quando: 14/01/2026 10:30:00
```

**O que fazer:**
- Verificar se é uma limpeza intencional de dados
- Confirmar se não houve erro ou script automatizado
- Revisar o que foi deletado em massa

---

## 📊 EXPORTAÇÃO DE LOGS

**Status:** Em desenvolvimento

**Planejamento:**
- Exportar logs filtrados para Excel
- Relatórios prontos para auditoria
- Compartilhamento fácil de histórico

**Botão:** "📤 Exportar Excel" (em breve funcional)

---

## 🛠️ CASOS DE USO PRÁTICOS

### Caso 1: Investigar Mudança em Solicitação

**Cenário:** Uma solicitação mudou de status mas ninguém sabe quem fez.

**Passos:**
1. Abrir "Logs e Auditoria"
2. Filtro por Recurso: `solicitacoes`
3. Filtro por Ação: `update`
4. Filtro por Data: período suspeito
5. Clicar "Buscar"
6. Na tabela, procurar o ID da solicitação nos "Detalhes"
7. Ver quem fez, quando, e quais campos foram alterados

### Caso 2: Ver Atividade de um Usuário Específico

**Cenário:** Preciso saber tudo que um usuário fez hoje.

**Passos:**
1. Abrir "Logs e Auditoria"
2. Filtro por Usuário: selecionar usuário desejado
3. Filtro por Data Início: hoje
4. Filtro por Data Fim: hoje
5. Clicar "Buscar"
6. Ver todas as ações do usuário na tabela

### Caso 3: Verificar Tentativas de Login Suspeitas

**Cenário:** Suspeito que alguém está tentando invadir uma conta.

**Passos:**
1. Abrir "Logs e Auditoria"
2. Verificar seção "Alertas de Segurança" (aparece automaticamente se houver alertas)
3. Procurar alertas de "MULTIPLAS FALHAS LOGIN"
4. Ver usuário e horário das tentativas
5. Tomar ação (desativar conta, resetar senha, etc.)

### Caso 4: Monitorar Quem Está Online

**Cenário:** Quero saber quem está trabalhando agora.

**Passos:**
1. Abrir "Logs e Auditoria"
2. Olhar seção "Usuários Online" no topo
3. Ver contador e lista em tempo real
4. Observar status (online, idle, offline)
5. Ver há quanto tempo cada um está logado

### Caso 5: Auditoria Completa Mensal

**Cenário:** Preciso gerar relatório de atividades do mês.

**Passos:**
1. Abrir "Logs e Auditoria"
2. Filtro por Data Início: 01/01/2026
3. Filtro por Data Fim: 31/01/2026
4. Não selecionar usuário, ação ou recurso (para ver tudo)
5. Clicar "Buscar"
6. [Quando disponível] Clicar "Exportar Excel"
7. Salvar relatório para auditoria

---

## ⚙️ CONFIGURAÇÕES DO SISTEMA

### Parâmetros (em `audit-system.js`):

```javascript
OFFLINE_TIMEOUT: 5 * 60 * 1000          // 5 minutos = offline
PRESENCE_UPDATE_INTERVAL: 30 * 1000     // Atualizar status a cada 30s
LOG_RETENTION_DAYS: 90                  // Manter logs por 90 dias
```

### Limites:

- **Logs por busca:** 200 registros
- **Retenção:** 90 dias (depois são automaticamente removidos)
- **Atualização presença:** A cada 30 segundos
- **Timeout inatividade:** 5 minutos

### Indexação Firestore:

Para performance, os logs são indexados por:
- `userId` (quem fez)
- `action` (tipo de ação)
- `resource` (onde foi feito)
- `timestamp` (quando aconteceu)

---

## 🔒 SEGURANÇA E PRIVACIDADE

### Quem vê os logs?

- ✅ **Super Admin** - Vê tudo
- ✅ **Admin** - Vê tudo
- ❌ **Equipe** - Não vê logs
- ❌ **Acompanhante** - Não vê logs

### Logs são imutáveis

- ❌ **Não podem ser editados** após criação
- ❌ **Não podem ser deletados** manualmente
- ✅ **Apenas removidos automaticamente** após 90 dias

### Informações registradas:

**Por ação:**
- Quem fez (usuário, email, role)
- O que fez (ação, recurso, ID)
- Quando fez (data/hora precisa)
- Onde fez (página)
- Detalhes técnicos (IP, navegador)

**Não registramos:**
- ❌ Senhas
- ❌ Dados sensíveis de pacientes
- ❌ Informações médicas

---

## 📈 ESTATÍSTICAS E RELATÓRIOS

### Estatísticas Disponíveis (via código):

```javascript
// Relatório de usuário específico
const relatorio = await window.gerarRelatorioUsuario(
    userId,
    new Date('2026-01-01'),
    new Date('2026-01-31')
);

// Retorna:
{
    totalAcoes: 150,
    acoesPorTipo: {
        login: 20,
        create: 50,
        update: 70,
        delete: 10
    },
    acoesPorRecurso: {
        solicitacoes: 100,
        usuarios: 50
    },
    logs: [...]
}
```

### Histórico de Recurso:

```javascript
// Ver todas as mudanças de uma solicitação específica
const historico = await window.buscarHistoricoRecurso('solicitacoes', 'DOC_ID');

// Retorna array com:
// - Quem alterou
// - Quando alterou
// - O que estava antes
// - O que ficou depois
// - Quais campos mudaram
```

---

## 🐛 TROUBLESHOOTING

### Problema 1: "Logs não aparecem"

**Possíveis causas:**
1. Nenhum log corresponde aos filtros aplicados
2. Data início/fim incorretas
3. Usuário selecionado não fez nenhuma ação

**Solução:**
- Clicar em "Limpar" e buscar sem filtros
- Verificar se as datas estão corretas
- Testar com filtro de usuário diferente

### Problema 2: "Usuários online não atualiza"

**Possíveis causas:**
1. Conexão com Firestore perdida
2. Navegador bloqueou listener em tempo real

**Solução:**
- Recarregar página (F5)
- Verificar console do navegador (F12) por erros
- Verificar conexão com internet

### Problema 3: "Alertas não aparecem"

**Possíveis causas:**
1. Não há atividades suspeitas nas últimas 24h
2. Erro ao buscar logs

**Solução:**
- Verificar console (F12) por erros
- Aguardar algumas horas e verificar novamente
- Se persistir, reportar ao desenvolvedor

### Problema 4: "Sistema lento ao buscar logs"

**Possíveis causas:**
1. Muitos logs no período selecionado
2. Conexão lenta

**Solução:**
- Reduzir período de busca (ex: 1 semana em vez de 1 mês)
- Adicionar mais filtros (usuário, ação, recurso)
- Limitar a 200 registros (já está limitado automaticamente)

---

## 📞 SUPORTE

**Problemas técnicos:**
- Verificar console do navegador (F12)
- Procurar mensagens de erro
- Reportar ao desenvolvedor com print screen

**Dúvidas de uso:**
- Consultar este guia
- Testar com filtros diferentes
- Explorar a interface livremente (não há risco de dano)

---

## 📚 GLOSSÁRIO

| Termo | Significado |
|-------|-------------|
| **Ação** | Operação realizada (login, create, update, delete, etc.) |
| **Recurso** | Entidade afetada (solicitacoes, usuarios, dashboard, etc.) |
| **Auditoria** | Registro e análise de todas as ações do sistema |
| **Log** | Registro individual de uma ação |
| **Presença** | Status de conexão de um usuário (online, idle, offline) |
| **Sessão** | Período de tempo entre login e logout |
| **Timestamp** | Data e hora exata de um evento |
| **UID** | Identificador único do usuário (User ID) |
| **Role** | Papel/permissão do usuário (admin, equipe, acompanhante) |
| **Idle** | Inativo (sem atividade há 5+ minutos) |
| **TTL** | Time To Live (tempo de vida de um registro) |

---

## ✅ CHECKLIST DE USO

**Rotina Diária:**
- [ ] Verificar usuários online ao início do dia
- [ ] Ver se há alertas de segurança
- [ ] Revisar ações do dia anterior

**Rotina Semanal:**
- [ ] Gerar relatório da semana
- [ ] Investigar alertas acumulados
- [ ] Verificar padrões de uso

**Rotina Mensal:**
- [ ] Auditoria completa do mês
- [ ] Exportar logs para arquivo
- [ ] Revisar atividades suspeitas
- [ ] Limpar logs antigos (automático, apenas verificar)

**Em Caso de Incidente:**
- [ ] Abrir "Logs e Auditoria" imediatamente
- [ ] Filtrar por período suspeito
- [ ] Identificar usuário e ação
- [ ] Documentar com prints
- [ ] Tomar ação corretiva
- [ ] Reportar ao responsável

---

**GUIA PREPARADO EM:** 14 de janeiro de 2026  
**VERSÃO DO SISTEMA:** 2.0  
**ÚLTIMA ATUALIZAÇÃO:** 14/01/2026  

**Sistema operacional e pronto para uso! 🚀**
