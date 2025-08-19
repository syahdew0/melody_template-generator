module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
      website_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
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
      underscored: true
    });
  
    Post.associate = function(models) {
      Post.belongsTo(models.User, { foreignKey: 'user_id' });
      Post.belongsTo(models.Website, { foreignKey: 'website_id' });
      Post.hasMany(models.PostMeta, { foreignKey: 'post_id', as: 'meta' });

      Post.hasOne(models.ProductDetail, {
        foreignKey: 'post_id',
        as: 'product_detail'
      });

      models.PostCategory.belongsTo(Post, {
        foreignKey: 'post_id',
        sourceKey: 'id',
      });
      
      Post.hasMany(models.PostCategory, {
        foreignKey: 'post_id',
        as: 'post_categories'
      });

      Post.belongsToMany(models.Category, {
      through: models.PostCategory,
      foreignKey: 'post_id',
      otherKey: 'category_id',
      as: 'categories'
    });
    Post.hasMany(models.PostImage, {
      foreignKey: 'post_id',
      as: 'images'
    });
    
    };
  
    return Post;
  };
  