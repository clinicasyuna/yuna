# 📖 MANUAL DO USUÁRIO - YUNA SOLICITE V2.0

**Sistema de Gerenciamento de Solicitações de Serviços Hospitalares**

---

## 📋 INFORMAÇÕES DO SISTEMA

**Sistema:** YUNA v2.0  
**Desenvolvedor:** Samuel dos Reis Lacerda Junior  
**Cliente:** Clínicas YUNA  
**Data:** Janeiro 2026  
**Suporte:** ti@yuna.com.br | +55 11 94586-4671

---

# 📑 ÍNDICE

1. [Introdução](#1-introdução)
2. [Requisitos do Sistema](#2-requisitos-do-sistema)
3. [Como Acessar](#3-como-acessar)
4. [Portal dos Acompanhantes](#4-portal-dos-acompanhantes)
5. [Painel Administrativo](#5-painel-administrativo)
6. [Perguntas Frequentes](#6-perguntas-frequentes)
7. [Solução de Problemas](#7-solução-de-problemas)
8. [Contato e Suporte](#8-contato-e-suporte)

---

## 1. INTRODUÇÃO

### O que é o Yuna Solicite?

O Yuna Solicite é uma plataforma moderna e intuitiva que facilita a comunicação entre **acompanhantes de pacientes** e as **equipes de serviços** da clínica (Manutenção, Nutrição, Higienização e Hotelaria).

### Para quem é este sistema?

- **👥 Acompanhantes:** Familiares que acompanham pacientes internados
- **👨‍💼 Equipes de Serviço:** Profissionais de Manutenção, Nutrição, Higienização e Hotelaria
- **👑 Administradores:** Gestores que supervisionam todas as operações
- **🔑 Super Administradores:** Controle total do sistema

### Principais benefícios:

✅ **Rapidez:** Solicitações chegam instantaneamente às equipes  
✅ **Organização:** Tudo fica registrado e organizado  
✅ **Transparência:** Acompanhe o status em tempo real  
✅ **Facilidade:** Interface simples e intuitiva  
✅ **Avaliação:** Sistema de feedback para melhoria contínua

---

## 2. REQUISITOS DO SISTEMA

### Dispositivos Compatíveis:

✅ **Computadores:**
- Windows 10 ou superior
- macOS 10.14 ou superior
- Linux (qualquer distribuição moderna)

✅ **Tablets:**
- iPad (iOS 12 ou superior)
- Tablets Android (versão 8 ou superior)

✅ **Smartphones:**
- iPhone (iOS 12 ou superior)
- Android (versão 8 ou superior)

### Navegadores Recomendados:

- ✅ Google Chrome (versão 90+) - **RECOMENDADO**
- ✅ Microsoft Edge (versão 90+)
- ✅ Firefox (versão 88+)
- ✅ Safari (versão 14+)

### Conexão com Internet:

- Mínimo: 2 Mbps
- Recomendado: 10 Mbps ou superior
- Funciona offline após primeiro acesso (PWA)

---

## 3. COMO ACESSAR

### 🌐 Endereço do Portal:

**Portal dos Acompanhantes:**
```
https://clinicasyuna.github.io/yuna/acompanhantes/
```

**Painel Administrativo:**
```
https://clinicasyuna.github.io/yuna/admin/
```

### 🔐 Como fazer o primeiro acesso:

#### Acompanhantes:
1. O administrador criará seu usuário
2. Você receberá email e senha temporária
3. Acesse o portal e faça login
4. Na primeira vez, você criará sua senha definitiva

#### Equipes e Administradores:
1. Receba suas credenciais do administrador
2. Acesse o painel administrativo
3. Faça login com email e senha fornecidos

### 📱 Instalar como Aplicativo (PWA):

#### No Celular Android:
1. Abra o sistema no Chrome
2. Toque nos 3 pontinhos (⋮) no canto superior
3. Selecione "Adicionar à tela inicial"
4. Confirme

#### No iPhone:
1. Abra o sistema no Safari
2. Toque no ícone de compartilhar (□↑)
3. Selecione "Adicionar à Tela de Início"
4. Confirme

#### No Computador:
1. Abra o sistema no Chrome
2. Clique no ícone ⊕ na barra de endereços
3. Clique em "Instalar"

---

## 4. PORTAL DOS ACOMPANHANTES

### 4.1 Fazendo Login

1. Acesse o portal dos acompanhantes
2. Digite seu **email** e **senha**
3. Clique em **"Entrar"**

**Primeira vez?** O sistema pedirá para criar uma nova senha.

---

### 4.2 Tela Principal (Dashboard)

Após o login, você verá **4 cards coloridos**:

```
┌─────────────┬─────────────┐
│ 🟡 PENDENTE │ 🔵 ANDAMENTO│
│   [número]  │   [número]  │
├─────────────┼─────────────┤
│🟢 FINALIZADA│ 🔴 CANCELADA│
│   [número]  │   [número]  │
└─────────────┴─────────────┘
```

- **Amarelo (Pendente):** Solicitações aguardando atendimento
- **Azul (Em Andamento):** Equipe já está atendendo
- **Verde (Finalizada):** Serviço concluído
- **Vermelho (Cancelada):** Solicitação cancelada

**👆 Clique em qualquer card** para ver as solicitações daquele status!

---

### 4.3 Criar Nova Solicitação

#### Passo 1: Escolher o Tipo de Serviço

Role a tela e verá **4 cards de serviços**:

**🔧 Manutenção**
- Problemas elétricos
- Ar condicionado
- Encanamento
- Móveis quebrados

**🍽️ Nutrição**
- Pedidos de refeições
- Restrições alimentares
- Horários especiais
- Dúvidas sobre cardápio

**🧽 Higienização**
- Limpeza do quarto
- Troca de roupas de cama
- Reposição de materiais
- Limpeza urgente

**🏨 Hotelaria**
- Informações gerais
- Objetos perdidos
- Amenities
- Acomodações

**👆 Clique no card do serviço desejado!**

---

#### Passo 2: Preencher o Formulário

Um formulário aparecerá com os campos:

**1. Tipo de Serviço** (já preenchido)
- Não precisa mudar

**2. Prioridade** ⭐
- **Baixa:** Sem urgência, quando possível
- **Média:** Normal, atender no dia
- **Alta:** Urgente, precisa resolver logo
- **Urgente:** MUITO urgente, emergência!

**3. Descrição** 📝
- Explique o que você precisa
- Seja claro e específico
- Exemplo: "Ar condicionado do quarto 205 não está gelando"

**4. Horário Preferencial** ⏰ (opcional)
- Se tiver preferência de horário, informe aqui
- Exemplo: "Prefiro entre 14h e 16h"

---

#### Passo 3: Enviar

1. Revise as informações
2. Clique no botão **"Enviar Solicitação"**
3. Aguarde a confirmação ✅
4. Pronto! A equipe receberá instantaneamente

---

### 4.4 Acompanhar Solicitações

Para ver o status das suas solicitações:

1. Clique nos **cards coloridos** no topo
2. Ou role até a seção **"Minhas Solicitações"**
3. Cada solicitação mostra:
   - 🆔 Número da solicitação
   - 🏷️ Tipo de serviço
   - 📅 Data e hora da criação
   - ⏱️ Tempo decorrido
   - 🚦 Status atual
   - ⭐ Prioridade

---

### 4.5 Avaliar Serviço Prestado

Após a equipe **finalizar** seu atendimento, você poderá avaliar:

#### Quando avaliar?
- Um aviso aparecerá automaticamente
- Você tem **7 dias** para avaliar
- É rápido e ajuda muito! 🙏

#### Como avaliar?

**1. Nota Geral** ⭐⭐⭐⭐⭐
- Clique nas estrelas (1 a 5)
- 5 estrelas = Excelente!

**2. Aspectos Específicos**
Avalie de 1 a 5:
- ⚡ **Rapidez:** Atenderam rápido?
- ✨ **Qualidade:** Serviço bem feito?
- 😊 **Atendimento:** Foram educados?

**3. Comentários** 💬 (opcional)
- Elogios são bem-vindos!
- Sugestões de melhoria
- Críticas construtivas

**4. Recomendaria?** 👍👎
- Sim ou Não

**5. Enviar**
- Clique em "Enviar Avaliação"
- Pronto! Obrigado pelo feedback 🙏

---

### 4.6 Logout (Sair)

Para sair do sistema:

1. Clique no ícone de **usuário** no canto superior direito
2. Selecione **"Sair"**
3. Ou clique no botão **"Logout"**

**⚠️ Importante:** Por segurança, o sistema desconecta automaticamente após **10 minutos de inatividade**.

---

## 5. PAINEL ADMINISTRATIVO

*Seção para Equipes, Admins e Super Admins*

### 5.1 Fazendo Login como Admin

1. Acesse o painel administrativo
2. Digite seu **email** e **senha**
3. Clique em **"Entrar"**

---

### 5.2 Dashboard Administrativo

O painel é dividido por **departamentos**:

```
┌─────────────────────────────────┐
│     🔧 MANUTENÇÃO               │
│  [Cards de solicitações]        │
├─────────────────────────────────┤
│     🍽️ NUTRIÇÃO                 │
│  [Cards de solicitações]        │
├─────────────────────────────────┤
│     🧽 HIGIENIZAÇÃO             │
│  [Cards de solicitações]        │
├─────────────────────────────────┤
│     🏨 HOTELARIA                │
│  [Cards de solicitações]        │
└─────────────────────────────────┘
```

**Equipes:** Veem apenas seu departamento  
**Admins/Super Admins:** Veem todos os departamentos

---

### 5.3 Atender uma Solicitação

#### Passo 1: Clicar no Card

Clique no card da solicitação que deseja atender.

#### Passo 2: Ver Detalhes

Um modal aparecerá com:
- 📋 Descrição completa
- 👤 Dados do solicitante
- 🏠 Número do quarto
- ⏰ Horário preferencial
- 📝 Histórico de atualizações

#### Passo 3: Atualizar Status

**Botões disponíveis:**

🔵 **"Iniciar Atendimento"**
- Clica quando começar a atender
- Muda status para "Em Andamento"
- Acompanhante é notificado

✅ **"Finalizar"**
- Clica quando concluir o serviço
- Muda status para "Finalizada"
- Acompanhante pode avaliar

❌ **"Cancelar"**
- Se não puder atender
- Informe o motivo no campo de observações

---

### 5.4 Gerenciar Usuários

*Apenas para Admins e Super Admins*

#### Ver Lista de Usuários:

1. Clique em **"Usuários"** no menu
2. Escolha o tipo:
   - 👥 Acompanhantes
   - 👨‍💼 Equipes
   - 👑 Administradores

#### Criar Novo Usuário:

1. Clique em **"+ Novo Usuário"**
2. Preencha:
   - Nome completo
   - Email
   - Tipo de usuário
   - Departamento (se equipe)
   - Número do quarto (se acompanhante)
3. Clique em **"Criar"**
4. Sistema gera senha temporária automaticamente

#### Editar Usuário:

1. Clique no ícone **✏️ Editar**
2. Modifique os dados necessários
3. Clique em **"Salvar"**

#### Desativar Usuário:

1. Clique no ícone **🗑️ Desativar**
2. Confirme a ação
3. Usuário não poderá mais fazer login

---

### 5.5 Relatórios e Métricas

*Apenas para Admins e Super Admins*

#### Acessar Relatórios:

1. Clique em **"Relatórios"** no menu
2. Escolha o período:
   - Hoje
   - Últimos 7 dias
   - Último mês
   - Personalizado

#### Métricas Disponíveis:

📊 **Volume de Solicitações**
- Total por departamento
- Por status
- Por prioridade

⏱️ **Tempo Médio de Atendimento**
- Por departamento
- Por tipo de solicitação

⭐ **Satisfação**
- Nota média geral
- Por departamento
- Por equipe
- Evolução temporal

#### Dashboard de Satisfação:

*Nova funcionalidade para análise detalhada de avaliações*

1. Clique em **"⭐ Pesquisa de Satisfação"** no menu
2. Visualize métricas agregadas:
   - Média geral de satisfação
   - Total de avaliações recebidas
   - Percentual de satisfação positiva (4-5 estrelas)
   - Melhor equipe avaliada
   - Estatísticas por equipe (média, total de avaliações)

📊 **Exportar Relatório em Excel:**
1. No Dashboard de Satisfação, clique em **"📄 Exportar Relatório (Excel)"**
2. O arquivo será baixado automaticamente com 2 abas:
   - **Avaliações:** Lista detalhada (data, equipe, quarto, nota, aspectos, comentários)
   - **Resumo por Equipe:** Estatísticas consolidadas

🔍 **Filtrar Avaliações:**
1. Clique em **"🔍 Filtrar Resultados"**
2. Escolha os critérios:
   - Equipe específica ou todas
   - Nota mínima (1-5 estrelas)
   - Período (7/30/90 dias ou todo período)
3. Clique em **"Aplicar Filtros"**

📋 **Aspectos Avaliados:**
- Rapidez do atendimento
- Qualidade do serviço
- Atendimento da equipe
- Comentários adicionais dos acompanhantes
- Recomendação do serviço (Sim/Não)

#### Exportar Dados (Geral):

1. Configure os filtros desejados
2. Clique em **"Exportar Excel"**
3. Arquivo será baixado automaticamente

---

### 5.6 Configurações de Perfil

Para alterar seus dados:

1. Clique no **ícone de usuário** no topo
2. Selecione **"Perfil"**
3. Altere:
   - Nome
   - Email
   - Senha
4. Clique em **"Salvar"**

---

### 5.7 Logout Seguro

**⚠️ IMPORTANTE:** Sempre faça logout ao terminar!

1. Clique no ícone de **usuário**
2. Selecione **"Sair"**

**Timeout Automático:** 10 minutos de inatividade

---

## 6. PERGUNTAS FREQUENTES (FAQ)

### ❓ Esqueci minha senha, o que faço?

**Acompanhantes:**
1. Clique em "Esqueci a senha" na tela de login
2. Digite seu email
3. Você receberá um link para redefinir

**Equipes/Admins:**
1. Entre em contato com o administrador
2. Ele pode redefinir sua senha

---

### ❓ Posso criar solicitação por telefone?

Não. O sistema é digital para garantir registro e rastreamento. Em emergências, ligue na recepção.

---

### ❓ Quanto tempo demora para ser atendido?

Depende da **prioridade**:
- **Urgente:** Até 30 minutos
- **Alta:** Até 2 horas
- **Média:** No mesmo dia
- **Baixa:** Até 24 horas

*Tempos estimados, podem variar conforme demanda*

---

### ❓ Posso cancelar uma solicitação?

Sim, enquanto estiver **Pendente**:
1. Clique no card da solicitação
2. Clique em "Cancelar"
3. Informe o motivo

---

### ❓ A avaliação é obrigatória?

Não, mas é **muito importante**! Sua avaliação ajuda a melhorar os serviços.

---

### ❓ Posso usar sem internet?

Sim, **após o primeiro acesso**! O sistema funciona offline como PWA. As solicitações ficam na fila e são enviadas quando reconectar.

---

### ❓ Como sei se minha solicitação foi vista?

Você verá a mudança de status:
- **Pendente** → **Em Andamento** = Equipe começou a atender

Notificações aparecem automaticamente!

---

### ❓ Posso ver solicitações antigas?

Sim! Role até a seção "Minhas Solicitações" ou filtre por status "Finalizada".

---

## 7. SOLUÇÃO DE PROBLEMAS

### 🐛 Problemas Comuns e Soluções

#### ❌ "Não consigo fazer login"

**Soluções:**
1. Verifique se email e senha estão corretos
2. Certifique-se que não há espaços extras
3. Verifique sua conexão com internet
4. Limpe o cache do navegador:
   - Chrome: Ctrl+Shift+Del
   - Selecione "Cookies" e "Cache"
   - Confirme
5. Tente outro navegador

---

#### ❌ "A tela está carregando infinitamente"

**Soluções:**
1. Verifique sua conexão com internet
2. Recarregue a página (F5 ou Ctrl+R)
3. Limpe o cache do navegador
4. Feche e abra o navegador novamente

---

#### ❌ "Não recebo notificações"

**Soluções:**
1. Verifique se permitiu notificações:
   - Chrome: Ícone 🔒 na barra de endereços
   - Clique em "Notificações" → Permitir
2. Verifique configurações do navegador
3. No celular, verifique configurações do sistema

---

#### ❌ "Meu navegador está lento"

**Soluções:**
1. Feche abas não utilizadas
2. Limpe o cache
3. Atualize o navegador para última versão
4. Verifique se há atualizações do sistema operacional

---

#### ❌ "Não consigo enviar solicitação"

**Soluções:**
1. Verifique se preencheu todos os campos obrigatórios
2. Verifique sua conexão com internet
3. Tente novamente em alguns segundos
4. Se persistir, entre em contato com suporte

---

#### ❌ "O sistema desconectou sozinho"

**Isso é normal!** Por segurança, após **10 minutos sem uso**, o sistema faz logout automático. Basta fazer login novamente.

---

### 🔧 Quando Chamar o Suporte?

Entre em contato se:
- ❌ Não conseguir fazer login após múltiplas tentativas
- ❌ Solicitação não chegar à equipe após 30 minutos
- ❌ Sistema apresentar erros constantes
- ❌ Dados desatualizados ou incorretos
- ❌ Problemas que não estão listados acima

---

## 8. CONTATO E SUPORTE

### 📞 Informações de Contato

**Suporte Técnico:**
- 📧 Email: ti@yuna.com.br
- ☎️ Telefone: +55 11 94586-4671
- ⏰ Horário: Segunda a Sexta, 8h às 18h

**Desenvolvedor:**
- Samuel dos Reis Lacerda Junior
- CNPJ: 55.004.442 SAMUEL DOS REIS LACERDA JUNIOR

**Endereço:**
- Rua Eugene Carrieri nº17 Bloco C AP 81
- São Paulo - SP
- CEP: 05541-100

---

### 📝 Ao Entrar em Contato, Informe:

1. **Nome completo** e **tipo de usuário** (Acompanhante/Equipe/Admin)
2. **Descrição do problema** (seja específico)
3. **O que você estava fazendo** quando o erro ocorreu
4. **Prints da tela** (se possível)
5. **Navegador e dispositivo** que está usando

**Exemplo:**
```
Nome: João Silva
Tipo: Acompanhante
Problema: Não consigo avaliar a solicitação #1234
Estava: Tentando dar 5 estrelas após finalização
Navegador: Chrome versão 120 no iPhone 12
```

---

### 🕐 Tempo de Resposta

- **Urgente:** Até 2 horas (horário comercial)
- **Normal:** Até 24 horas
- **Dúvidas:** Até 48 horas

---

## 📄 TERMOS DE USO E PRIVACIDADE

### Seus Dados Estão Seguros 🔒

✅ Não compartilhamos seus dados com terceiros  
✅ Criptografia em todas as transmissões (HTTPS)  
✅ Backup automático diário  
✅ Conforme LGPD (Lei Geral de Proteção de Dados)

### Responsabilidades do Usuário

Você deve:
- ✅ Manter sua senha em segurança
- ✅ Fazer logout ao terminar de usar
- ✅ Não compartilhar sua conta
- ✅ Usar o sistema de forma ética
- ✅ Não criar solicitações falsas

---

## 🎯 DICAS PARA MELHOR EXPERIÊNCIA

### 👍 Boas Práticas

1. **Seja específico nas descrições**
   - ❌ "Tem problema"
   - ✅ "Ar condicionado do quarto 205 não gela"

2. **Use a prioridade correta**
   - Não marque tudo como "Urgente"
   - Reserve para verdadeiras emergências

3. **Avalie sempre que possível**
   - Seu feedback é valioso!
   - Ajuda a melhorar o serviço

4. **Mantenha o app instalado (PWA)**
   - Acesso mais rápido
   - Notificações instantâneas

5. **Faça logout em computadores compartilhados**
   - Proteja sua privacidade

---

## 📱 RECURSOS EXTRAS

### PWA (Aplicativo Web Progressivo)

O YUNA funciona como um **app nativo**!

**Vantagens:**
- 📱 Ícone na tela inicial
- ⚡ Carregamento ultrarrápido
- 📡 Funciona offline
- 🔔 Notificações push
- 💾 Menos dados móveis

---

### Modo Offline

Após o primeiro acesso, você pode:
- ✅ Ver suas solicitações antigas
- ✅ Criar novas solicitações (ficam na fila)
- ✅ Consultar informações
- ❌ Não verá atualizações de status em tempo real

Ao reconectar, tudo sincroniza automaticamente!

---

## 📊 GLOSSÁRIO DE TERMOS

**Acompanhante:** Familiar que está com o paciente

**Solicitação:** Pedido de serviço feito pelo acompanhante

**Status:** Situação atual da solicitação (Pendente, Em Andamento, etc.)

**Prioridade:** Grau de urgência da solicitação

**Equipe:** Profissionais que atendem as solicitações

**Admin:** Administrador que gerencia o sistema

**PWA:** Progressive Web App (Aplicativo web que funciona como nativo)

**Dashboard:** Painel principal com resumo das informações

**Timeout:** Desconexão automática por inatividade

---

## 🏆 CERTIFICAÇÕES E QUALIDADE

O Yuna Solicite possui:

✅ **Código 100% Original** - 19.825+ linhas proprietárias  
✅ **Segurança SSL/TLS** - Criptografia de ponta  
✅ **Uptime >99.9%** - Alta disponibilidade  
✅ **LGPD Compliance** - Proteção de dados  
✅ **Responsive Design** - Funciona em qualquer tela  
✅ **PWA Certified** - Instalável como app

---

## 📖 SOBRE ESTE MANUAL

**Versão:** 2.0  
**Data:** Janeiro 2026  
**Autor:** Samuel dos Reis Lacerda Junior  
**Última Atualização:** 08/01/2026

---

## 🎉 PRONTO PARA COMEÇAR!

Agora você sabe tudo sobre o Sistema YUNA!

**Acompanhantes:** Comece criando sua primeira solicitação! 🚀  
**Equipes:** Veja as solicitações pendentes e atenda! 💪  
**Admins:** Gerencie tudo de forma eficiente! 📊

**Boa sorte e obrigado por usar o Yuna Solicite!** 🙏

---

**© 2024-2026 Samuel dos Reis Lacerda Junior - Todos os direitos reservados**  
**Yuna Solicite v2.0 - Inovação em Gestão Hospitalar**

---

## 📞 PRECISA DE AJUDA?

**Suporte:** ti@yuna.com.br | +55 11 94586-4671
