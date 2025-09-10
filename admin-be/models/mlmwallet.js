// models/mlmwallet.js
module.exports = (sequelize, DataTypes) => {
  const MLMWallet = sequelize.define('MLMWallet', {
    MLMWalletID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    WalletTypeID: { type: DataTypes.INTEGER, allowNull: false },
    Percentage: { type: DataTypes.DOUBLE, allowNull: false },
  }, {
    tableName: 'mlmwallets',
    timestamps: false,
  });

  // Asosiasi bisa ditambahkan jika ada tabel WalletType
  // MLMWallet.associate = (models) => {
  //   MLMWallet.belongsTo(models.WalletType, { foreignKey: 'WalletTypeID' });
  // };

  return MLMWallet;
};
