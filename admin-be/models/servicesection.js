'use strict';

module.exports = (sequelize, DataTypes) => {
  const ServiceSection = sequelize.define('ServiceSection', {
    title1: DataTypes.STRING,
    title2: DataTypes.STRING,
    description: DataTypes.TEXT,
    ctaNote: DataTypes.STRING,
    services: DataTypes.JSON
  }, {});

  return ServiceSection;
};
