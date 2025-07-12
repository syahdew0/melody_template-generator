'use strict';
module.exports = (sequelize, DataTypes) => {
  const FormSetting = sequelize.define('FormSetting', {
    formHeader: DataTypes.STRING,
    formLabels: DataTypes.JSON,
    formPlaceholders: DataTypes.JSON,
    subjects: DataTypes.JSON
  }, {});
  return FormSetting;
};
