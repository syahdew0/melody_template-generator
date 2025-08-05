'use strict';
module.exports = (sequelize, DataTypes) => {
  const CompanyBank = sequelize.define('CompanyBank', {
    bank_name: DataTypes.STRING,
    account_name: DataTypes.STRING,
    account_number: DataTypes.STRING,
  }, {
    tableName: 'company_banks'
  });

  return CompanyBank;
};
