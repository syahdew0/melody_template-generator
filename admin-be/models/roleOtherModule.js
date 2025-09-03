'use strict';
module.exports = (sequelize, DataTypes) => {
  const RoleOtherModule = sequelize.define('RoleOtherModule', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    RoleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    ModuleName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: 'RoleOtherModules',
    underscored: false,
  });

  RoleOtherModule.associate = (models) => {

    RoleOtherModule.belongsTo(models.Role, { foreignKey: 'RoleId', as: 'role' });
  };

  return RoleOtherModule;
};
