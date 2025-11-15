'use strict';
module.exports = (sequelize, DataTypes) => {
const Listing = sequelize.define('Listing', {
post_id: {
  type: DataTypes.INTEGER.UNSIGNED,
  primaryKey: true,
  autoIncrement: false,
  allowNull: false,
},
listing_type: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
},
price: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: true
},
kondisi: DataTypes.STRING,
latitude: DataTypes.DECIMAL(10,8),
longitude: DataTypes.DECIMAL(11,8),
provinsi: DataTypes.STRING,
kabupaten: DataTypes.STRING,
kecamatan: DataTypes.STRING,
kelurahan: DataTypes.STRING
}, {
tableName: 'listings',
underscored: true,
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at'
});


Listing.associate = function(models) {
  Listing.belongsTo(models.ListingType, { foreignKey: 'listing_type', as: 'listingType' });
  Listing.hasMany(models.ListingValue, { foreignKey: 'post_id', sourceKey: 'post_id', as: 'values' });
  Listing.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });

};

return Listing;
};