'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const StartingBalance = sequelize.define('StartingBalance', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    wallet_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'starting_balances',
    timestamps: false
  });

  StartingBalance.associate = function(models) {
    // Kaitkan ke User via username
    StartingBalance.belongsTo(models.User, { foreignKey: 'username', targetKey: 'username', as: 'user' });
  };

  return StartingBalance;
};
