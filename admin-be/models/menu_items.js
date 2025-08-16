'use strict';

module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define('menu_item', {
    menu_group_id: DataTypes.INTEGER,
    parent_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    path: DataTypes.STRING,
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
  type: DataTypes.BOOLEAN,
  defaultValue: true
}
  }, {
    underscored: true,
    tableName: 'menu_items'
  });

  MenuItem.associate = function(models) {
    MenuItem.belongsTo(models.menu_group, {
      foreignKey: 'menu_group_id',
      as: 'group'
    });

    MenuItem.hasMany(models.menu_item, {
      foreignKey: 'parent_id',
      as: 'children'
    });

    MenuItem.belongsTo(models.menu_item, {
      foreignKey: 'parent_id',
      as: 'parent'
    });
  };

  return MenuItem;
};
