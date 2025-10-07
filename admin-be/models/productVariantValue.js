module.exports = (sequelize, DataTypes) => {
  const ProductVariantValue = sequelize.define('ProductVariantValue', {
    variant_id: { type: DataTypes.INTEGER, allowNull: false },
    option_id: { type: DataTypes.INTEGER, allowNull: false },
    value: DataTypes.STRING
  }, { tableName: 'product_variant_values', underscored: true, timestamps: true });

  ProductVariantValue.associate = (models) => {
    ProductVariantValue.belongsTo(models.ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
    ProductVariantValue.belongsTo(models.ProductVariantOption, { foreignKey: 'option_id', as: 'option' });
    
  };

  return ProductVariantValue;
};
