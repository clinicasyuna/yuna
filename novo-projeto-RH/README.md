# Sistema RH Plus - Gestão Completa de Recursos Humanos

## Descrição
Sistema completo de gestão de recursos humanos para empresas modernas, incluindo controle de funcionários, atestados médicos, solicitações de férias, ponto eletrônico e folha de pagamento.

## Funcionalidades Principais

### 🔐 Autenticação e Autorização
- Login seguro com JWT
- Controle de acesso por funções (Admin, RH, Manager, Employee)
- Autenticação de dois fatores (2FA)

### 👥 Gestão de Funcionários
- Cadastro completo de funcionários
- Upload de documentos e fotos
- Histórico de cargos e salários
- Controle de dependentes

### 🏥 Atestados Médicos
- Upload e validação de atestados
- Controle de dias de afastamento
- Notificações automáticas

### 🌴 Solicitações de Férias
- Calendário de férias
- Aprovação hierárquica
- Controle de saldos

### ⏰ Ponto Eletrônico
- Registro de entrada/saída
- Relatórios de horas trabalhadas
- Controle de horas extras

### 💰 Folha de Pagamento
- Geração automática de holerites
- Cálculo de impostos e descontos
- Relatórios financeiros

## Stack Tecnológica

### Backend
- **Node.js** + Express.js
- **PostgreSQL** para banco de dados
- **Sequelize** como ORM
- **Redis** para cache e sessões
- **JWT** para autenticação
- **AWS S3** para armazenamento de arquivos
- **Docker** para containerização

### Frontend
- **React 18** + TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilização
- **Zustand** para gerenciamento de estado
- **React Query** para cache de dados
- **React Hook Form** para formulários

### DevOps
- **Docker Compose** para desenvolvimento local
- **GitHub Actions** para CI/CD
- **Nginx** como proxy reverso

## Estrutura do Projeto

```
novo-projeto-RH/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── controllers/    # Controladores
│   │   ├── middleware/     # Middlewares
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços de negócio
│   │   └── utils/          # Utilitários
│   ├── migrations/         # Migrações do banco
│   ├── seeders/           # Seeds do banco
│   └── tests/             # Testes
├── frontend/               # App React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── hooks/         # Hooks customizados
│   │   ├── services/      # Serviços API
│   │   ├── store/         # Estado global
│   │   ├── types/         # Types TypeScript
│   │   └── utils/         # Utilitários
│   └── public/            # Arquivos estáticos
└── docker/                # Configurações Docker
```

## Instalação e Execução

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker (opcional)

### Desenvolvimento Local

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd novo-projeto-RH
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Execute com Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Ou execute manualmente:**

   **Backend:**
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### URLs de Acesso
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api-docs

## Variáveis de Ambiente

### Backend (.env)
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rhplus_dev
DB_USER=postgres
DB_PASS=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=us-east-1

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=RH Plus
```

## Scripts Disponíveis

### Backend
- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Inicia servidor de produção
- `npm test` - Executa testes
- `npm run migrate` - Executa migrações
- `npm run seed` - Executa seeds

### Frontend
- `npm run dev` - Inicia em modo desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run lint` - Executa linting
- `npm test` - Executa testes

## API Endpoints

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Funcionários
- `GET /employees` - Lista funcionários
- `GET /employees/:id` - Busca funcionário
- `POST /employees` - Cria funcionário
- `PUT /employees/:id` - Atualiza funcionário
- `DELETE /employees/:id` - Remove funcionário

### Atestados Médicos
- `GET /medical-certificates` - Lista atestados
- `POST /medical-certificates` - Cria atestado
- `PUT /medical-certificates/:id/approve` - Aprova atestado
- `PUT /medical-certificates/:id/deny` - Nega atestado

### Solicitações de Férias
- `GET /leave-requests` - Lista solicitações
- `POST /leave-requests` - Cria solicitação
- `PUT /leave-requests/:id/approve` - Aprova solicitação
- `PUT /leave-requests/:id/deny` - Nega solicitação

### Ponto Eletrônico
- `GET /time-entries` - Lista registros
- `POST /time-entries/clock-in` - Registra entrada
- `POST /time-entries/clock-out` - Registra saída

### Folha de Pagamento
- `GET /payslips` - Lista holerites
- `GET /payslips/:id` - Busca holerite
- `POST /payslips/generate` - Gera holerites

## Licença
Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## Suporte
Para suporte, envie um email para suporte@rhplus.com ou abra uma issue no GitHub.