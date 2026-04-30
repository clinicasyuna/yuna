# Checklist de Rollback Rapido

## Quando usar
Use este checklist se houver regressao funcional apos deploy.

## Pre-condicoes
1. Tag estavel criada antes do deploy (exemplo: `release-producao-estavel-YYYYMMDD`).
2. Permissao para push na branch main.

## Passo a passo
1. Confirmar incidente:
   - Login admin falhou, ou
   - Solicitacao nao flui entre acompanhantes e admin, ou
   - Erro critico na interface.

2. Parar novas alteracoes:
   - Suspender merges em main ate estabilizar.

3. Executar rollback no git:
   - `git checkout main`
   - `git fetch origin`
   - `git reset --hard release-producao-estavel-YYYYMMDD`
   - `git push --force origin main`

4. Validar links de producao:
   - Admin: https://clinicasyuna.github.io/yuna/admin/?v=20260114-2130
   - Acompanhantes: https://clinicasyuna.github.io/yuna/acompanhantes/

5. Validacao minima apos rollback:
   - Login admin
   - Criar solicitacao no acompanhantes
   - Visualizar no admin
   - Alterar status e finalizar

6. Registrar incidente:
   - Data/hora
   - Commit que causou regressao
   - Acao de rollback executada
   - Resultado final

## Observacao
Se houver mudancas de dados (nao apenas codigo), restaurar tambem backup de dados quando aplicavel.
