# 📝 Guia de Execução - Script de Recreação de Usuários

## ⚠️ REQUISITOS IMPORTANTES

### 1. **Firebase Service Account Key**

Este script requer uma chave de serviço do Firebase Admin SDK para funcionar.

#### Como Obter a Chave:

1. Acesse: https://console.firebase.google.com
2. Selecione o projeto: **studio-5526632052-23813**
3. Vá para: **⚙️ Configurações do Projeto** (canto superior esquerdo)
4. Selecione a aba: **Contas de Serviço**
5. Clique em: **Gerar nova chave privada**
6. Salve o arquivo JSON em: `scripts/firebase-service-account.json`

```
e:\APP\deploy\
└── scripts\
    ├── firebase-service-account.json  ← SALVE AQUI!
    └── recriar-usuarios.js
```

### 2. **Node.js Instalado**

Verifique se o Node.js está instalado:

```powershell
node --version
npm --version
```

Se não estiver instalado, baixe em: https://nodejs.org/

## 🚀 PASSO A PASSO

### **Passo 1: Instalar Dependências**

Abra o PowerShell e execute:

```powershell
cd e:\APP\deploy
npm install firebase-admin
```

### **Passo 2: Adicionar a Chave de Serviço**

1. Baixe a chave JSON do Firebase (conforme instruções acima)
2. Crie a pasta `scripts` se não existir:
   ```powershell
   mkdir scripts -Force
   ```
3. Coloque o arquivo JSON em: `scripts/firebase-service-account.json`

### **Passo 3: Executar o Script**

```powershell
cd e:\APP\deploy
node scripts/recriar-usuarios.js
```

### **Passo 4: Confirmar Execução**

O script mostrará um aviso e pedirá confirmação:

```
⚠️  ATENÇÃO: Este script irá deletar e recriar todos os usuários.
Digite "confirmo" para prosseguir: _
```

Digite: `confirmo` e pressione ENTER

## ✅ O QUE O SCRIPT FAZ

Para cada usuário (equipes + administradores):

1. **Deleta** do Firebase Authentication ✓
2. **Deleta** do Firestore ✓
3. **Recria** no Firebase Authentication com nova senha ✓
4. **Recria** no Firestore com dados completos ✓

## 📊 RESULTADO ESPERADO

Após conclusão, você verá:

```
╔══════════════════════════════════════════════════════════╗
║  ✅ TODOS OS USUÁRIOS FORAM RECRIADOS COM SUCESSO!        ║
╚══════════════════════════════════════════════════════════╝

📋 RESUMO DOS LOGINS:

🏢 EQUIPES:
   • Nutricao Jardins: nutricao.jardins@yuna.com.br / Nuti@123456
   • Manutenção Jardins: manutencao.jardins@yuna.com.br / Manu@123456
   • Hotelaria Jardins: hotelaria.jardins@yuna.com.br / Hotel@123456
   • Recepção Jardins: recepcao.jardins@yuna.com.br / Recep@123456

👤 ADMINISTRADORES:
   • Edinar Leão: edinar.leao@yuna.com.br / Edi@123456
   • Amanda Braga: amanda.braga@yuna.com.br / Aman@123456
   • Caroline Chinaglia: caroline.chinaglia@yuna.com.br / Carol@123456
```

## ⚡ EXECUTAR AUTOMATICAMENTE

Se você preferir colocar o script para executar no Windows:

### Opção 1: Arquivo em Lote (.bat)

Crie um arquivo `executar-recreacao.bat` em `e:\APP\deploy\`:

```batch
@echo off
echo Executando script de recreacao de usuarios...
cd /d e:\APP\deploy
node scripts\recriar-usuarios.js
pause
```

Depois é só clicar duas vezes no arquivo.

### Opção 2: PowerShell Script (.ps1)

Crie um arquivo `executar-recreacao.ps1`:

```powershell
cd "e:\APP\deploy"
node scripts\recriar-usuarios.js
Read-Host "Pressione ENTER para fechar"
```

Execute com:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\executar-recreacao.ps1
```

## 🆘 TROUBLESHOOTING

### **Erro: "firebase-service-account.json não encontrado"**

✅ Solução:
- Verifique se a pasta `scripts` existe
- Verifique se o arquivo JSON está em: `scripts/firebase-service-account.json`
- Nome do arquivo deve ser exato (case-sensitive em alguns sistemas)

### **Erro: "PERMISSION_DENIED: Permission denied"**

✅ Solução:
- A chave de serviço pode não ter permissões suficientes
- Gere uma nova chave seguindo os passos acima
- Verifique se o projeto do Firebase está correto

### **Erro: "Cannot find module 'firebase-admin'"**

✅ Solução:
```powershell
cd e:\APP\deploy
npm install firebase-admin
```

### **Usuários não aparecem no painel após recriação**

✅ Solução:
- Faça logout do painel administrativo
- Aguarde alguns segundos
- Acesse novamente

## 📋 ESTRUTURA DE DADOS CRIADA

### Para Equipes (usuarios_equipe):

```json
{
  "uid": "auto-gerado",
  "email": "nutricao.jardins@yuna.com.br",
  "nome": "Nutricao Jardins",
  "departamento": "nutricao",
  "equipe": "nutricao",
  "ativo": true,
  "criadoEm": "timestamp",
  "atualizadoEm": "timestamp",
  "permissoes": {
    "criar_solicitacao": true,
    "visualizar_solicitacao": true,
    "atualizar_solicitacao": true,
    "avaliar_solicitacao": true,
    "exportar_relatorio": true
  }
}
```

### Para Admins (usuarios_admin):

```json
{
  "uid": "auto-gerado",
  "email": "edinar.leao@yuna.com.br",
  "nome": "Edinar Leão",
  "role": "admin",
  "ativo": true,
  "criadoEm": "timestamp",
  "atualizadoEm": "timestamp",
  "permissoes": {
    "criar_usuarios": true,
    "editar_usuarios": true,
    "deletar_usuarios": true,
    "alterar_senhas": true,
    "visualizar_relatorios": true,
    "exportar_relatorios": true,
    "gerenciar_equipes": true,
    "limpar_dados": true
  }
}
```

## ✨ DICAS

- **Backup**: Embora o script delete registros, o Firebase mantém histórico (verificar em Backups)
- **Auditoria**: Cada criação é registrada com `criadoEm` e `atualizadoEm`
- **Repetição**: Você pode rodar o script várias vezes - ele sempre recriar com os dados atuais
- **Segurança**: Nunca compartilhe o arquivo `firebase-service-account.json` em repositórios públicos

## 🔐 SEGURANÇA

⚠️ **IMPORTANTE:**

1. Adicione o arquivo de chave ao `.gitignore`:

```
scripts/firebase-service-account.json
```

2. Nunca commite este arquivo ao GitHub

3. A chave de serviço tem **acesso total ao Firebase** - proteja-a bem!

4. Se precisar revogar acesso, regenere a chave no Firebase Console

## 📞 SUPORTE

Se encontrar problemas:

1. Verifique se todas as dependências estão instaladas
2. Confirme que a chave de serviço é válida
3. Verifique os logs do console (copie e cole os erros)
4. Tente executar em um novo PowerShell (como administrador)

---

**Versão**: 1.0  
**Data**: Dezembro 2025  
**Mantedor**: Sistema YUNA
