'use strict';
module.exports = (sequelize, DataTypes) => {
const ListingType = sequelize.define('ListingType', {
id: {
type: DataTypes.INTEGER.UNSIGNED,
primaryKey: true,
autoIncrement: true
},
name: {
type: DataTypes.STRING,
allowNull: false
},
parameter: {
type: DataTypes.JSON,
allowNull: true
}
}, {
tableName: 'listing_types',
underscored: true,
timestamps: true
});


ListingType.associate = function(models) {
ListingType.hasMany(models.Listing, { foreignKey: 'listing_type' });
};


return ListingType;
};