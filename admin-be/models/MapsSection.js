'use strict';

module.exports = (sequelize, DataTypes) => {
  const MapsSection = sequelize.define('MapsSection', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    mapUrl: DataTypes.TEXT,
    mapEmbedUrl: DataTypes.TEXT,
    buttonMapText: DataTypes.STRING,
    buttonShareText: DataTypes.STRING,
  });

  return MapsSection;
};
