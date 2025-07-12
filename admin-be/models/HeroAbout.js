'use strict';
module.exports = (sequelize, DataTypes) => {
  const HeroAbout = sequelize.define('HeroAbout', {
    header: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: DataTypes.STRING, 
  }, {
    tableName: 'hero_about',
    timestamps: true,
  });

  return HeroAbout;
};
