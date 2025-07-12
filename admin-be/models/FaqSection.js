
module.exports = (sequelize, DataTypes) => {
  const FaqSection = sequelize.define('FaqSection', {
    title: DataTypes.STRING,
    subtitle: DataTypes.STRING,
    ctaText: DataTypes.STRING,
    ctaLink: DataTypes.STRING,
    faqs: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('faqs');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('faqs', JSON.stringify(value));
      }
    }
  }, {});
  return FaqSection;
};
