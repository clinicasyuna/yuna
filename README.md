# 🏥 YUNA - Sistema de Solicitações para Clínicas

[![Deploy Status](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://yuna-healthcare-system.vercel.app)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple?logo=pwa)](https://yuna-healthcare-system.vercel.app/acompanhantes)

Sistema completo de gerenciamento de solicitações para clínicas YUNA.

## 🌐 **Acesso Online**
- 🏠 **Homepage:** [yuna-healthcare-system.vercel.app](https://yuna-healthcare-system.vercel.app)
- 📱 **Portal Acompanhantes:** [/acompanhantes](https://yuna-healthcare-system.vercel.app/acompanhantes)
- 👨‍💼 **Painel Admin:** [/admin](https://yuna-healthcare-system.vercel.app/admin)

## 📱 **App Mobile (PWA)**

### Como instalar
**Android:** Chrome → "Instalar App"
**iOS:** Safari → Compartilhar → "Adicionar à Tela de Início"

**Android:**
1. Acesse a URL no Chrome
2. Toque em "Instalar App" ou Menu → "Instalar App"

**iOS:**
1. Acesse a URL no Safari
2. Toque em Compartilhar → "Adicionar à Tela de Início"

## 🚀 Deploy Gratuito no Vercel

### Pré-requisitos:
- Conta no [Vercel](https://vercel.com) (gratuita)
- Conta no [GitHub](https://github.com) (gratuita)

### Passos para deploy:

1. **Subir código para GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Sistema YUNA inicial"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/yuna-app.git
   git push -u origin main
   ```

2. **Deploy no Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Conecte com GitHub
   - Selecione seu repositório
   - Deploy automático!

3. **URL final:** `https://yuna-app-SEU-USUARIO.vercel.app`

### Estrutura do projeto:
```
/
├── admin/                  # Painel administrativo
│   ├── index.html         # Dashboard principal
│   ├── admin-panel.js     # Lógica do admin
│   └── ...
├── acompanhantes/         # Portal PWA
│   ├── index.html         # Interface principal
│   ├── manifest.json      # Configuração PWA
│   ├── service-worker.js  # Cache offline
│   └── ...
├── vercel.json           # Configuração de deploy
└── README.md             # Este arquivo
```

## 🔧 Configuração Firebase

Certifique-se de configurar as regras do Firebase para aceitar requisições do novo domínio Vercel.

## 📧 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.