// models/walletType.js
module.exports = (sequelize, DataTypes) => {
  const WalletType = sequelize.define("WalletType", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  }, {
    tableName: "wallet_types",
    timestamps: false,
  });

  WalletType.associate = (models) => {
    WalletType.hasMany(models.WalletHistory, {
      foreignKey: "wallet_type_id",
      as: "histories",
      constraints: false,
    });
  };

  return WalletType;
};
