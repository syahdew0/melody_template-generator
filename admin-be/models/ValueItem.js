// models/ValueItem.js
module.exports = (sequelize, DataTypes) => {
    const ValueItem = sequelize.define('ValueItem', {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      label: DataTypes.STRING,
    })
  
    return ValueItem
  }
  