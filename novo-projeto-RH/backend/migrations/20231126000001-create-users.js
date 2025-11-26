'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'),
        allowNull: false,
        defaultValue: 'EMPLOYEE',
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      last_login: {
        type: Sequelize.DATE,
      },
      password_reset_token: {
        type: Sequelize.STRING,
      },
      password_reset_expires: {
        type: Sequelize.DATE,
      },
      two_factor_secret: {
        type: Sequelize.STRING,
      },
      two_factor_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      email_verification_token: {
        type: Sequelize.STRING,
      },
      profile_picture: {
        type: Sequelize.STRING,
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

    // Add indexes
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};