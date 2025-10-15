'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true, allowNull: false },
    description: DataTypes.TEXT,
    website_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    parent_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    display_in: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true } // sudah integer
  }, {
    tableName: 'categories',
    underscored: true,
    timestamps: true
  });

  Category.associate = (models) => {
    // Hierarki kategori
    Category.belongsTo(models.Category, { as: 'parent', foreignKey: 'parent_id', onDelete: 'SET NULL', onUpdate: 'NO ACTION' });
    Category.hasMany(models.Category, { as: 'children', foreignKey: 'parent_id', onDelete: 'SET NULL', onUpdate: 'NO ACTION' });

    // Many-to-many ke Post
    Category.belongsToMany(models.Post, {
      through: models.PostCategory,
      foreignKey: 'category_id',
      otherKey: 'post_id',
      as: 'posts'
    });
    Category.hasMany(models.PostCategory, { foreignKey: 'category_id', as: 'post_categories' });

    // Association ke PostType
    Category.belongsTo(models.PostType, {
      foreignKey: 'display_in',
      as: 'post_type'
    });
  };

  return Category;
};
