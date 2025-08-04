'use strict';
module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    wallet_type: {
      type: DataTypes.ENUM('saldo', 'poin', 'stamp'),
      allowNull: false,
      defaultValue: 'saldo'
    },
    createdon: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedon: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'wallets',
    timestamps: false
  });

  // Wallet.associate = function(models) {
  //   Wallet.belongsTo(models.Customer, { foreignKey: 'customer_id' });
  //   Wallet.hasMany(models.WalletHistory, { foreignKey: 'walletId' });
  // };
  Wallet.associate = function(models) {
  Wallet.hasMany(models.WalletHistory, {
    foreignKey: 'walletId',
    sourceKey: 'id',
    constraints: false // Hindari FK constraint
  });
};


  return Wallet;
};
