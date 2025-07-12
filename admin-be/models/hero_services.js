'use strict';
module.exports = (sequelize, DataTypes) => {
  const HeroServices = sequelize.define('HeroServices', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    headingTitle: DataTypes.STRING,
    headingSubtitle: DataTypes.STRING,
    cta1Label: DataTypes.STRING,
    cta1Link: DataTypes.STRING,
    cta2Label: DataTypes.STRING,
    cta2Path: DataTypes.STRING
  }, {});
  return HeroServices;
};
