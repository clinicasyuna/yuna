const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LeaveRequest = sequelize.define('LeaveRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'VACATION',
        'SICK_LEAVE',
        'PERSONAL',
        'MATERNITY',
        'PATERNITY',
        'BEREAVEMENT',
        'MARRIAGE',
        'OTHER'
      ),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    days_requested: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'DENIED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    requested_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approved_by: {
      type: DataTypes.UUID,
    },
    approved_at: {
      type: DataTypes.DATE,
    },
    denial_reason: {
      type: DataTypes.TEXT,
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT'),
      allowNull: false,
      defaultValue: 'NORMAL',
    },
    attachments: {
      type: DataTypes.JSONB,
    },
    backup_employee_id: {
      type: DataTypes.UUID,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    hr_notes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'leave_requests',
    indexes: [
      { fields: ['employee_id'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['start_date'] },
      { fields: ['end_date'] },
      { fields: ['requested_by'] },
      { fields: ['approved_by'] },
      { fields: ['priority'] },
    ],
  });

  LeaveRequest.associate = (models) => {
    LeaveRequest.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    LeaveRequest.belongsTo(models.User, {
      foreignKey: 'requested_by',
      as: 'requester',
    });

    LeaveRequest.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver',
    });

    LeaveRequest.belongsTo(models.Employee, {
      foreignKey: 'backup_employee_id',
      as: 'backup_employee',
    });
  };

  return LeaveRequest;
};