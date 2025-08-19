'use strict';
module.exports = (sequelize, DataTypes) => {
  const PostImage = sequelize.define('PostImage', {
    post_id: DataTypes.INTEGER,
    image_url: DataTypes.STRING
  }, {
    tableName: 'post_images',
    underscored: true,
  });

  PostImage.associate = function(models) {
    PostImage.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });
  };

  return PostImage;
};
