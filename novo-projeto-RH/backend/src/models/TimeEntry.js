const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TimeEntry = sequelize.define('TimeEntry', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clock_in: {
      type: DataTypes.TIME,
    },
    clock_out: {
      type: DataTypes.TIME,
    },
    lunch_break_start: {
      type: DataTypes.TIME,
    },
    lunch_break_end: {
      type: DataTypes.TIME,
    },
    total_hours: {
      type: DataTypes.DECIMAL(4, 2),
    },
    overtime_hours: {
      type: DataTypes.DECIMAL(4, 2),
      defaultValue: 0,
    },
    break_hours: {
      type: DataTypes.DECIMAL(4, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'HOLIDAY', 'VACATION'),
      allowNull: false,
      defaultValue: 'PRESENT',
    },
    ip_address: {
      type: DataTypes.INET,
    },
    location: {
      type: DataTypes.JSONB,
    },
    device_info: {
      type: DataTypes.JSONB,
    },
    approved_by: {
      type: DataTypes.UUID,
    },
    approved_at: {
      type: DataTypes.DATE,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    adjustments: {
      type: DataTypes.JSONB,
    },
    is_manual_entry: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    manual_entry_reason: {
      type: DataTypes.STRING,
    },
    photo_clock_in: {
      type: DataTypes.STRING,
    },
    photo_clock_out: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'time_entries',
    indexes: [
      { fields: ['employee_id'] },
      { fields: ['date'] },
      { fields: ['employee_id', 'date'], unique: true },
      { fields: ['status'] },
      { fields: ['approved_by'] },
      { fields: ['is_manual_entry'] },
    ],
  });

  TimeEntry.associate = (models) => {
    TimeEntry.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    TimeEntry.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver',
    });
  };

  return TimeEntry;
};