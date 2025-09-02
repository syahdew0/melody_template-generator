'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      // optional, karena pivot table biasanya diakses via belongsToMany
    }
  }
  RolePermission.init(
    {
      RoleId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      PermissionId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      }
    },
    {
      sequelize,
      modelName: 'RolePermission',
      tableName: 'RolePermissions',
      timestamps: true
    }
  );
  return RolePermission;
};
