'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderDetail = sequelize.define('OrderDetail', {
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    qty: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'orderdetails',
    underscored: true
  });

  OrderDetail.associate = function(models) {
    OrderDetail.belongsTo(models.Order, { 
      foreignKey: 'order_id', 
      as: 'order',
      constraints: false
    });
  };

  // Hook untuk create
  OrderDetail.beforeCreate((detail) => {
    detail.subtotal = detail.qty * detail.price;
  });

  // Hook untuk update
  OrderDetail.beforeUpdate((detail) => {
    detail.subtotal = detail.qty * detail.price;
  });

  return OrderDetail;
};
