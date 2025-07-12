'use strict';
module.exports = (sequelize, DataTypes) => {
  const NewsletterSubscriber = sequelize.define('NewsletterSubscriber', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'newsletter_subscribers',
    timestamps: true 
  });

  return NewsletterSubscriber;
};