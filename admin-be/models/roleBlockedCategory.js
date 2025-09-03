'use strict';
module.exports = (sequelize, DataTypes) => {
  const RoleBlockedCategory = sequelize.define('RoleBlockedCategory', {
    RoleId: { type: DataTypes.BIGINT, allowNull: false, field: 'RoleId' },
    CategoryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'CategoryId' },
  }, {
    tableName: 'role_blocked_categories',
    underscored: true,
  });

  RoleBlockedCategory.associate = models => {
    RoleBlockedCategory.belongsTo(models.Role, { foreignKey: 'RoleId', as: 'role' });
    RoleBlockedCategory.belongsTo(models.Category, { foreignKey: 'CategoryId', as: 'category' });
  };

  return RoleBlockedCategory;
};
