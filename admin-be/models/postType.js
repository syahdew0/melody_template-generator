'use strict';
module.exports = (sequelize, DataTypes) => {
  const PostType = sequelize.define('PostType', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
  }, {
    tableName: 'post_types',
    underscored: true,
    timestamps: true
  });

  PostType.associate = (models) => {
    // Relasi ke Category
    PostType.hasMany(models.Category, {
      foreignKey: 'display_in',
      sourceKey: 'name', // karena Category.display_in menyimpan 'name'
      as: 'categories'
    });
  };

  return PostType;
};
