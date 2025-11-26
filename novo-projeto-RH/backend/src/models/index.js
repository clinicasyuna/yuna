const { Sequelize } = require('sequelize');
const config = require('../config/database');
const sequelize = new Sequelize(config);

// Import models
const User = require('./User')(sequelize);
const Employee = require('./Employee')(sequelize);
const MedicalCertificate = require('./MedicalCertificate')(sequelize);
const LeaveRequest = require('./LeaveRequest')(sequelize);
const TimeEntry = require('./TimeEntry')(sequelize);
const Payslip = require('./Payslip')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);
const Notification = require('./Notification')(sequelize);

// Store models
const models = {
  User,
  Employee,
  MedicalCertificate,
  LeaveRequest,
  TimeEntry,
  Payslip,
  AuditLog,
  Notification,
};

// Apply associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};