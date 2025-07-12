const { Setting } = require('../models') // pastikan nama model sesuai

exports.getLogo = async (req, res) => {
  try {
    const setting = await Setting.findOne({ where: { key: 'logo' } })
    res.json(setting || {})
  } catch (err) {
    console.error('GET LOGO ERROR:', err)
    res.status(500).json({ message: 'Gagal mengambil logo' })
  }
}


exports.saveLogo = async (req, res) => {
  try {
    const { value } = req.body
    const [setting, created] = await Setting.findOrCreate({
      where: { key: 'logo' },
      defaults: { value }
    })

    if (!created) {
      setting.value = value
      await setting.save()
    }

    res.json({ message: 'Logo berhasil disimpan', setting })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Gagal menyimpan logo' })
  }
}
