module.exports = (sequelize, DataTypes) => {
  const TransactionType = sequelize.define('TransactionType', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING }
  }, {
    tableName: 'transactiontypes',
    timestamps: false
  });
 TransactionType.associate = (models) => {
    TransactionType.hasMany(models.WalletSummary, { foreignKey: 'TransactionTypeID', as: 'summaries' });
  };
  
  return TransactionType;
};
