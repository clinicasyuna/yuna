const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MedicalCertificate = sequelize.define('MedicalCertificate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    certificate_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    doctor_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    doctor_crm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diagnosis: {
      type: DataTypes.STRING,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    days_off: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING,
    },
    file_name: {
      type: DataTypes.STRING,
    },
    file_size: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'DENIED', 'EXPIRED'),
      allowNull: false,
      defaultValue: 'PENDING',
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
    notes: {
      type: DataTypes.TEXT,
    },
    is_inss: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    inss_protocol: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'medical_certificates',
    indexes: [
      { fields: ['employee_id'] },
      { fields: ['certificate_number'] },
      { fields: ['status'] },
      { fields: ['start_date'] },
      { fields: ['end_date'] },
      { fields: ['approved_by'] },
      { fields: ['doctor_crm'] },
    ],
  });

  MedicalCertificate.associate = (models) => {
    MedicalCertificate.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    MedicalCertificate.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver',
    });
  };

  return MedicalCertificate;
};