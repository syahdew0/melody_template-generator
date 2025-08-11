'use strict';
module.exports = (sequelize, DataTypes) => {
  const Withdraw = sequelize.define('Withdraw', {
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
    reference_id: {
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
    tableName: 'withdraws',
    timestamps: false
  });

    Withdraw.associate = function (models) {
    Withdraw.belongsTo(models.Customer, {
      foreignKey: 'username',
      targetKey: 'username',
      as: 'customer'
    });

    Withdraw.belongsTo(models.WalletHistory, {
      foreignKey: 'walletid',
      as: 'wallethistory'
    });
  };


  return Withdraw;
};
