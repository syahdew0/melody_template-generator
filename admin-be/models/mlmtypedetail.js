// models/mlmtypedetail.js
module.exports = (sequelize, DataTypes) => {
  const MLMTypeDetail = sequelize.define('MLMTypeDetail', {
    MLMTypeDetailID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MLMTypeID: { type: DataTypes.INTEGER, allowNull: false },
    MLMPositionID: { type: DataTypes.INTEGER, allowNull: false },
    Value: { type: DataTypes.DOUBLE, allowNull: false },
  }, {
    tableName: 'mlmtypedetails',
    timestamps: false,
  });

  MLMTypeDetail.associate = (models) => {
    MLMTypeDetail.belongsTo(models.MLMType, {
      foreignKey: 'MLMTypeID',
      as: 'type'
    });
    MLMTypeDetail.belongsTo(models.MLMPosition, {
      foreignKey: 'MLMPositionID',
      as: 'position'
    });
  };

  return MLMTypeDetail;
};
