// models/mlmtype.js
module.exports = (sequelize, DataTypes) => {
  const MLMType = sequelize.define('MLMType', {
    MLMTypeID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MLMTypeName: { type: DataTypes.STRING(100), allowNull: false },
    IsActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'mlmtypes',
    timestamps: false,
  });

  MLMType.associate = (models) => {
    MLMType.hasMany(models.MLMTypeDetail, {
      foreignKey: 'MLMTypeID',
      as: 'details'
    });
  };

  return MLMType;
};
