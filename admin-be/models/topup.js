'use strict';
module.exports = (sequelize, DataTypes) => {
  const Topup = sequelize.define('Topup', {
   date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    walletid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reference_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bank_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdon: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdby: {
      type: DataTypes.STRING,
      allowNull: false
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
    tableName: 'topups',
    timestamps: false
  });

  Topup.associate = function (models) {
  Topup.belongsTo(models.Customer, {
    foreignKey: 'username', 
    targetKey: 'username',  
    as: 'Customer',
    constraints: false      
  });

  Topup.belongsTo(models.CompanyBank, {
  foreignKey: 'bank_id',
  as: 'bank',
  constraints: false
});


};

  return Topup;
};
