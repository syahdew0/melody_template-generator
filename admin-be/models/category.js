'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },    
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
    website_id: DataTypes.INTEGER,
  }, {
    tableName: 'categories',
    underscored: true,
  });

  Category.associate = (models) => {
    Category.hasMany(models.PostCategory, {
      foreignKey: 'category_id',
      as: 'post_categories',
      onDelete: 'NO ACTION',
    });
    Category.belongsToMany(models.Post, {
      through: models.PostCategory,
      foreignKey: 'category_id',
      otherKey: 'post_id',
      as: 'posts'
    });
  };

  return Category;
};
