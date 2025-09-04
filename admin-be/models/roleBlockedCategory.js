'use strict';
module.exports = (sequelize, DataTypes) => {
  const RoleCategory = sequelize.define('RoleCategory', {
    RoleId: { type: DataTypes.BIGINT, allowNull: false, field: 'RoleId' },
    CategoryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'CategoryId' },
  }, {
    tableName: 'role_categories',
    underscored: true,
  });

  RoleCategory.associate = models => {
    RoleCategory.belongsTo(models.Role, { foreignKey: 'RoleId', as: 'role' });
    RoleCategory.belongsTo(models.Category, { foreignKey: 'CategoryId', as: 'category' });
  };

  return RoleCategory;
};
