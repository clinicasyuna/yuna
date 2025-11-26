const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payslip = sequelize.define('Payslip', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reference_month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    reference_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    base_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    worked_hours: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0,
    },
    overtime_hours: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0,
    },
    overtime_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    bonuses: {
      type: DataTypes.JSONB,
    },
    total_bonuses: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    deductions: {
      type: DataTypes.JSONB,
    },
    total_deductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    inss_contribution: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    irrf_tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    fgts_contribution: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    vacation_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    vacation_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    thirteenth_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    gross_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    net_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'GENERATED', 'APPROVED', 'PAID'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    generated_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approved_by: {
      type: DataTypes.UUID,
    },
    approved_at: {
      type: DataTypes.DATE,
    },
    paid_at: {
      type: DataTypes.DATE,
    },
    file_path: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'payslips',
    indexes: [
      { fields: ['employee_id'] },
      { fields: ['reference_month', 'reference_year'] },
      { fields: ['employee_id', 'reference_month', 'reference_year'], unique: true },
      { fields: ['status'] },
      { fields: ['generated_by'] },
      { fields: ['approved_by'] },
      { fields: ['created_at'] },
    ],
  });

  Payslip.associate = (models) => {
    Payslip.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    Payslip.belongsTo(models.User, {
      foreignKey: 'generated_by',
      as: 'generator',
    });

    Payslip.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver',
    });
  };

  return Payslip;
};