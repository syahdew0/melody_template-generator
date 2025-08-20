module.exports = (sequelize, DataTypes) => {
const ProductDetail = sequelize.define('ProductDetail', {
  post_id: { type: DataTypes.INTEGER, allowNull: false, field: 'post_id' },
  price: DataTypes.DECIMAL,
  discount_price: DataTypes.DECIMAL,
  discount_until: DataTypes.DATE,
  weight: DataTypes.DECIMAL,
  unit_name: DataTypes.STRING,
  purchase_price: DataTypes.DECIMAL,
  admin_info: DataTypes.TEXT,
  formula_price: DataTypes.STRING,
  is_preorder: DataTypes.BOOLEAN,
  product_type_id: DataTypes.INTEGER,
  minimum_qty: DataTypes.INTEGER,
  stock_integrated: DataTypes.BOOLEAN,
  stock: DataTypes.INTEGER,
  initial_stock: DataTypes.INTEGER,
  dp_percentage: DataTypes.DECIMAL,
  minimum_order: DataTypes.INTEGER,
  dimension: DataTypes.STRING
}, {
  tableName: 'product_details',
  underscored: true,
  timestamps: true,
  getterMethods: {
    isDiscountActive() {
      if (!this.discount_price || !this.discount_until) return false;
      return new Date(this.discount_until) > new Date();
    }
  }
});


  ProductDetail.associate = (models) => {
    ProductDetail.belongsTo(models.Post, {
      foreignKey: 'post_id',
      as: 'post'
    });
  };

  return ProductDetail;
};
