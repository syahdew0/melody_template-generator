'use strict';
module.exports = (sequelize, DataTypes) => {
  const NewsletterSettings = sequelize.define('NewsletterSettings', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    placeholder: DataTypes.STRING,
    button: DataTypes.STRING,
    submitting: DataTypes.STRING
  }, {
    tableName: 'newsletter_settings'
  });
  return NewsletterSettings;
};
