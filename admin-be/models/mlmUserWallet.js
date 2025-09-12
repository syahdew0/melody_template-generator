// models/MlmUserWallet.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const MlmUserWallet = sequelize.define(
    'MlmUserWallet',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      wallet_type_id: { type: DataTypes.INTEGER, allowNull: false },
      balance: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 }
    },
    {
      tableName: 'mlm_user_wallets',
      underscored: true
    }
  );

  MlmUserWallet.associate = (models) => {
    MlmUserWallet.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    MlmUserWallet.belongsTo(models.WalletType, { foreignKey: 'wallet_type_id' });
  };

  return MlmUserWallet;
};
