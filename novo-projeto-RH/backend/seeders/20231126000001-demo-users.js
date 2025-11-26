'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      {
        id: uuidv4(),
        email: 'admin@rhplus.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'ADMIN',
        active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        email: 'hr@rhplus.com',
        password: await bcrypt.hash('hr123', 12),
        role: 'HR',
        active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        email: 'manager@rhplus.com',
        password: await bcrypt.hash('manager123', 12),
        role: 'MANAGER',
        active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        email: 'employee@rhplus.com',
        password: await bcrypt.hash('employee123', 12),
        role: 'EMPLOYEE',
        active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('users', users);

    // Create employees table first if it doesn't exist
    const tableExists = await queryInterface.tableExists('employees');
    if (!tableExists) {
      await queryInterface.createTable('employees', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        employee_id: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        full_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        cpf: {
          type: Sequelize.STRING(11),
          allowNull: false,
          unique: true,
        },
        birth_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        hire_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        position: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        department: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        salary: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        salary_type: {
          type: Sequelize.ENUM('HOURLY', 'MONTHLY', 'ANNUAL'),
          allowNull: false,
          defaultValue: 'MONTHLY',
        },
        vacation_days: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 30,
        },
        vacation_days_used: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'VACATION', 'MEDICAL_LEAVE', 'TERMINATED'),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });
    }

    const employees = [
      {
        id: uuidv4(),
        user_id: users[0].id,
        employee_id: 'ADM001',
        full_name: 'Administrador Sistema',
        cpf: '00000000001',
        birth_date: '1980-01-01',
        hire_date: '2023-01-01',
        position: 'Administrador de Sistema',
        department: 'TI',
        salary: 15000.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: users[1].id,
        employee_id: 'HR001',
        full_name: 'Coordenador RH',
        cpf: '00000000002',
        birth_date: '1985-02-15',
        hire_date: '2023-01-15',
        position: 'Coordenador de RH',
        department: 'Recursos Humanos',
        salary: 8000.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: users[2].id,
        employee_id: 'MGR001',
        full_name: 'Gerente Vendas',
        cpf: '00000000003',
        birth_date: '1982-05-20',
        hire_date: '2023-02-01',
        position: 'Gerente de Vendas',
        department: 'Vendas',
        salary: 10000.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: users[3].id,
        employee_id: 'EMP001',
        full_name: 'Funcionário Exemplo',
        cpf: '00000000004',
        birth_date: '1990-08-10',
        hire_date: '2023-03-01',
        position: 'Analista',
        department: 'Vendas',
        salary: 5000.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('employees', employees);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('employees', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};