module.exports = (sequelize, DataTypes) => {
  const AboutPreview = sequelize.define('AboutPreview', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    link: DataTypes.STRING
  }, {
    tableName: 'about_preview', // 👈 WAJIB: pakai nama table dari migration
    timestamps: true
  });

  return AboutPreview;
};
