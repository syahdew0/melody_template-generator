'use strict';
module.exports = (sequelize, DataTypes) => {
  const Portfolio = sequelize.define('Portfolio', {
    heading: DataTypes.STRING,       // untuk header
    subheading: DataTypes.STRING,    // untuk header
    title: DataTypes.STRING,         // untuk item gambar
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    height: DataTypes.STRING         // short | medium | tall
  });

  return Portfolio;
};
