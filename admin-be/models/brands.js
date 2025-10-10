module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define('Brand', {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    image: { type: DataTypes.STRING }
  }, {
    tableName: 'brands',
    underscored: true
  });

 Brand.associate = (models) => {
  Brand.hasMany(models.Post, { foreignKey: 'brand_id', as: 'posts' });
  Brand.hasMany(models.ProductDetail, { foreignKey: 'brand_id', as: 'product_details' }); 
};


  return Brand;
};
