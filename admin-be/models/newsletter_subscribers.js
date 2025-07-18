'use strict';
module.exports = (sequelize, DataTypes) => {
  const NewsletterSubscriber = sequelize.define('NewsletterSubscriber', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    
    }
  }, {
    tableName: 'newsletter_subscribers',
    timestamps: true 
  });

  return NewsletterSubscriber;
};