# 🏥 YUNA - Sistema de Solicitações

Sistema de gerenciamento de solicitações para clínicas YUNA com duas interfaces:
- **Portal dos Acompanhantes** - PWA para solicitações de serviços
- **Painel Administrativo** - Dashboard para equipe e administradores

## 📱 Progressive Web App (PWA)

O portal dos acompanhantes é uma PWA completa que pode ser instalada como app nativo:

### Como instalar no celular:

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