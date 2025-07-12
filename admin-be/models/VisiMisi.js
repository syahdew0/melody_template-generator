module.exports = (sequelize, DataTypes) => {
  const VisiMisi = sequelize.define('VisiMisi', {
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    visi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    misi: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    stats: DataTypes.JSON
  });

  return VisiMisi;
};
