# Plano de Go-Live Seguro (Semana que vem)

## Objetivo
Garantir evolucao do sistema com risco baixo, rollback rapido e validacao objetiva.

## Escopo
- Painel Admin: https://clinicasyuna.github.io/yuna/admin/?v=20260114-2130
- Portal Acompanhantes: https://clinicasyuna.github.io/yuna/acompanhantes/

## Regras Operacionais
1. Nenhuma alteracao direta na branch main.
2. Toda alteracao entra por branch de feature.
3. Merge em main somente apos checklist de validacao.
4. Sempre criar snapshot antes de deploy.

## Fases do Processo

### Fase 1 - Snapshot do estado estavel
1. Atualizar branch local:
   - `git checkout main`
   - `git pull origin main`
2. Criar branch de backup:
   - `git checkout -b backup/producao-estavel-YYYYMMDD`
   - `git push -u origin backup/producao-estavel-YYYYMMDD`
3. Criar tag imutavel:
   - `git checkout main`
   - `git tag release-producao-estavel-YYYYMMDD`
   - `git push origin release-producao-estavel-YYYYMMDD`

### Fase 2 - Implementacao controlada
1. Criar branch de trabalho:
   - `git checkout -b feat/nome-da-melhoria`
2. Implementar e validar localmente.
3. Abrir PR para main com checklist preenchido.

### Fase 3 - Validacao pre deploy
1. Validar autenticao admin.
2. Validar criacao de solicitacao no portal acompanhante.
3. Validar exibicao no admin.
4. Validar mudanca de status.
5. Validar finalizacao.

### Fase 4 - Deploy e smoke test
1. Publicar alteracoes.
2. Executar script de validacao pos deploy.
3. Registrar resultado em log de mudanca.

### Fase 5 - Criterio de rollback
Acionar rollback imediatamente se ocorrer qualquer item abaixo:
1. Falha de login em admin.
2. Solicitacoes nao aparecem no admin.
3. Erro JS bloqueando operacao critica.
4. Tela em branco em admin ou acompanhantes.

## Resultado esperado
Com este fluxo, qualquer falha pode ser revertida para o ponto aprovado em poucos minutos.
