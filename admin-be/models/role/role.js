'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // Many-to-Many dengan Permission
      Role.belongsToMany(models.Permission, {
        through: 'RolePermissions',
        foreignKey: 'RoleId',
        otherKey: 'PermissionId',
        as: 'permissions'
      });
    }
  }
  Role.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: DataTypes.STRING(255)
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'Roles'
    }
  );
  return Role;
};
