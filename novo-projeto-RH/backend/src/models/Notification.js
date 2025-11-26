const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'INFO',
        'WARNING',
        'ERROR',
        'SUCCESS',
        'LEAVE_REQUEST',
        'LEAVE_APPROVED',
        'LEAVE_DENIED',
        'MEDICAL_CERTIFICATE',
        'PAYSLIP',
        'BIRTHDAY',
        'SYSTEM'
      ),
      allowNull: false,
      defaultValue: 'INFO',
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT'),
      allowNull: false,
      defaultValue: 'NORMAL',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
    },
    action_url: {
      type: DataTypes.STRING,
    },
    action_text: {
      type: DataTypes.STRING,
    },
    data: {
      type: DataTypes.JSONB,
    },
    expires_at: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'notifications',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['is_read'] },
      { fields: ['type'] },
      { fields: ['priority'] },
      { fields: ['created_at'] },
      { fields: ['expires_at'] },
    ],
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return Notification;
};