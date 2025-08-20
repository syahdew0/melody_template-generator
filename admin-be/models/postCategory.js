'use strict';
module.exports = (sequelize, DataTypes) => {
  const PostCategory = sequelize.define('PostCategory', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },  
    post_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  }, 
  {
    tableName: 'post_categories',
    underscored: true,
    timestamps: true   
  });

  PostCategory.associate = function(models) {
    PostCategory.belongsTo(models.Post, {
      foreignKey: 'post_id',
      as: 'post',
      onDelete: 'NO ACTION',
    });

    PostCategory.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',
      onDelete: 'NO ACTION',
    });
  };

  return PostCategory;
};
