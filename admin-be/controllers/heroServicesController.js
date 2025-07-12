const { HeroServices } = require('../models');

// GET Hero Services
exports.getHeroServices = async (req, res) => {
  try {
    const data = await HeroServices.findOne({ where: { id: 1 } });
    res.status(200).json(data || {});
  } catch (error) {
    console.error('Error fetching hero services:', error);
    res.status(500).json({ message: 'Gagal mengambil data Hero Services', error });
  }
};

// UPDATE Hero Services
exports.updateHeroServices = async (req, res) => {
  try {
    const {
      title,
      description,
      headingTitle,
      headingSubtitle,
      cta1Label,
      cta1Link,
      cta2Label,
      cta2Path,
    } = req.body;

    let hero = await HeroServices.findByPk(1);

    if (hero) {
      await hero.update({
        title,
        description,
        headingTitle,
        headingSubtitle,
        cta1Label,
        cta1Link,
        cta2Label,
        cta2Path,
      });
    } else {
      hero = await HeroServices.create({
        id: 1, // ensure always ID 1
        title,
        description,
        headingTitle,
        headingSubtitle,
        cta1Label,
        cta1Link,
        cta2Label,
        cta2Path,
      });
    }

    res.status(200).json(hero);
  } catch (error) {
    console.error('Error updating hero services:', error);
    res.status(500).json({ message: 'Gagal mengupdate Hero Services', error });
  }
};
