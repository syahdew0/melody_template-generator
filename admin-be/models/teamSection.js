'use strict';
module.exports = (sequelize, DataTypes) => {
  const TeamSection = sequelize.define('TeamSection', {
    type: {
      type: DataTypes.ENUM('header', 'member'),
      allowNull: false
    },
    title: DataTypes.STRING,
    subtitle: DataTypes.STRING,
    image: DataTypes.STRING
  }, {});
  return TeamSection;
};
