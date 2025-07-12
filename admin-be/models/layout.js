module.exports = (sequelize, DataTypes) => {
    const Layout = sequelize.define('Layout', {
      layout_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      tableName: 'layouts',
      timestamps: true
    });
  
    return Layout;
  };
  