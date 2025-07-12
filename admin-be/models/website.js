// models/website.js
// module.exports = (sequelize, DataTypes) => {
//   const Website = sequelize.define('Website', {
//     name: DataTypes.STRING,
//     user_id: DataTypes.INTEGER,
//     subdomain: DataTypes.STRING,
    
//     schema: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//       get() {
//         const raw = this.getDataValue('schema');
//         try {
//           return JSON.parse(raw);
//         } catch {
//           return null;
//         }
//       },
//       set(value) {
//         this.setDataValue('schema', JSON.stringify(value));
//       }
//     }

//   }, {
//     tableName: 'websites',
//     underscored: true
//   });

//   Website.associate = function(models) {
//     Website.hasMany(models.Post, {
//       foreignKey: 'website_id',
//       as: 'website',
//       onDelete: 'NO ACTION',
//       onUpdate: 'NO ACTION',
//     });
//   };

//   return Website;
// };

module.exports = (sequelize, DataTypes) => {
  const Website = sequelize.define('Website', {
    name: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    subdomain: DataTypes.STRING
  }, {
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
