'use strict';
module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define('Module', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('main', 'other'),
      defaultValue: 'main',
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'Modules',
    underscored: false,
  });

  Module.associate = (models) => {
    Module.hasMany(models.RoleActiveModule, { foreignKey: 'ModuleId', as: 'roleActiveModules' });
  };

  return Module;
};
