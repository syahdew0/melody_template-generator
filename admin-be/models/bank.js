'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bank = sequelize.define('Bank', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'banks',
    timestamps: true,           // tetap pakai timestamp
    createdAt: 'created_at',    // sesuaikan nama kolom di DB
    updatedAt: false            // tidak pakai updated_at
  });

  return Bank;
};
