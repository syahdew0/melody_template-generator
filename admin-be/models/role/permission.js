'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      // Many-to-Many dengan Role
      Permission.belongsToMany(models.Role, {
        through: 'RolePermissions',
        foreignKey: 'PermissionId',
        otherKey: 'RoleId',
        as: 'roles'
      });
    }
  }
  Permission.init(
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
      modelName: 'Permission',
      tableName: 'Permissions'
    }
  );
  return Permission;
};
