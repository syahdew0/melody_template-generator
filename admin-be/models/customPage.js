'use strict';
module.exports = (sequelize, DataTypes) => {
  const CustomPage = sequelize.define('CustomPage', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    tag: {
      type: DataTypes.STRING,
      allowNull: true
    },    
    image: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    created_by: DataTypes.STRING,
    updated_by: DataTypes.STRING,
    parent_id: DataTypes.INTEGER,
    items: DataTypes.JSON,
    page: DataTypes.STRING,
    theme_id: DataTypes.INTEGER,

  }, {
    tableName: 'custom_pages',
    underscored: true,
  });

  CustomPage.associate = function (models) {
    CustomPage.belongsTo(models.Theme, {
      foreignKey: 'theme_id',
      as: 'theme'
    });
  };

  return CustomPage;
};
