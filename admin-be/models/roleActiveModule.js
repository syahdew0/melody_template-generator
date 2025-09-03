'use strict';
module.exports = (sequelize, DataTypes) => {
  const RoleActiveModule = sequelize.define('RoleActiveModule', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    RoleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    ModuleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    canView: { type: DataTypes.BOOLEAN, defaultValue: false },
    canAdd: { type: DataTypes.BOOLEAN, defaultValue: false },
    canEdit: { type: DataTypes.BOOLEAN, defaultValue: false },
    canDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'RoleActiveModules',
    underscored: false,
  });

 RoleActiveModule.associate = (models) => {
    RoleActiveModule.belongsTo(models.Role, { foreignKey: 'RoleId', as: 'role' });
    RoleActiveModule.belongsTo(models.Module, { foreignKey: 'ModuleId', as: 'Module' }); // <--- tambahkan ini
  };

  return RoleActiveModule;
};
