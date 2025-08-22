'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    customer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW   
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Unpaid', 'Paid', 'Cancel', 'Refund', 'Payment Expired'),
      allowNull: false,
      defaultValue: 'Unpaid'
    },
  }, {
    tableName: 'orders',
    underscored: true,
    timestamps: true,         
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Order.associate = function(models) {
    Order.hasMany(models.HistoryOrderStatus, { 
      foreignKey: 'order_id', 
      as: 'statusHistory',
      constraints: false 
    });

    Order.hasMany(models.OrderDetail, { 
      foreignKey: 'order_id', 
      as: 'details',
      constraints: false 
    });

    Order.hasMany(models.OrderPayment, { 
      foreignKey: 'order_id', 
      as: 'payments',
      constraints: false 
    });
  };

  return Order;
};
