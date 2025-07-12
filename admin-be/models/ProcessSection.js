'use strict';
module.exports = (sequelize, DataTypes) => {
    const ProcessSection = sequelize.define('ProcessSection', {
      badgeText: DataTypes.STRING,
      mainTitle: DataTypes.STRING,
      subtitle: DataTypes.TEXT,
      ctaText: DataTypes.STRING,
      ctaLink: DataTypes.STRING,
      steps: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      }
    })
  
    return ProcessSection
  }
  