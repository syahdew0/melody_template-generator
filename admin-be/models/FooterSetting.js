// models/FooterSetting.js
module.exports = (sequelize, DataTypes) => {
    const FooterSetting = sequelize.define('FooterSetting', {
      logo: DataTypes.STRING,
      brand: DataTypes.STRING,
      description: DataTypes.TEXT,
      navigation: {
        type: DataTypes.JSON,
        defaultValue: [],
        get() {
          const raw = this.getDataValue('navigation')
          return typeof raw === 'string' ? JSON.parse(raw) : raw
        }
      },
      contact: {
        type: DataTypes.JSON,
        defaultValue: { address: '', phone: '', email: '' },
        get() {
          const raw = this.getDataValue('contact')
          return typeof raw === 'string' ? JSON.parse(raw) : raw
        }
      },
      socials: {
        type: DataTypes.JSON,
        defaultValue: [],
        get() {
          const raw = this.getDataValue('socials')
          return typeof raw === 'string' ? JSON.parse(raw) : raw
        }
      },
      layoutOptions: {
        type: DataTypes.JSON,
        defaultValue: {
          showNavigation: true,
          showContact: true,
          showSocials: true,
          style: 'dark'
        },
        get() {
          const raw = this.getDataValue('layoutOptions')
          return typeof raw === 'string' ? JSON.parse(raw) : raw
        }
      }
    })
  
    return FooterSetting
  }
  