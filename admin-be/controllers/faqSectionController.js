const { FaqSection } = require('../models');

exports.getFaqSection = async (req, res) => {
  try {
    let section = await FaqSection.findOne();

    // If not found, create default
    if (!section) {
      section = await FaqSection.create({
        title: 'Pertanyaan yang Sering Diajukan',
        subtitle: 'Temukan jawaban untuk pertanyaan yang paling sering ditanyakan tentang layanan kami',
        ctaText: 'Hubungi Kami',
        ctaLink: 'https://wa.me/08xxxxxxxxx',
        faqs: []
      });
    }

    res.json(section);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data FAQ section' });
  }
};

exports.updateFaqSection = async (req, res) => {
  try {
    const { title, subtitle, ctaText, ctaLink, faqs } = req.body;

    let section = await FaqSection.findOne();

    if (!section) {
      section = await FaqSection.create({ title, subtitle, ctaText, ctaLink, faqs });
    } else {
      await section.update({ title, subtitle, ctaText, ctaLink, faqs });
    }

    res.json(section);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menyimpan data FAQ section' });
  }
};
