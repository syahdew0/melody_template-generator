module.exports = (sequelize, DataTypes) => {
  const MLMPosition = sequelize.define('MLMPosition', {
    MLMPositionID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MLMPositionName: DataTypes.STRING,
    Value: DataTypes.DOUBLE,
  }, { tableName: 'mlmpositions', timestamps: false });

  MLMPosition.associate = (models) => {
    MLMPosition.hasMany(models.MLMTypeDetail, { foreignKey: 'MLMPositionID' });
  };

  return MLMPosition;
};
