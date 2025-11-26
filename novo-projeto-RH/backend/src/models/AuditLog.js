const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    target_type: {
      type: DataTypes.STRING,
    },
    target_id: {
      type: DataTypes.UUID,
    },
    old_values: {
      type: DataTypes.JSONB,
    },
    new_values: {
      type: DataTypes.JSONB,
    },
    ip_address: {
      type: DataTypes.INET,
    },
    user_agent: {
      type: DataTypes.TEXT,
    },
    meta: {
      type: DataTypes.JSONB,
    },
  }, {
    tableName: 'audit_logs',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['target_type', 'target_id'] },
      { fields: ['created_at'] },
    ],
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return AuditLog;
};