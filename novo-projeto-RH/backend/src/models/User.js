const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'),
      allowNull: false,
      defaultValue: 'EMPLOYEE',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
    },
    password_reset_token: {
      type: DataTypes.STRING,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
    },
    two_factor_secret: {
      type: DataTypes.STRING,
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    email_verification_token: {
      type: DataTypes.STRING,
    },
    profile_picture: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'users',
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['role'] },
      { fields: ['active'] },
      { fields: ['password_reset_token'] },
      { fields: ['email_verification_token'] },
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  });

  // Instance methods
  User.prototype.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.password_reset_token;
    delete values.two_factor_secret;
    delete values.email_verification_token;
    return values;
  };

  User.associate = (models) => {
    User.hasOne(models.Employee, {
      foreignKey: 'user_id',
      as: 'employee',
    });

    User.hasMany(models.AuditLog, {
      foreignKey: 'user_id',
      as: 'audit_logs',
    });

    User.hasMany(models.Notification, {
      foreignKey: 'user_id',
      as: 'notifications',
    });
  };

  return User;
};