module.exports = (sequelize, DataTypes) => {
  const WalletSummary = sequelize.define('WalletSummary', {
    WalletSummaryID: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    SummaryDate: DataTypes.DATE,
    WalletID: DataTypes.INTEGER,
    UserName: DataTypes.STRING,
    TransactionTypeID: DataTypes.INTEGER,
    Amount: DataTypes.DOUBLE
  }, {
    tableName: 'walletsummary',
    timestamps: false
  });

   WalletSummary.associate = (models) => {
    WalletSummary.belongsTo(models.Wallet, { foreignKey: 'wallet_id', as: 'wallet' });
    WalletSummary.belongsTo(models.TransactionType, { foreignKey: 'TransactionTypeID', as: 'transaction_type' });
  };
  
  return WalletSummary;
};
