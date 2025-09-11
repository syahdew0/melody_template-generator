module.exports = (sequelize, DataTypes) => {
  const MLMPackageRandom = sequelize.define('MLMPackageRandom', {
    MLMPackageRandomID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MLMPackageID: DataTypes.INTEGER,
    Level: DataTypes.INTEGER,
    Percentage: DataTypes.DOUBLE,
  }, { tableName: 'mlmpackagerandoms', timestamps: false });

  MLMPackageRandom.associate = (models) => {
     MLMPackageRandom.belongsTo(models.MLMPackage, { foreignKey: 'MLMPackageID', as: 'package' });
  };

  return MLMPackageRandom;
};
