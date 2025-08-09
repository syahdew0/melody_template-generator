'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderPayment = sequelize.define('OrderPayment', {
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    payment_proof: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Success', 'Failed'),
      allowNull: false,
      defaultValue: 'Pending'
    }
  }, {
    tableName: 'orderpayments',
    underscored: true
  });

  OrderPayment.associate = function(models) {
    OrderPayment.belongsTo(models.Order, { 
      foreignKey: 'order_id', 
      as: 'order', 
      constraints: false });
  };

  return OrderPayment;
};
