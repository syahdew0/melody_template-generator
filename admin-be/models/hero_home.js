module.exports = (sequelize, DataTypes) => {
  const HeroHome = sequelize.define('HeroHome', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'static'
    },
    title: DataTypes.STRING,
    subtitle: DataTypes.STRING,
    highlight: DataTypes.STRING,
    description: DataTypes.TEXT,
    imageUrl: DataTypes.STRING,
    ctaText: DataTypes.STRING,
    ctaLink: DataTypes.STRING,
    slides: {
      type: DataTypes.TEXT,
      get() {
        const raw = this.getDataValue('slides');
        return raw ? JSON.parse(raw) : [];
      },
      set(val) {
        this.setDataValue('slides', JSON.stringify(val));
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'HeroHomes',
    timestamps: true
  });

  return HeroHome;
};
