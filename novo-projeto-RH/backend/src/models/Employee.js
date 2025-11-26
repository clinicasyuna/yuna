const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    employee_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true,
      validate: {
        len: [11, 11],
      },
    },
    rg: {
      type: DataTypes.STRING,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    },
    marital_status: {
      type: DataTypes.ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER'),
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.JSONB,
    },
    emergency_contact: {
      type: DataTypes.JSONB,
    },
    hire_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    termination_date: {
      type: DataTypes.DATEONLY,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    manager_id: {
      type: DataTypes.UUID,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    salary_type: {
      type: DataTypes.ENUM('HOURLY', 'MONTHLY', 'ANNUAL'),
      allowNull: false,
      defaultValue: 'MONTHLY',
    },
    work_schedule: {
      type: DataTypes.JSONB,
    },
    vacation_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    vacation_days_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'VACATION', 'MEDICAL_LEAVE', 'TERMINATED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    bank_info: {
      type: DataTypes.JSONB,
    },
    documents: {
      type: DataTypes.JSONB,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'employees',
    indexes: [
      { fields: ['user_id'], unique: true },
      { fields: ['employee_id'], unique: true },
      { fields: ['cpf'], unique: true },
      { fields: ['full_name'] },
      { fields: ['department'] },
      { fields: ['position'] },
      { fields: ['manager_id'] },
      { fields: ['status'] },
      { fields: ['hire_date'] },
    ],
  });

  Employee.associate = (models) => {
    Employee.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    Employee.belongsTo(models.Employee, {
      foreignKey: 'manager_id',
      as: 'manager',
    });

    Employee.hasMany(models.Employee, {
      foreignKey: 'manager_id',
      as: 'subordinates',
    });

    Employee.hasMany(models.MedicalCertificate, {
      foreignKey: 'employee_id',
      as: 'medical_certificates',
    });

    Employee.hasMany(models.LeaveRequest, {
      foreignKey: 'employee_id',
      as: 'leave_requests',
    });

    Employee.hasMany(models.TimeEntry, {
      foreignKey: 'employee_id',
      as: 'time_entries',
    });

    Employee.hasMany(models.Payslip, {
      foreignKey: 'employee_id',
      as: 'payslips',
    });
  };

  return Employee;
};