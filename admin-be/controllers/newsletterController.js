const { NewsletterSettings, NewsletterSubscriber } = require('../models');

// GET settings
exports.getSettings = async (req, res) => {
  const data = await NewsletterSettings.findOne();
  res.json({ newsletter: data });
};

// UPDATE settings
exports.updateSettings = async (req, res) => {
  const { newsletter } = req.body;
  let settings = await NewsletterSettings.findOne();
  if (!settings) {
    settings = await NewsletterSettings.create(newsletter);
  } else {
    await settings.update(newsletter);
  }
  res.json({ message: 'Settings updated successfully' });
};

// GET subscribers
exports.getSubscribers = async (req, res) => {
  const subscribers = await NewsletterSubscriber.findAll({ order: [['createdAt', 'DESC']] });
  res.json(subscribers);
};

// DELETE subscriber
exports.deleteSubscriber = async (req, res) => {
  const id = req.params.id;
  await NewsletterSubscriber.destroy({ where: { id } });
  res.json({ message: 'Subscriber deleted' });
};

// PUBLIC: Subscribe
exports.subscribe = async (req, res) => {
  try {
    console.log('DATA DITERIMA:', req.body); // <--- debug input

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email wajib diisi.' });
    }

    const existing = await NewsletterSubscriber.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    const newSubscriber = await NewsletterSubscriber.create({ email });
    return res.status(201).json(newSubscriber);
  } catch (error) {
    console.error('GAGAL SUBSCRIBE:', error); // <--- debug error
    return res.status(500).json({ message: 'Gagal menyimpan subscriber.' });
  }
};
