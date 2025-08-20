'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CustomerAddress extends Model {
    static associate(models) {
      CustomerAddress.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    }
  }
  CustomerAddress.init({
    customer_id: DataTypes.INTEGER,
    recipient_name: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    province: DataTypes.STRING,
    city: DataTypes.STRING,
    district: DataTypes.STRING,
    postal_code: DataTypes.STRING,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    is_default: DataTypes.BOOLEAN,
  }, { sequelize, modelName: 'CustomerAddress', tableName: 'customer_addresses' });
  return CustomerAddress;
};
