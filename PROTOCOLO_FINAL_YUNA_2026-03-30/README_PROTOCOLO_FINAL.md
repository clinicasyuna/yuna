# PROTOCOLO FINAL - YUNA v2.0

Pasta de fechamento para envio/protocolo do registro.

## Estrutura

- 01_FORMULARIOS: formulario oficial vigente e declaracoes assinadas
- 02_DOCUMENTOS_IDENTIFICACAO: documentos do titular
- 03_CODIGO_E_HASHES: zip do codigo e hashes
- 04_DOCUMENTACAO_TECNICA: documentacao e checklists de suporte
- 05_INTERFACES_E_DIAGRAMAS: interfaces e diagramas finais
- 06_COMPROVANTES_E_PROTOCOLO: comprovantes de taxa e comprovante de protocolo

## Itens ainda esperados para fechamento

- 01_FORMULARIOS/Formulario_Oficial_Vigente_Assinado.pdf
- 06_COMPROVANTES_E_PROTOCOLO/Comprovante_Pagamento_Taxa.pdf
- 06_COMPROVANTES_E_PROTOCOLO/Comprovante_Protocolo_Oficial.pdf
- 05_INTERFACES_E_DIAGRAMAS/YUNA_v2.0_Interfaces_Screenshots.pdf
- 05_INTERFACES_E_DIAGRAMAS/YUNA_v2.0_Diagramas_Arquitetura.pdf

## Validacao final

Executar o script:

powershell
.\scripts\validar_protocolo_final.ps1 -ProtocolFolder .\PROTOCOLO_FINAL_YUNA_2026-03-30

O script gera:

- PROTOCOLO_FINAL_YUNA_2026-03-30/VALIDACAO_FINAL_RELATORIO.md
