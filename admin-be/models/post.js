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
    thumbnail_url: DataTypes.STRING,
    type: DataTypes.ENUM('post', 'page', 'product', 'testimonial'),
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
    // Relasi user & website
    Post.belongsTo(models.User, { foreignKey: 'user_id' });
    Post.belongsTo(models.Website, { foreignKey: 'website_id' });

    // Meta
    Post.hasMany(models.PostMeta, { foreignKey: 'post_id', as: 'meta' });

    // Product detail
    Post.hasOne(models.ProductDetail, {
      foreignKey: 'post_id',
      as: 'product_detail'
    });

    // Post-Category many to many
    Post.belongsToMany(models.Category, {
      through: models.PostCategory,
      foreignKey: 'post_id',
      otherKey: 'category_id',
      as: 'categories'
    });

    // Untuk include pivot table juga
    Post.hasMany(models.PostCategory, {
      foreignKey: 'post_id',
      as: 'post_categories'
    });

    // Post Images
    Post.hasMany(models.PostImage, {
      foreignKey: 'post_id',
      as: 'images'
    });
    
  };

  return Post;
};
