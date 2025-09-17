'use strict';
module.exports = (sequelize, DataTypes) => {
  const MlmPengaduan = sequelize.define(
    'MlmPengaduan',
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
      },
      created_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'mlm_pengaduans',
      timestamps: true,
    }
  );

  MlmPengaduan.associate = function (models) {
  };

  return MlmPengaduan;
};
