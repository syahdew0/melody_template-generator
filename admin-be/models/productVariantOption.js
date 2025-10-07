module.exports = (sequelize, DataTypes) => {
  const ProductVariantOption = sequelize.define('ProductVariantOption', {
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    name: DataTypes.STRING
  }, { tableName: 'product_variant_options', underscored: true, timestamps: true });

  ProductVariantOption.associate = (models) => {
    ProductVariantOption.belongsTo(models.Post, { foreignKey: 'product_id', as: 'product' });
    ProductVariantOption.hasMany(models.ProductVariantValue, { foreignKey: 'option_id', as: 'values' });
  };

  return ProductVariantOption;
};
