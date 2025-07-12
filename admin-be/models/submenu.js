'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const SubMenu = sequelize.define('SubMenu', {
    menuId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    route: DataTypes.STRING,
  }, {});
  SubMenu.associate = function(models) {
    SubMenu.belongsTo(models.Menu, { foreignKey: 'menuId', as: 'menu' });
  };
  return SubMenu;
};
