module.exports = (sequelize, DataTypes) => {
    const HeroHome = sequelize.define("HeroHome", {
      type: {
        type: DataTypes.STRING, // 'static' atau 'slider'
        allowNull: false,
        defaultValue: 'static'
      },
      title: {
        type: DataTypes.STRING
      },
      highlight: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.TEXT
      },
      imageUrl: {
        type: DataTypes.STRING
      },
      ctaText: {
        type: DataTypes.STRING
      },
      ctaLink: {
        type: DataTypes.STRING
      },
      slides: {
        type: DataTypes.TEXT,
        get() {
          const raw = this.getDataValue('slides');
          try {
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        },
        set(val) {
          // Periksa jika bukan array, fallback ke array kosong
          if (Array.isArray(val)) {
            this.setDataValue('slides', JSON.stringify(val));
          } else {
            this.setDataValue('slides', JSON.stringify([]));
          }
        }
      }      
    })
  
    return HeroHome
  }
  