'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: 'roles',
    underscored: false,
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: 'RoleId', as: 'Users' }); 
    Role.hasMany(models.RoleActiveModule, { foreignKey: 'RoleId', as: 'activeModules' });
    Role.hasMany(models.RoleOtherModule, { foreignKey: 'RoleId', as: 'otherModules' });
  };

  return Role;
};
