'use strict'
module.exports = (sequelize, DataTypes) => {
  const Icon = sequelize.define(
    'Icon',
    {
      key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'icons',
      underscored: true,
    }
  )
  return Icon
}
