'use strict';
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    website_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    discount_percentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    is_discount_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    product_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    variations: {
      type: DataTypes.JSON,
      allowNull: true
    },
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    content: DataTypes.TEXT,
    excerpt: DataTypes.TEXT,

     author_name: {                
      type: DataTypes.STRING,
      allowNull: true
    },
    author_position: {            
      type: DataTypes.STRING,
      allowNull: true
    },

    thumbnail_url: DataTypes.STRING,
    type: DataTypes.ENUM('post', 'page', 'product', 'testimonial'),
    type_id: DataTypes.INTEGER,
    status: DataTypes.ENUM('draft', 'published', 'trash'),
    template: DataTypes.STRING,
    parent_id: DataTypes.INTEGER,
    published_at: DataTypes.DATE
  }, {
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  Post.associate = function(models) {
    // Relasi ke User dan Website
    Post.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Post.belongsTo(models.Website, { foreignKey: 'website_id', as: 'website' });

    // Relasi Meta
    Post.hasMany(models.PostMeta, { foreignKey: 'post_id', as: 'meta' });

    // Relasi Product Detail (one-to-one)
    Post.hasOne(models.ProductDetail, { foreignKey: 'post_id', as: 'product_detail' });

    // Relasi Post - Category (many-to-many)
    Post.belongsToMany(models.Category, {
      through: models.PostCategory,
      foreignKey: 'post_id',
      otherKey: 'category_id',
      as: 'categories'
    });

    // Relasi PostCategory langsung (optional)
    Post.hasMany(models.PostCategory, { foreignKey: 'post_id', as: 'post_categories' });

    // Relasi ke Brand (optional untuk produk)
    Post.belongsTo(models.Brand, { foreignKey: 'brand_id', as: 'brand' });
  };

  return Post;
};
