const { CtaSection } = require('../models')

exports.getCta = async (req, res) => {
  try {
    const cta = await CtaSection.findOne()
    res.json(cta)
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data CTA', error })
  }
}

exports.updateCta = async (req, res) => {
  try {
    const [cta] = await CtaSection.findOrCreate({ where: { id: 1 } })
    await cta.update(req.body)
    res.json(cta)
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui CTA', error })
  }
}

exports.updateCta = async (req, res) => {
  try {
    console.log("Data diterima:", req.body); // Debug body
    const [cta] = await CtaSection.findOrCreate({ where: { id: 1 } });
    await cta.update(req.body);
    res.json(cta);
  } catch (error) {
    console.error("Error saat update CTA:", error); // Cetak error lengkap
    res.status(500).json({ message: 'Gagal memperbarui CTA', error });
  }
};

