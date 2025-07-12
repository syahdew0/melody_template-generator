'use strict';
module.exports = (sequelize, DataTypes) => {
  const PortfolioPreview = sequelize.define('PortfolioPreview', {
    // hero: DataTypes.JSONB,
    // cta: DataTypes.JSONB,
    // projects: DataTypes.JSONB
    hero: DataTypes.TEXT,
    cta: DataTypes.TEXT,
    projects: DataTypes.TEXT
  }, {});
  return PortfolioPreview;
};
