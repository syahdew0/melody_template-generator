module.exports = (sequelize, DataTypes) => {
    const ContactHero = sequelize.define('ContactHero', {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      subtitle: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      cta1Text: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cta1Link: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cta2Text: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cta2Path: {
        type: DataTypes.STRING,
        allowNull: true
      }
    });
  
    return ContactHero;
  };
  