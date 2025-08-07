'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserDailyWallet = sequelize.define('UserDailyWallet', {
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    wallet_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    daily_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    starting_balance: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    total_in: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    total_out: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    ending_balance: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'userdailywallets',
    underscored: true,
    timestamps: true,
  });

//   UserDailyWallet.associate = function(models) {
    // UserDailyWallet.belongsTo(models.Wallet, {
    //   foreignKey: 'wallet_id',
    //   as: 'wallet',
    //    constraints: false
    // });
//   };

  return UserDailyWallet;
};
