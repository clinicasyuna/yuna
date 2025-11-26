const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RH Plus API',
      version: '1.0.0',
      description: 'API completa para sistema de gestão de recursos humanos',
      contact: {
        name: 'Equipe RH Plus',
        email: 'suporte@rhplus.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Mensagem de erro',
            },
            error: {
              type: 'string',
              example: 'Detalhes do erro',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
            },
            active: {
              type: 'boolean',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Employee: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
            },
            employee_id: {
              type: 'string',
            },
            full_name: {
              type: 'string',
            },
            cpf: {
              type: 'string',
            },
            birth_date: {
              type: 'string',
              format: 'date',
            },
            hire_date: {
              type: 'string',
              format: 'date',
            },
            position: {
              type: 'string',
            },
            department: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'VACATION', 'MEDICAL_LEAVE'],
            },
          },
        },
        LeaveRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            employee_id: {
              type: 'string',
              format: 'uuid',
            },
            type: {
              type: 'string',
              enum: ['VACATION', 'SICK_LEAVE', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'OTHER'],
            },
            start_date: {
              type: 'string',
              format: 'date',
            },
            end_date: {
              type: 'string',
              format: 'date',
            },
            days_requested: {
              type: 'integer',
            },
            reason: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'DENIED', 'CANCELLED'],
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Caminho para os arquivos de rota
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;