'use strict';
module.exports = (sequelize, DataTypes) => {
  const MLMPackageMatching = sequelize.define('MLMPackageMatching', {
    MLMPackageMatchingID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MLMPackageID: DataTypes.INTEGER,
    Level: DataTypes.INTEGER,
    Percentage: DataTypes.DOUBLE,
  }, { tableName: 'mlmpackagematchings', timestamps: false });

  MLMPackageMatching.associate = (models) => {
    MLMPackageMatching.belongsTo(models.MLMPackage, { foreignKey: 'MLMPackageID' });
  };

  return MLMPackageMatching;
};
