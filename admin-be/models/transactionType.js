'use strict';
/** @type {import('sequelize').Model} */
module.exports = (sequelize, DataTypes) => {
  const TransactionType = sequelize.define('TransactionType', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'transaction_types',
    underscored: true,
    timestamps: false,
  });

  TransactionType.associate = function(models) {
    // Relasi ke WalletHistory
    TransactionType.hasMany(models.WalletHistory, {
      foreignKey: 'transaction_type_id',
       as: 'wallet_histories',
    });
  };

  return TransactionType;
};
