'use strict';
module.exports = (sequelize, DataTypes) => {
  const Topup = sequelize.define('Topup', {
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    walletid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    referenceid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdon: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdby: {
      type: DataTypes.STRING,
      allowNull: false
    },
    updatedon: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedby: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'topups',
    timestamps: false
  });

  return Topup;
};
