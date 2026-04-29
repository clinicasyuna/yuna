# CHECKLIST PRONTO PARA PROTOCOLO FINAL - YUNA v2.0

Data base: 30/03/2026
Objetivo: fechar 100% do pacote para protocolar registro com risco minimo de exigencia.
Escopo legal considerado: Lei 9.610/98 + Lei 9.609/98 + normas/rotinas EDA/FBN vigentes.

## Regra de uso deste checklist

- Marcar cada item apenas com evidencia objetiva anexada no pacote.
- Itens marcados como BLOQUEADOR impedem protocolo ate regularizacao.
- Criterio final de pronto: todos os BLOQUEADORES em SIM.

## Gate 0 - Definicao do rito (BLOQUEADOR)

[ ] 0.1 Definir formalmente o canal principal de registro para programa de computador (Lei 9.609/98).
Evidencia: nota/confirmacao formal do canal adotado.
Status atual: NAO.

[ ] 0.2 Se houver uso paralelo de EDA/FBN, delimitar escopo exato (documentacao, telas, manuais etc.) sem conflito de narrativa.
Evidencia: texto consolidado no pacote com escopo de cada protocolo.
Status atual: NAO.

## Gate 1 - Documentacao pessoal e titularidade (BLOQUEADOR)

[ ] 1.1 Remover 100% dos placeholders em todos os documentos finais ([PREENCHER], [NUMERO], [VALOR], [DATA]).
Evidencia: revisao textual sem placeholders.
Status atual: NAO.

[ ] 1.2 Declaracao de autoria assinada, datada e sem lacunas.
Evidencia: REGISTRO_YUNA_V2.0/1_FORMULARIOS/Declaracao_Autoria_Cartorio_Yuna_Solicite_v2.pdf + versao final sem campos vazios.
Status atual: PARCIAL.

[ ] 1.3 Coerencia entre autor/titular nos documentos (nome, CPF/CNPJ, endereco, contato).
Evidencia: conferencia cruzada nos PDFs finais.
Status atual: PARCIAL.

## Gate 2 - Formularios oficiais e comprovantes (BLOQUEADOR)

[ ] 2.1 Formulario oficial vigente preenchido e assinado (conforme rito escolhido no Gate 0).
Evidencia: PDF do formulario no pacote.
Status atual: NAO.

[ ] 2.2 Comprovante de pagamento da taxa correspondente ao protocolo.
Evidencia: comprovante anexado na pasta de protocolo.
Status atual: NAO.

[ ] 2.3 Documento de identificacao e comprovantes obrigatorios anexados.
Evidencia: PDFs em REGISTRO_YUNA_V2.0/2_DOCUMENTOS_IDENTIFICACAO.
Status atual: SIM (validar atualidade e legibilidade).

## Gate 3 - Integridade tecnica da obra (BLOQUEADOR)

[ ] 3.1 ZIP final congelado da versao a protocolar.
Evidencia: arquivo unico final do codigo e/ou pacote documental final.
Status atual: PARCIAL (existe zip, falta congelamento formal final).

[ ] 3.2 Hash SHA256 do ZIP final registrado no dossie.
Evidencia: linha de hash do ZIP final em HASHES.txt e no checklist final.
Status atual: NAO.

[ ] 3.3 HASHES.txt consistente com os arquivos-chave da versao final.
Evidencia: HASHES.txt atualizado.
Status atual: SIM.

## Gate 4 - Coerencia juridica/documental (BLOQUEADOR)

[ ] 4.1 Remover afirmacoes absolutas sem prova (ex.: "registrado" sem numero de protocolo).
Evidencia: documentos revisados sem alegacoes nao comprovadas.
Status atual: NAO.

[ ] 4.2 Unificar cronologia (criacao, versao, conclusao, assinatura, protocolo) em todo pacote.
Evidencia: datas coerentes entre declaracao, checklist, contrato e readme.
Status atual: NAO.

[ ] 4.3 Contrato/licenca com dados finais ou sinalizado como "modelo" (sem gerar contradicao no dossie).
Evidencia: CONTRATO_LICENCIAMENTO_YUNA.md final.
Status atual: NAO.

## Gate 5 - Midias de apoio e anexos tecnicos

[ ] 5.1 Interfaces e screenshots finais consolidados em PDF.
Evidencia: REGISTRO_YUNA_V2.0/5_INTERFACES/YUNA_v2.0_Interfaces_Screenshots.html + PDF final.
Status atual: PARCIAL.

[ ] 5.2 Diagramas de arquitetura finais exportados e anexados.
Evidencia: pasta REGISTRO_YUNA_V2.0/6_DIAGRAMAS com arquivos finais.
Status atual: PARCIAL.

[ ] 5.3 Manual e documentacao tecnica finais sem divergencia de versao.
Evidencia: PDFs finais em REGISTRO_YUNA_V2.0/PDF_REGISTRO.
Status atual: PARCIAL.

## Gate 6 - Checklist de envio/protocolo

[ ] 6.1 Montar pasta final PROTOCOLO_YYYYMMDD com tudo que sera enviado.
[ ] 6.2 Gerar hash da pasta compactada final.
[ ] 6.3 Conferencia dupla (autor + revisao final).
[ ] 6.4 Protocolo realizado e numero registrado no dossie.
[ ] 6.5 Comprovante de protocolo salvo em pasta de evidencias.

Status atual do Gate 6: NAO.

## Comandos de validacao rapida

Gerar hash do pacote final:

powershell
Get-FileHash -Algorithm SHA256 .\PROTOCOLO_FINAL_YUNA_v2.0.zip

Buscar placeholders remanescentes:

powershell
rg -n "\[PREENCHER|\[NUMERO|\[NÚMERO|\[VALOR|\[DATA" .

## Resultado final (Go/No-Go)

- BLOQUEADORES resolvidos: [ ] SIM [ ] NAO
- Recomendacao de protocolo hoje: [ ] GO [ ] NO-GO

Responsavel pela conferencia final:

Nome:
Data:
Assinatura:
