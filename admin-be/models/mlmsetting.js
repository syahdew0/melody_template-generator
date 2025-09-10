'use strict';
module.exports = (sequelize, DataTypes) => {
  const MLMSetting = sequelize.define('MLMSetting', {
    MLMSettingID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MaxHariTransaksi: DataTypes.INTEGER,
    MaxIklanPerHari: DataTypes.INTEGER,
    AutoApprove: DataTypes.BOOLEAN,
    SamePackage: DataTypes.BOOLEAN,
    AutoHold: DataTypes.BOOLEAN,
    MaxChild: DataTypes.INTEGER,
    Positions: DataTypes.JSON,
    Wallets: DataTypes.JSON,
    CreatedOn: DataTypes.DATE,
    CreatedBy: DataTypes.STRING,
    UpdatedOn: DataTypes.DATE,
    UpdatedBy: DataTypes.STRING,
  }, {
    tableName: 'mlmsettings',
    timestamps: false,
  });

  return MLMSetting;
};
