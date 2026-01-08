# 🔐 Atualizar Senhas Diretamente (Sem Emails)

## 🎯 Para Quê?

Para emails fictícios (que não recebem mensagens), precisamos atualizar as senhas **diretamente no Firebase Authentication**, sem enviar emails.

## ⚡ Como Fazer

### Passo 1: Obter a Chave de Serviço do Firebase

1. Acesse: https://console.firebase.google.com
2. Selecione o projeto: **studio-5526632052-23813**
3. Vá para: **⚙️ Configurações do Projeto** (canto superior esquerdo)
4. Selecione a aba: **Contas de Serviço**
5. Clique em: **Gerar nova chave privada**
6. Salve o arquivo JSON em:
   ```
   e:\APP\deploy\firebase-service-account.json
   ```

### Passo 2: Instalar Dependências (Primeira Vez)

```powershell
cd e:\APP\deploy
npm install firebase-admin
```

### Passo 3: Executar o Script

```powershell
cd e:\APP\deploy
node scripts\atualizar-senhas-direto.js
```

### Passo 4: Confirmar

O script vai pedir confirmação:
```
⚠️  ATENÇÃO: Este script vai atualizar as senhas DIRETAMENTE.
Não serão enviados emails.
Digite "confirmo" para prosseguir: _
```

Digite: `confirmo` e pressione ENTER

## ✅ Resultado Esperado

```
╔══════════════════════════════════════════════════════════╗
║  ✅ CONCLUÍDO! (7 sucessos, 0 falhas)                    ║
╚══════════════════════════════════════════════════════════╝

🎉 TODAS AS SENHAS FORAM ATUALIZADAS COM SUCESSO!

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

✨ Os usuários já podem fazer login com as novas senhas!
```

## 🔍 O Que Este Script Faz

1. **Conecta** ao Firebase usando a chave de serviço
2. **Encontra** cada usuário pelo email
3. **Atualiza** a senha diretamente no Firebase Authentication
4. **Não envia** emails (para não gerar erros em caixas fictícias)
5. **Marca** como email verificado automaticamente

## ⚙️ Diferenças Entre as Abordagens

| Abordagem | Vantagem | Desvantagem |
|-----------|----------|------------|
| **Email Reset** | Não requer chave de serviço | Requer email real |
| **Atualizar Direto** ← AQUI | Funciona com emails fictícios | Requer chave de serviço |
| **Recrear Usuários** | Limpa tudo | Deleta usuários antigos |

## 🆘 Troubleshooting

### "firebase-service-account.json not found"

✅ Solução:
- Certifique-se de que salvou em: `e:\APP\deploy\firebase-service-account.json`
- Verifique o caminho (não coloque em scripts/)

### "Cannot find module 'firebase-admin'"

✅ Solução:
```powershell
cd e:\APP\deploy
npm install firebase-admin
```

### "User not found"

✅ Solução:
- Verifique se o email está correto
- Verifique se o usuário existe no Firebase

### "Permission denied"

✅ Solução:
- Regenere a chave de serviço
- Certifique-se de que tem permissões no Firebase Console

## 🔐 Segurança

⚠️ **IMPORTANTE:**

1. O arquivo `firebase-service-account.json` contém credenciais sensíveis
2. **NUNCA** commit este arquivo ao GitHub
3. **NUNCA** compartilhe este arquivo
4. Se expor acidentalmente, regenere a chave no Firebase Console

## 🎯 Próximo Passo

**Está pronto? Execute:**

```powershell
cd e:\APP\deploy
node scripts\atualizar-senhas-direto.js
```

Se não tiver a chave de serviço ainda, siga o Passo 1 acima primeiro!

---

**Data**: Dezembro 2025  
**Sistema**: YUNA  
**Versão**: 1.0
