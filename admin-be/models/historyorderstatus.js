'use strict';
module.exports = (sequelize, DataTypes) => {
  const HistoryOrderStatus = sequelize.define('HistoryOrderStatus', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Unpaid', 'Paid', 'Cancel', 'Refund', 'Payment Expired'),
      allowNull: false
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'history_order_status',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  HistoryOrderStatus.associate = function(models) {
    HistoryOrderStatus.belongsTo(models.Order, { 
      foreignKey: 'order_id', 
      as: 'order',
      constraints: false  
    });
  };

  return HistoryOrderStatus;
};
