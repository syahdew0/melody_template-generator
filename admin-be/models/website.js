module.exports = (sequelize, DataTypes) => {
  const Website = sequelize.define('Website', {
    name: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    subdomain: DataTypes.STRING,
    site_title: DataTypes.STRING,
     title: DataTypes.STRING,
    site_description: DataTypes.TEXT,
    admin_email: DataTypes.STRING,
    logo: DataTypes.STRING,
    seo_keywords: DataTypes.TEXT,
    seo_description: DataTypes.TEXT,
    rate: DataTypes.STRING
  }, 
  
  {
    tableName: 'websites',
    underscored: true
  });

  Website.associate = function(models) {
    Website.hasMany(models.Post, {
      foreignKey: 'website_id',
      as: 'website',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    });

    Website.hasMany(models.Theme, {
      foreignKey: 'website_id',
      as: 'themes',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION'
    });
  };

  return Website;
};
