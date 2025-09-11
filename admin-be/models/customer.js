'use strict';

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_hp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bank: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_rekening: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_rekening: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referral: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email_verification_code: DataTypes.STRING,
    email_pending: DataTypes.STRING,
    email_verification_expiry: DataTypes.DATE,

    password_reset_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    password_reset_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }

  }, {
    underscored: true,
    tableName: 'Customers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Customer.associate = function(models) {
    Customer.hasMany(models.Topup, { foreignKey: 'username', as: 'topups' });
    Customer.hasMany(models.Withdraw, { foreignKey: 'username', as: 'withdraws' });
    Customer.hasMany(models.Adjust, { foreignKey: 'username', as: 'adjusts' });
    Customer.hasMany(models.MlmRegistration, {foreignKey: 'customer_id',as: 'mlm_registrations',});
  };

  return Customer;
};
