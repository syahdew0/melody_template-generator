'use strict';
module.exports = (sequelize, DataTypes) => {
  const WalletHistory = sequelize.define('WalletHistory', {
    walletId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    transaction_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    wallet_type: {
      type: DataTypes.ENUM('saldo', 'point', 'stamp'),
      allowNull: false,
      defaultValue: 'saldo'
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    balance_before: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    balance_after: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      allowNull: false,
      defaultValue: 'success'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'wallet_histories',
    timestamps: false
  });

  WalletHistory.associate = function(models) {
    WalletHistory.belongsTo(models.Wallet, {
      foreignKey: 'walletId',
      targetKey: 'id',
      constraints: false
    });

    WalletHistory.belongsTo(models.TransactionType, {
      foreignKey: 'transaction_type_id',
      targetKey: 'id',
       as: 'transaction_type_data',
      constraints: false
    });
  };

  return WalletHistory;
};
