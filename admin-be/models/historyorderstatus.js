'use strict';
module.exports = (sequelize, DataTypes) => {
  const HistoryOrderStatus = sequelize.define('HistoryOrderStatus', {
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
      allowNull: false
    }
  }, {
    tableName: 'history_order_status',
    timestamps: false,
    underscored: true
  });

  HistoryOrderStatus.associate = function(models) {
    HistoryOrderStatus.belongsTo(models.Order, { 
      foreignKey: 'order_id', 
      as: 'order', 
      constraints: false });
  };

  return HistoryOrderStatus;
};
