'use strict';
module.exports = (sequelize, DataTypes) => {
  const WalletSummary = sequelize.define('WalletSummary', {
    summary_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    wallet_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    transaction_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'wallet_summaries',
    timestamps: false,
  });

  return WalletSummary;
};
