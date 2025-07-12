'use strict';
module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    name: { type: DataTypes.STRING, allowNull: false },
    path: { type: DataTypes.STRING },
    parentId: { // Tetap camelCase di sini
      type: DataTypes.INTEGER,
      field: 'parent_id' // ← tambahkan ini agar sinkron dengan DB
    },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'menus',
    underscored: true,
  });

  // Self-referencing association (perbaiki foreignKey)
  Menu.hasMany(Menu, { as: 'children', foreignKey: 'parentId' });
  Menu.belongsTo(Menu, { as: 'parent', foreignKey: 'parentId' });

  return Menu;
};
