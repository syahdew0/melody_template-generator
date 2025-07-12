
module.exports = (sequelize, DataTypes) => {
    const PostMeta = sequelize.define('PostMeta', {
      post_id: DataTypes.INTEGER.UNSIGNED,
      meta_key: DataTypes.STRING,
      meta_value: DataTypes.TEXT
    }, {
      tableName: 'postmeta',
      underscored: true
    });
  
    PostMeta.associate = function(models) {
      PostMeta.belongsTo(models.Post, { foreignKey: 'post_id' });
    };
  
    return PostMeta;
  };
  