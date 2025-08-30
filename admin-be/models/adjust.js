'use strict';
module.exports = (sequelize, DataTypes) => {
  const Adjust = sequelize.define('Adjust', {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('in', 'out'),
      allowNull: false
    },
     category: {  
      type: DataTypes.ENUM('saldo', 'point', 'stamp'),
      allowNull: false
    },
    // walletid: {
    //   type: DataTypes.STRING,
    //   allowNull: true
    // },
    reference_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdon: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    createdby: {
      type: DataTypes.STRING,
      allowNull: true
    },
    updatedon: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedby: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'adjusts',
    timestamps: false
  });

  return Adjust;
};
