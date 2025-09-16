// models/walletHistory.js
module.exports = (sequelize, DataTypes) => {
  const WalletHistory = sequelize.define("WalletHistory", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // walletId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transaction_type_id: {
      type: DataTypes.INTEGER, // contoh: 1=topup, 2=withdraw, 3=adjust
      allowNull: false,
    },
    wallet_type_id: {
      type: DataTypes.INTEGER, // contoh: 1=saldo, 2=point , 3=stamp
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // id dari topup/withdraw/adjust
    },
    balance_before: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    balance_after: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "success", "failed", "canceled"),
      allowNull: false,
      defaultValue: "success",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  }, {
    tableName: "wallet_histories",
    timestamps: false,   
  });

  // models/wallethistory.js
WalletHistory.associate = function(models) {
  WalletHistory.belongsTo(models.TransactionType, {
    as: 'transaction_type_data',
    foreignKey: 'transaction_type_id'
  });

    WalletHistory.belongsTo(models.MlmRegistration, {
      foreignKey: 'reference_id',
       targetKey: 'id',
      as: 'mlm_registration',
    });
};




  return WalletHistory;
};
