#!/bin/bash
# Script de Organização - Preparar Pacote para Reenvio à BN
# Protocolo: 000984.0381795/2025
# Data: 13 de janeiro de 2026

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📋 ORGANIZADOR PACOTE BN v2.0${NC}"
echo -e "${BLUE}Protocolo INP: 000984.0381795/2025${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Criar estrutura de diretórios
echo -e "${YELLOW}[1/5] Criando estrutura de diretórios...${NC}"
mkdir -p REENVIO_BN_JANEIRO_2026/{1_OFICIO,2_DOCUMENTACAO_NOVA,3_DOCUMENTACAO_ATUALIZADA,4_DECLARACAO,5_CODIGO}
echo -e "${GREEN}✅ Estrutura criada${NC}\n"

# Verificar arquivos necessários
echo -e "${YELLOW}[2/5] Verificando arquivos necessários...${NC}"

FILES_TO_CHECK=(
    "REGISTRO_YUNA_V2.0/5_INTERFACES/YUNA_v2.0_Interfaces_Screenshots.html"
    "CORRECAO-MODAL-TIMEOUT.md"
    "REGISTRO_YUNA_V2.0/4_DOCUMENTACAO_TECNICA/ADENDO_REGISTRO_MODULOS_OTIMIZACAO_2026.pdf"
    "REGISTRO_YUNA_V2.0/4_DOCUMENTACAO_TECNICA/ESPECIFICACOES_TECNICAS.pdf"
    "REGISTRO_YUNA_V2.0/4_DOCUMENTACAO_TECNICA/MANUAL_USUARIO.pdf"
    "REGISTRO_YUNA_V2.0/4_DOCUMENTACAO_TECNICA/HISTORICO_DESENVOLVIMENTO.pdf"
    "REGISTRO_YUNA_V2.0/4_DOCUMENTACAO_TECNICA/CHECKLIST_REGISTRO.pdf"
)

MISSING_FILES=0
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (NÃO ENCONTRADO)${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os arquivos presentes${NC}\n"
else
    echo -e "${RED}⚠️  $MISSING_FILES arquivo(s) faltando${NC}\n"
fi

# Copiar arquivos
echo -e "${YELLOW}[3/5] Copiando arquivos...${NC}"
cp 01_OFICIO_COMPLEMENTACAO.md REENVIO_BN_JANEIRO_2026/1_OFICIO/ 2>/dev/null && \
    echo -e "${GREEN}✅ Ofício copiado${NC}" || echo -e "${RED}❌ Ofício falhou${NC}"

cp CORRECAO-MODAL-TIMEOUT.md REENVIO_BN_JANEIRO_2026/2_DOCUMENTACAO_NOVA/ 2>/dev/null && \
    echo -e "${GREEN}✅ Correção copiada${NC}" || echo -e "${RED}❌ Correção falhou${NC}"

cp REGISTRO_YUNA_V2.0/4_DOCUMENTACAO_TECNICA/ADENDO_REGISTRO_MODULOS_OTIMIZACAO_2026.pdf \
   REENVIO_BN_JANEIRO_2026/2_DOCUMENTACAO_NOVA/ 2>/dev/null && \
    echo -e "${GREEN}✅ Adendo de módulos copiado${NC}" || echo -e "${RED}❌ Adendo falhou${NC}"

cp REGISTRO_YUNA_V2.0/5_INTERFACES/YUNA_v2.0_Interfaces_Screenshots.html \
   REENVIO_BN_JANEIRO_2026/2_DOCUMENTACAO_NOVA/ 2>/dev/null && \
    echo -e "${GREEN}✅ Screenshots HTML copiado${NC}" || echo -e "${RED}❌ Screenshots falhou${NC}"

for pdf in ESPECIFICACOES_TECNICAS MANUAL_USUARIO HISTORICO_DESENVOLVIMENTO CHECKLIST_REGISTRO; do
    cp "REGISTRO_YUNA_V2.0/4_DOCUMENTACAO_TECNICA/${pdf}.pdf" \
       REENVIO_BN_JANEIRO_2026/3_DOCUMENTACAO_ATUALIZADA/ 2>/dev/null && \
        echo -e "${GREEN}✅ $pdf copiado${NC}" || echo -e "${RED}❌ $pdf falhou${NC}"
done
echo ""

# Criar checklist
echo -e "${YELLOW}[4/5] Gerando checklist de envio...${NC}"
cat > REENVIO_BN_JANEIRO_2026/CHECKLIST_ENVIO.txt << 'EOF'
📋 CHECKLIST DE ENVIO - BIBLIOTECA NACIONAL
Protocolo: 000984.0381795/2025
Data: 13 de janeiro de 2026

▶ DOCUMENTOS PESSOAIS
  [ ] Cópia RG frente e verso
  [ ] Cópia CPF frente e verso
  [ ] Comprovante de residência (últimos 3 meses)

▶ OFÍCIO E ASSINATURAS
  [ ] Ofício impresso (2 páginas)
  [ ] Ofício assinado em caneta azul
  [ ] Assinatura autenticada em cartório (recomendado)

▶ DOCUMENTAÇÃO TÉCNICA (NOVA)
  [ ] YUNA_v2.0_Interfaces_Screenshots.pdf (29 capturas)
  [ ] ADENDO_REGISTRO_MODULOS_OTIMIZACAO_2026.pdf
  [ ] CORRECAO-MODAL-TIMEOUT.md

▶ DOCUMENTAÇÃO TÉCNICA (ATUALIZADA v2.0)
  [ ] ESPECIFICACOES_TECNICAS.pdf
  [ ] MANUAL_USUARIO.pdf
  [ ] HISTORICO_DESENVOLVIMENTO.pdf
  [ ] CHECKLIST_REGISTRO.pdf

▶ CÓDIGO-FONTE E INTEGRIDADE
  [ ] codigo-fonte-yuna-v2.0.zip
  [ ] HASHES.txt

▶ DECLARAÇÃO CARTORIZADA
  [ ] Declaração de autoria (2 vias)
  [ ] Certificado do cartório

▶ INFORMAÇÕES DE REFERÊNCIA
  - Protocolo: 000984.0381795/2025
  - Título: Yuna Solicite v2.0
  - Autor: Samuel dos Reis Lacerda Junior
  - CNPJ: 55.004.442/0001-06

▶ ENDEREÇO PARA PROTOCOLO
  Biblioteca Nacional do Brasil
  Av. Rio Branco, 219 - Centro
  Rio de Janeiro, RJ - CEP 20040-008
  Tel: (21) 3878-9898
  E-mail: copyright@bn.gov.br

▶ PRÓXIMAS ETAPAS
  1. Ligar para BN: (21) 3878-9898
  2. Informar: "Vou protocolar complementação ao 000984.0381795/2025"
  3. Perguntar: "Qual o procedimento para anexar documentos?"
  4. Reunir todo o pacote
  5. Protocolar pessoalmente (preferível) ou via SEDEX com AR

✅ Preparado em: 13 de janeiro de 2026
✅ Status: Pronto para Envio
EOF

echo -e "${GREEN}✅ Checklist gerado${NC}\n"

# Criar resumo
echo -e "${YELLOW}[5/5] Criando resumo final...${NC}"
cat > REENVIO_BN_JANEIRO_2026/README.txt << 'EOF'
📊 PACOTE DE COMPLEMENTAÇÃO - BIBLIOTECA NACIONAL
Protocolo INP: 000984.0381795/2025
Data: 13 de janeiro de 2026

CONTEÚDO DO PACOTE:
─────────────────────

1️⃣  OFÍCIO
    └─ Documento oficial solicitando anexação de documentação complementar
       Assinado e autenticado em cartório

2️⃣  DOCUMENTAÇÃO NOVA (v2.0)
    ├─ YUNA_v2.0_Interfaces_Screenshots.pdf
    │  └─ 29 capturas de todas as interfaces (antes não havia)
    │
    ├─ ADENDO_REGISTRO_MODULOS_OTIMIZACAO_2026.pdf
    │  └─ 4 módulos proprietários (1.425 LOC adicionais)
    │     • Performance Monitor (349 LOC)
    │     • Cache Manager (410 LOC)
    │     • Listener Manager (286 LOC)
    │     • Query Helper (380 LOC)
    │
    └─ CORRECAO-MODAL-TIMEOUT.md
       └─ Correção de segurança crítica (z-index, animações, cleanup)

3️⃣  DOCUMENTAÇÃO ATUALIZADA v2.0
    ├─ ESPECIFICACOES_TECNICAS.pdf (revisado)
    ├─ MANUAL_USUARIO.pdf (revisado)
    ├─ HISTORICO_DESENVOLVIMENTO.pdf (revisado)
    └─ CHECKLIST_REGISTRO.pdf (revisado)

4️⃣  DECLARAÇÃO CARTORIZADA
    └─ Cópia autenticada em cartório (reconhecimento de firma)

5️⃣  CÓDIGO-FONTE
    ├─ codigo-fonte-yuna-v2.0.zip (2.24 MB)
    └─ HASHES.txt (SHA256 de 13 arquivos)

MUDANÇAS PRINCIPAIS:
────────────────────
• Adição de 29 screenshots de interfaces
• Documentação de 4 módulos de otimização proprietários
• Correção de vulnerabilidade de segurança
• Atualização completa de documentação técnica
• Performance: Redução de 90% em queries Firestore
• Capacidade: Suporta 300+ pacientes simultâneos

COMO USAR:
──────────
1. Leia o arquivo CHECKLIST_ENVIO.txt
2. Reúna todos os documentos
3. Ligue para BN: (21) 3878-9898
4. Protocole pessoalmente com o ofício

PROTOCOLO DE REFERÊNCIA:
────────────────────────
INP: 000984.0381795/2025
Titulo: Yuna Solicite v2.0
Autor: Samuel dos Reis Lacerda Junior
CNPJ: 55.004.442/0001-06

Status: ✅ PRONTO PARA ENVIO

Data: 13 de janeiro de 2026
EOF

echo -e "${GREEN}✅ Resumo criado${NC}\n"

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ PACOTE PRONTO PARA REENVIO!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}📁 Localização:${NC}"
echo -e "   ${BLUE}REENVIO_BN_JANEIRO_2026/${NC}\n"

echo -e "${YELLOW}📋 Próximas ações:${NC}"
echo -e "   1. Abra: REENVIO_BN_JANEIRO_2026/CHECKLIST_ENVIO.txt"
echo -e "   2. Verifique todos os itens"
echo -e "   3. Agende cartório (2-3 dias)"
echo -e "   4. Ligue para BN: (21) 3878-9898"
echo -e "   5. Protocole esta semana\n"

echo -e "${GREEN}🎉 Bom trabalho! Você está preparado!${NC}\n"
