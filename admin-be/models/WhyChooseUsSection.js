'use strict';

module.exports = (sequelize, DataTypes) => {
  const WhyChooseUs = sequelize.define('WhyChooseUs', {
    title: DataTypes.STRING,
    subtitle: DataTypes.TEXT,
    desc: DataTypes.TEXT,
    icon: DataTypes.STRING,
    type: DataTypes.ENUM('header', 'benefit'),
  });
  return WhyChooseUs;
};
