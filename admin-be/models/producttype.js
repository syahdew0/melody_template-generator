module.exports = (sequelize, DataTypes) => {
  const ProductType = sequelize.define('ProductType', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'product_types',
        key: 'id'
      }
    }
  }, {
    tableName: 'product_types',
    timestamps: true
  });

  ProductType.associate = (models) => {
    // Relasi ke ProductDetail
    ProductType.hasMany(models.ProductDetail, {
      foreignKey: 'product_type_id',
      as: 'products'
    });

    // Self-referencing untuk nested
    ProductType.hasMany(models.ProductType, {
      as: 'children',
      foreignKey: 'parent_id'
    });

    ProductType.belongsTo(models.ProductType, {
      as: 'parent',
      foreignKey: 'parent_id'
    });
  };

  return ProductType;
};
