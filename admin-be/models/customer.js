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

  }, {
    underscored: true,
    tableName: 'Customers'
  });

  Customer.associate = function(models) {
  Customer.hasMany(models.Topup, { foreignKey: 'username', as: 'topups' });
  Customer.hasMany(models.Withdraw, { foreignKey: 'username', as: 'withdraws' });
  Customer.hasMany(models.Adjust, { foreignKey: 'username', as: 'adjusts' });
};


  return Customer;
};
