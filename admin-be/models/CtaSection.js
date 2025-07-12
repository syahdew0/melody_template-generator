'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const CtaSection = sequelize.define('CtaSection', {
    badgeText: DataTypes.STRING,
    mainTitle1: DataTypes.STRING,
    mainTitle2: DataTypes.STRING,
    subtitle: DataTypes.TEXT,
    whatsappNumber: DataTypes.STRING,
    portfolioButtonText: DataTypes.STRING,
    portfolioLink: DataTypes.STRING,
    whatsappButtonText: DataTypes.STRING,
    cta1Label: DataTypes.STRING,      // ➕ tambahkan ini
    cta1Link: DataTypes.STRING,       // ➕
    cta2Label: DataTypes.STRING,      // ➕
    cta2Path: DataTypes.STRING        // ➕
  })
  
  return CtaSection;
};
