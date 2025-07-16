'use strict';

module.exports = (sequelize, DataTypes) => {
  const MenuGroup = sequelize.define('menu_group', {
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    is_top: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_main: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_footer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    underscored: true,
    tableName: 'menu_groups'
  });

  MenuGroup.associate = function(models) {
    MenuGroup.hasMany(models.menu_item, {
      foreignKey: 'menu_group_id',
      as: 'items'
    });
  };

  return MenuGroup;
};
