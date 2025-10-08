module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define('ProductVariant', {
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    combination: DataTypes.STRING,
    sku: DataTypes.STRING,
    price: DataTypes.DECIMAL(15,2),
    stock: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, { tableName: 'product_variants', underscored: true, timestamps: true });

  ProductVariant.associate = (models) => {
    ProductVariant.hasMany(models.ProductVariantValue, { foreignKey: 'variant_id', as: 'values' });
    ProductVariant.belongsTo(models.Post, { foreignKey: 'product_id', as: 'product' });
    
  };

  return ProductVariant;
};
