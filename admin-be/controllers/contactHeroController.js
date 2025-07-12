const db = require('../models');
const ContactHero = db.ContactHero;

// GET hero data
exports.getHero = async (req, res) => {
  try {
    const hero = await ContactHero.findOne();
    res.json(hero);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hero data' });
  }
};

// UPDATE hero data
exports.updateHero = async (req, res) => {
  try {
    const existing = await ContactHero.findOne();

    if (existing) {
      await existing.update(req.body);
      return res.json(existing);
    }

    const created = await ContactHero.create(req.body);
    return res.json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update hero data' });
  }
};
