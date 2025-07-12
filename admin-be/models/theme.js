module.exports = (sequelize, DataTypes) => {
    const Theme = sequelize.define('Theme', {
      website_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      description: DataTypes.TEXT,
      schema: {
              type: DataTypes.TEXT,
              allowNull: true,
              get() {
                const raw = this.getDataValue('schema');
                try {
                  return JSON.parse(raw);
                } catch {
                  return null;
                }
              },
              set(value) {
                this.setDataValue('schema', JSON.stringify(value));
              }
            },
      is_active: DataTypes.BOOLEAN
    }, {
      tableName: 'themes',
      underscored: true
    });
  
    Theme.associate = function(models) {
        Theme.belongsTo(models.Website, {
          foreignKey: 'website_id',
          as: 'website',
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION'
        });
      };
  
    return Theme;
  };
  