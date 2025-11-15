'use strict';
module.exports = (sequelize, DataTypes) => {
const ListingValue = sequelize.define('ListingValue', {
id: {
type: DataTypes.INTEGER.UNSIGNED,
primaryKey: true,
autoIncrement: true
},
post_id: {
type: DataTypes.INTEGER.UNSIGNED,
allowNull: false
},
tag_name: {
type: DataTypes.STRING,
allowNull: false
},
language_id: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 1
},
value: {
type: DataTypes.TEXT,
allowNull: true
}
}, {
tableName: 'listing_values',
underscored: true,
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at'
});


ListingValue.associate = function(models) {
  ListingValue.belongsTo(models.Listing, { foreignKey: 'post_id', targetKey: 'post_id', as: 'listing' });
};



return ListingValue;
};